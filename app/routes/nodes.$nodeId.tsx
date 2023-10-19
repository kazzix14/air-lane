import { json } from "@remix-run/cloudflare";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { client } from "~/database/client.server";
import type { Edge, Node } from "~/database/types";
import { z } from "zod";
import { createRef, useEffect } from "react";
import * as d3 from "d3";
import dagreD3 from "dagre-d3";
import { sql } from "kysely";
import { uniquifyArray } from "~/util.server";
import "../custom.dagre.css";

interface EdgeWithDepth extends Edge {
  depth: number;
}
type LoaderData = {
  node: Node;
  relatedNodes: Array<Node>;
  ancestorEdges: Array<EdgeWithDepth>;
  descendantEdges: Array<EdgeWithDepth>;
};

export const loader: LoaderFunction = async ({ context, params }) => {
  const db = client(context.env.AIR_LANE_DB);

  const nodeId = z.coerce.number().int().positive().parse(params.nodeId);
  const nodeQuery = db
    .selectFrom("Node")
    .where("Node.id", "=", nodeId)
    .selectAll()
    .limit(1);
  const node = await nodeQuery.executeTakeFirstOrThrow();

  const descendantEdgesQuery = db
    .withRecursive("descendantEdges", (qb) => {
      return qb
        .selectFrom("Edge")
        .select([
          "Edge.id",
          "Edge.sourceNodeId",
          "Edge.targetNodeId",
          sql<number>`1`.as("depth"),
        ])
        .where("Edge.sourceNodeId", "=", nodeId)
        .unionAll(
          qb
            .selectFrom("Edge")
            .select([
              "Edge.id",
              "Edge.sourceNodeId",
              "Edge.targetNodeId",
              sql<number>`descendantEdges.depth + 1`.as("depth"),
            ])
            .innerJoin(
              "descendantEdges",
              "descendantEdges.targetNodeId",
              "Edge.sourceNodeId"
            )
        );
    })
    .selectFrom("descendantEdges")
    .select([
      "descendantEdges.id",
      "descendantEdges.sourceNodeId",
      "descendantEdges.targetNodeId",
      "descendantEdges.depth",
    ]);

  const ancestorEdgesQuery = db
    .withRecursive("ancestorEdges", (qb) => {
      return qb
        .selectFrom("Edge")
        .select([
          "Edge.id",
          "Edge.sourceNodeId",
          "Edge.targetNodeId",
          sql<number>`-1`.as("depth"),
        ])
        .where("Edge.targetNodeId", "=", nodeId)
        .union(
          qb
            .selectFrom("Edge")
            .select([
              "Edge.id",
              "Edge.sourceNodeId",
              "Edge.targetNodeId",
              sql<number>`ancestorEdges.depth - 1`.as("depth"),
            ])
            .innerJoin(
              "ancestorEdges",
              "ancestorEdges.sourceNodeId",
              "Edge.targetNodeId"
            )
        );
    })
    .selectFrom("ancestorEdges")
    .select([
      "ancestorEdges.id",
      "ancestorEdges.sourceNodeId",
      "ancestorEdges.targetNodeId",
      "ancestorEdges.depth",
    ]);

  const descendantEdges = await descendantEdgesQuery.execute();
  const ancestorEdges = await ancestorEdgesQuery.execute();

  const relatedNodeIds = uniquifyArray([
    ...descendantEdges.flatMap((edge) => [
      edge.sourceNodeId,
      edge.targetNodeId,
    ]),
    ...ancestorEdges.flatMap((edge) => [edge.sourceNodeId, edge.targetNodeId]),
  ]);

  const relatedNodes = await db
    .selectFrom("Node")
    .where("Node.id", "in", relatedNodeIds)
    .selectAll()
    .execute();

  return json({ node, relatedNodes, ancestorEdges, descendantEdges });
};

const renderGraph = (data: {
  node: Node;
  relatedNodes: Array<Node>;
  ancestorEdges: Array<EdgeWithDepth>;
  descendantEdges: Array<EdgeWithDepth>;
}): dagreD3.graphlib.Graph => {
  const graph = new dagreD3.graphlib.Graph({
    directed: true,
    multigraph: false,
    compound: true,
  });

  // https://github.com/dagrejs/dagre/wiki#configuring-the-layout
  graph.setGraph({
    rankdir: "TB",
    ranker: "network-simplex",
    //ranker: "longest-path",
    //ranksep: 20,
    marginx: 20,
    marginy: 20,
  });

  graph.setNode(data.node.id.toString(), {
    label: data.node.name,
    shape: "rect",
    class: "my-node my-node-root",
  });

  data.relatedNodes
    .filter((node) => node.id !== data.node.id)
    .forEach((node) => {
      graph.setNode(node.id.toString(), {
        //label: node.name,
        labelType: "html",
        label: `<a href="/nodes/${node.id}">${node.name}</a>`,
        shape: "rect",
        class: "my-node",
      });
    });

  data.descendantEdges.forEach((edge) => {
    graph.setEdge(edge.sourceNodeId.toString(), edge.targetNodeId.toString(), {
      //label: edge.depth.toString(),
      class: "my-edge",
      style: "stroke: black; stroke-width: 2px; fill: none;",
      arrowhead: "normal",
      lineInterpolate: "bundle",
      lineTension: 0.5,
    });
  });

  data.ancestorEdges.forEach((edge) => {
    graph.setEdge(edge.sourceNodeId.toString(), edge.targetNodeId.toString(), {
      //label: edge.depth.toString(),
      class: "my-edge",
      style: "stroke: black; stroke-width: 2px; fill: none;",
      arrowhead: "normal",
      lineInterpolate: "bundle",
      lineTension: 0.5,
    });
  });

  return graph;
};

export default function ShowNode() {
  const data = useLoaderData<LoaderData>();
  const { node, relatedNodes, ancestorEdges, descendantEdges } = data;
  const ref = createRef<SVGSVGElement>();

  useEffect(() => {
    if (
      ref.current != null &&
      node != null &&
      ancestorEdges != null &&
      descendantEdges != null
    ) {
      const graph = renderGraph({
        node,
        relatedNodes,
        ancestorEdges,
        descendantEdges,
      } as LoaderData);

      const render: any = new dagreD3.render();

      d3.select(ref.current).call(render, graph);
    }
  }, [ref, node, relatedNodes, ancestorEdges, descendantEdges]);

  return (
    <div>
      <Link
        to="/nodes"
        className="h-fit rounded py-1 px-2 bg-slate-500 text-white hover:cursor-pointer hover:opacity-50">
        Back to Nodes
      </Link>

      <svg ref={ref} className="h-fit w-[6000px] overflow-visible"></svg>
    </div>
  );
}
