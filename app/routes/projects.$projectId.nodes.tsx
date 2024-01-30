import { json, redirect } from "@remix-run/cloudflare";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { client } from "~/database/client.server";
import { z } from "zod";
import { Table } from "~/components/table";

export const zNodesInput = z.object({
  onlyEntrypoint: z.boolean().nullable(),
  onlyTargeted: z.boolean().nullable(),
  name: z.string().nullable(),
});

const parseBooleanSearchParam = async (searchParam: string | null) => {
  if (searchParam === "true") {
    return true;
  } else {
    return false;
  }
};

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const projectId = z.coerce.number().int().positive().parse(params.projectId);

  if (request.method === "DELETE") {
    const db = client(context.env.AIR_LANE_DB);

    await db.deleteFrom("Edge").where("projectId", "=", projectId).execute();
    await db.deleteFrom("Node").where("projectId", "=", projectId).execute();
  }

  redirect(`/projects/${projectId}/nodes`);

  return null;
};

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const db = client(context.env.AIR_LANE_DB);

  const projectId = z.coerce.number().int().positive().parse(params.projectId);
  const searchParams = new URL(request.url).searchParams;

  const name = searchParams.get("name");

  const onlyEntrypoint = await parseBooleanSearchParam(
    searchParams.get("onlyEntrypoint")
  );

  const onlyTargeted = await parseBooleanSearchParam(
    searchParams.get("onlyTargeted")
  );

  let query = db
    .selectFrom("Node")
    .where("Node.projectId", "=", projectId)
    .selectAll();

  if (onlyEntrypoint === true) {
    query = query
      .leftJoin("Edge as targetedEdge", "targetedEdge.targetNodeId", "Node.id")
      .where("targetedEdge.id", "is", null);
  }

  if (onlyTargeted === true) {
    query = query
      .leftJoin("Edge as sourcedEdge", "sourcedEdge.sourceNodeId", "Node.id")
      .where("sourcedEdge.id", "is", null);
  }

  if (name != null && name != "") {
    query = query.where("Node.name", "like", `%${name}%`);
  }

  const nodes = await query.execute();

  return json({ projectId, name, onlyEntrypoint, onlyTargeted, nodes });
};

export default function () {
  const { projectId, name, onlyEntrypoint, onlyTargeted, nodes } =
    useLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    <div>
      <div className="flex">
        <Form
          action={`/projects/${projectId}/nodes`}
          method="GET"
          role="search"
          className="grow flex flex-col gap-2 mb-4"
          onChange={(e) => {
            const isFirstSearch =
              name === null && onlyEntrypoint === null && onlyTargeted === null;

            submit(e.currentTarget, {
              replace: !isFirstSearch,
            });
          }}>
          <div className="flex gap-4">
            <div className="flex gap-1">
              <input
                type="checkbox"
                id="onlyEntrypoint"
                name="onlyEntrypoint"
                value="true"
                className="peer cursor-pointer mt-[0.1rem]"
              />
              <label
                htmlFor="onlyEntrypoint"
                className="cursor-pointer peer-hover:opacity-50">
                Only Entrypoint
              </label>
            </div>

            <div className="flex gap-1">
              <input
                type="checkbox"
                id="onlyTargeted"
                name="onlyTargeted"
                value="true"
                className="peer cursor-pointer mt-[0.1rem]"
                defaultValue={name ?? ""}
              />
              <label
                htmlFor="onlyTargeted"
                className="cursor-pointer peer-hover:opacity-50">
                Only Targeted
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <label htmlFor="name" className="cursor-pointer">
              Name Search
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="rounded border w-96 px-1"
            />
          </div>
        </Form>

        <div className="flex gap-2">
          <div className="flex">
            <Link
              to="/nodes/new"
              className="h-fit rounded py-1 px-2 bg-green-500 text-white hover:cursor-pointer hover:opacity-50">
              Add Nodes
            </Link>
          </div>

          <Form action={`/projects/${projectId}/nodes`} method="DELETE">
            <button
              type="submit"
              className="h-fit rounded py-1 px-2 bg-red-500 text-white hover:cursor-pointer hover:opacity-50">
              Delete Nodes
            </button>
          </Form>
        </div>
      </div>

      <Table
        children={nodes.map((node) => {
          return { link: `/nodes/${node.id}`, content: node.name };
        })}
      />
    </div>
  );
}
