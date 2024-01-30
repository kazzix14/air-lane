import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect, json } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { err, ok } from "neverthrow";
import { client } from "~/database/client.server";
import { safeParseJson, uniquifyArray } from "~/util.server";
import { Project } from "~/database/types";
import { z } from "zod";

export const zNewNodeInput = z.array(
  z.object({
    caller: z.string(),
    callee: z.string(),
  })
);

type LoaderData = {
  projects: Array<Project>;
};
export const loader = async ({ context }: ActionFunctionArgs) => {
  const db = client(context.env.AIR_LANE_DB);

  const projects = await db
    .selectFrom("Project")
    .select(["Project.id", "Project.name"])
    .execute();

  return json({ projects });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const db = client(context.env.AIR_LANE_DB);

  const rawInput = (await request.formData()).get("input-json");

  if (rawInput === null) {
    throw new Error("input is null");
  }

  const inputs = ok(rawInput.toString())
    .andThen((text) => safeParseJson(text))
    .andThen((json) => {
      const maybeInput = zNewNodeInput.safeParse(json);

      if (maybeInput.success) {
        return ok(maybeInput.data);
      } else {
        return err(maybeInput.error.toString());
      }
    })
    ._unsafeUnwrap();

  const uniqueNodeNames = uniquifyArray(
    inputs.flatMap((input) => [input.callee, input.caller])
  );

  await db
    .insertInto("Node")
    // とりあえずnameをidとする
    .values(uniqueNodeNames.map((nodeName) => ({ name: nodeName })))
    .onConflict((oc) => oc.column("name").doNothing())
    .execute();

  const nodes = await db
    .selectFrom("Node")
    .where("Node.name", "in", uniqueNodeNames)
    .selectAll()
    .execute();

  await db
    .insertInto("Edge")
    .values(
      inputs.map((input) => ({
        sourceNodeId: nodes.find((node) => node.name === input.caller)!.id,
        targetNodeId: nodes.find((node) => node.name === input.callee)!.id,
      }))
    )
    .onConflict((oc) => oc.doNothing())
    .execute();

  return redirect(`/nodes`);
};

export default function NewNode() {
  const { projects } = useLoaderData<LoaderData>();

  return (
    <div>
      <Link to="/nodes"> Nodes </Link>
      <Form action="/nodes/new" method="post">
        <select name="project_id">
          {projects.map((project, index) => {
            return (
              <option key={index} value={String(project.id)}>
                {project.name}
              </option>
            );
          })}
        </select>
        <textarea name="input-json"></textarea>
        <button type="submit"> Submit </button>
      </Form>
    </div>
  );
}
