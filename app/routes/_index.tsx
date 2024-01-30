import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
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

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <Link to="/nodes"> Nodes </Link>
      <Link to="/nodes/new"> New Nodes </Link>
      <Link to="/projects"> Projects </Link>
      <Link to="/projects/new"> New Projects </Link>
      <h1>Welcome to Remix</h1>
    </div>
  );
}
