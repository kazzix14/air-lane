import { Form, Link } from "@remix-run/react";
import { redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { client } from "~/database/client.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const db = client(context.env.AIR_LANE_DB);

  const rawInput = (await request.formData()).get("name");

  if (rawInput === null) {
    throw new Error("input is null");
  }

  await db
    .insertInto("Project")
    .values({ name: rawInput.toString() })
    .execute();

  return redirect("/");
};

export default function NewProject() {
  return (
    <div>
      <Link to="/projects"> Projects </Link>
      <Form action="/projects/new" method="post">
        <label htmlFor="name">Name</label>
        <input type="text" name="name"></input>
        <button type="submit"> Submit </button>
      </Form>
    </div>
  );
}
