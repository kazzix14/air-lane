import type { MetaFunction } from "@remix-run/cloudflare";
import { z } from "zod";
import { Table } from "~/components/table";

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
      <h1>Welcome to Remix</h1>
      <Table children={[
        { link: "/nodes", content: "Nodes" },
        { link: "/nodes/new", content: "New Nodes" },
        { link: "/projects", content: "Projects" },
        { link: "/projects/new", content: "New Projects" },
      ]}/>
    </div>
  );
}
