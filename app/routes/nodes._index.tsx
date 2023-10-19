import { json } from "@remix-run/cloudflare";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { client } from "~/database/client.server";
import type { Node } from "~/database/types";
import { z } from "zod";

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

type LoaderData = {
  nodes: Array<Node>;
};

export const loader: LoaderFunction = async ({ context, request }) => {
  const db = client(context.env.AIR_LANE_DB);

  const searchParams = new URL(request.url).searchParams;

  const onlyEntrypoint = await parseBooleanSearchParam(
    searchParams.get("onlyEntrypoint")
  );

  const onlyTargeted = await parseBooleanSearchParam(
    searchParams.get("onlyTargeted")
  );
  const name = searchParams.get("name");

  let query = db
    .selectFrom("Node")
    .select(["Node.id", "Node.name", "Node.filename", "Node.line"]);

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

  return json({ nodes });
};

export default function () {
  const { nodes } = useLoaderData<LoaderData>();
  const submit = useSubmit();

  return (
    <div>
      <div className="rounded shadow p-8 bg-white">
        <div className="flex justify-between">
          <Form
            action="/nodes"
            method="GET"
            role="search"
            className="flex flex-col gap-2 mb-4"
            onChange={(e) => submit(e.currentTarget)}>
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

          <div className="flex">
            <Link
              to="/nodes/new"
              className="h-fit rounded py-1 px-2 bg-green-500 text-white hover:cursor-pointer hover:opacity-50">
              Add Nodes
            </Link>
          </div>
        </div>

        <ul className="divide-y divide-solid">
          {nodes?.map((node, index) => (
            <li key={index} className="p-1">
              <Link to={`/nodes/${node.id}`} className="hover:opacity-50">
                {node.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
