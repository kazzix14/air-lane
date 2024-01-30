import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { client } from "~/database/client.server";
import { Table } from "~/components/table";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const db = client(context.env.AIR_LANE_DB);

  var query = db.selectFrom("Project").select(["Project.id", "Project.name"]);

  const searchParams = new URL(request.url).searchParams;
  const name = searchParams.get("name");

  if (name != null && name != "") {
    query = query.where("Project.name", "like", `%${name}%`);
  }

  const projects = await query.execute();

  return json({ name, projects });
};

export default function NewProject() {
  const { name, projects } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    <div>
      <div className="flex justify-between">
        <Form
          action="/projects"
          method="GET"
          role="search"
          className="flex flex-col gap-2 mb-4"
          onChange={(e) => {
            const isFirstSearch = name === null;

            submit(e.currentTarget, {
              replace: !isFirstSearch,
            });
          }}>
          <div className="flex gap-2">
            <label htmlFor="name" className="cursor-pointer">
              Name Search
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="rounded border w-96 px-1"
              defaultValue={name ?? ""}
            />
          </div>
        </Form>

        <div className="flex">
          <Link
            to="/projects/new"
            className="h-fit rounded py-1 px-2 bg-green-500 text-white hover:cursor-pointer hover:opacity-50">
            Add Project
          </Link>
        </div>
      </div>

      <Table
        children={projects.map((project) => {
          return {
            link: `/projects/${project.id}/nodes`,
            content: project.name,
          };
        })}
      />
    </div>
  );
}
