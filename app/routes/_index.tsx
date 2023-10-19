import { json } from "@remix-run/cloudflare";
import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import type { Env } from "types/env";
import { z } from "zod";

export const zEdge = z.object({
  caller: z.string(),
  callee: z.string(),
});

export const zEdges = z.array(zEdge);
export type Edge = z.infer<typeof zEdge>;
export type Edges = z.infer<typeof zEdges>;

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ context }) => {
  const env = context.env as Env;
  const key =
    "/rails_app/app/services/app_payments/charges/create_service.rb#open";
  const edges = (await env.AIR_LANE_KV.get(key, "json")) as Array<Edge>;

  return json({ edges });
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Link to="/nodes"> Nodes </Link>
      <Link to="/nodes/new"> New Nodes </Link>
      <h1>Welcome to Remix</h1>
    </div>
  );
}
