/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Graph } from "./graph";

/* eslint-disable @typescript-eslint/no-explicit-any */
const S = ["a", "b", "e"];

// Reverse order iteration allows us to avoid reordering the tree when encountering a Kleene star
// Union, however, will require reordering
type Leaf = {
  type: "letter" | "start" | "end";
  value: string;
};

const nodeTypes = ["union", "*", "word"];
type NodeType = "union" | "*" | "word" | "overflow";

type Node = {
  type: NodeType;
  children: (Leaf | Node)[];
};

export function regexToAST(regex: string): Node {
  let i = regex.length - 1;
  const tree = {
    type: "word",
    children: [],
  } as Node;
  let isEnd = true;
  function walk(parent: {
    type: string;
    children: (Leaf | Node)[];
  }): Leaf | Node {
    if (S.includes(regex[i] ?? "")) {
      if (isEnd) {
        isEnd = false;
        return {
          type: "end" as const,
          value: regex[i--]!,
        };
      }
      let temp = i - 1;
      while (regex[temp] === "(") {
        temp--;
      }
      if (regex[temp] === "$") {
        const start = {
          type: "start" as const,
          value: regex[i--]!,
        };
        // $ signifies that we are at the start of the string
        return start;
      }
      return {
        type: "letter" as const,
        value: regex[i--]!,
      };
    }

    if (regex[i] === "*") {
      i--;
      const node = {
        type: "*" as const,
        children: [] as (Leaf | Node)[],
      };
      node.children.push(walk(node));
      return node;
    }

    if (regex[i] === "+") {
      i--;
      console.log("union parent children", parent.children);
      const node = {
        type: "union" as const,
        children: [parent.children.pop()!],
      };
      node.children.push(walk(node));
      return node;
    }

    if (regex[i] === ")") {
      i--;
      const node = {
        type: "word" as const,
        children: [] as (Leaf | Node)[],
      };

      while (regex[i] !== "(") {
        node.children.push(walk(node));
      }
      i--;
      return node;
    }
    if (regex[i] === "$") {
      i--;
      return {
        type: "overflow" as const,
        children: [],
      };
    }

    throw new Error("Unexpected symbol: " + regex[i]);
  }

  tree.children = [...(walk(tree) as Node).children];
  tree.children = tree.children.filter((child) => child.type !== "overflow");

  return tree;
}

export function astToEpsilonNFA(ast: Node) {
  const nfa = new Graph();
  nfa.addVertex("final");
  let counter = 0;
  walk(ast, "final");

  // Recursively walk the AST and add edges to the NFA, returns attachToId

  // Returns the id of the vertex that was created
  function walk(node: Node | Leaf, attachTo: string): string {
    if (node.type === "start") {
      nfa.addVertex("start");
      nfa.addEdge("start", attachTo, node.value);
      counter++;
      return "start";
    }
    if (node.type === "letter" || node.type === "end") {
      const letterNodeId = counter.toString();
      nfa.addVertex(letterNodeId);
      nfa.addEdge(letterNodeId, attachTo, node.value);
      counter++;
      return letterNodeId;
    }
    if (node.type === "word") {
      let i = 0;
      let prevChild = attachTo;
      let lastChild = "";
      while (i < node.children.length) {
        prevChild = walk(node.children[i]!, prevChild);
        if (i === node.children.length - 1) {
          lastChild = prevChild;
        }
        i++;
      }
      return lastChild;
    }
    if (node.type === "union") {
      const firstChild = walk(node.children[0]!, attachTo);
      const secondChild = walk(node.children[1]!, attachTo);
      if (firstChild === "start" || secondChild === "start") {
        // Get copies. Not references.
        const firstChildEdges = nfa
          .getEdges(firstChild)
          ?.map((edge) => ({ vertex: edge.vertex, letter: edge.letter }));
        const secondChildEdges = nfa
          .getEdges(secondChild)
          ?.map((edge) => ({ vertex: edge.vertex, letter: edge.letter }));
        nfa.removeVertex(firstChild);
        nfa.removeVertex(secondChild);
        nfa.addVertex("start");
        if (firstChildEdges) {
          for (const edge of firstChildEdges) {
            nfa.addEdge("start", edge.vertex, edge.letter);
          }
        }
        if (secondChildEdges) {
          for (const edge of secondChildEdges) {
            nfa.addEdge("start", edge.vertex, edge.letter);
          }
        }
        return "start";
      }

      const secondChildEdges = nfa
        .getEdges(secondChild)
        ?.map((edge) => ({ vertex: edge.vertex, letter: edge.letter }));

      nfa.removeVertex(secondChild);
      if (secondChildEdges) {
        for (const edge of secondChildEdges) {
          nfa.addEdge(firstChild, edge.vertex, edge.letter);
        }
      }
      return firstChild;
    }
    if (node.type === "*") {
      const kleeneId = "*" + counter.toString();
      counter++;
      nfa.addVertex(kleeneId);
      nfa.addEdge(kleeneId, attachTo, "e");
      const child = walk(node.children[0]!, kleeneId);
      nfa.addEdge(kleeneId, child, "e");
      return kleeneId;
    }

    throw new Error("Unexpected node type from " + JSON.stringify(node));
  }

  return nfa;
}

function getEpsilonClosure(enfa: Graph, vertex: string) {
  const closure = new Set<string>();
  function walk(vertex: string) {
    const edges = enfa.getEdges(vertex);
    closure.add(vertex);
    if (!edges) return;
    for (const edge of edges) {
      if (edge.letter === "e") {
        closure.add(edge.vertex);
        walk(edge.vertex);
      }
    }
  }
  walk(vertex);
  return closure;
}

function getLetterMoves(enfa: Graph, vertex: string) {
  const moves = new Set<{ vertex: string; letter: string }>();
  const edges = enfa.getEdges(vertex);
  if (!edges) return moves;
  for (const edge of edges) {
    if (edge.letter !== "e") {
      moves.add(edge);
    }
  }
  return moves;
}

export function epsilonNFAtoNFA(enfa: Graph) {
  // From here to the line that starts "const nfa = new Graph" is to make the new graph a new object,
  // not a reference to the old one
  const adjList = new Map<string, { vertex: string; letter: string }[]>();
  for (const [vertex, edges] of enfa.getAdjacencyList().entries()) {
    adjList.set(
      vertex,
      edges.map((edge) => ({ vertex: edge.vertex, letter: edge.letter })),
    );
  }
  const incomingEdges = new Map<string, { vertex: string; letter: string }[]>();
  for (const [vertex, edges] of enfa.getIncomingEdges().entries()) {
    incomingEdges.set(
      vertex,
      edges.map((edge) => ({ vertex: edge.vertex, letter: edge.letter })),
    );
  }
  const nfa = new Graph(adjList, incomingEdges);
  // Add epsilon closures
  for (const [vertex, edges] of nfa.getAdjacencyList().entries()) {
    const closure = getEpsilonClosure(nfa, vertex);
    for (const v of closure) {
      const letterMoves = getLetterMoves(nfa, v);
      for (const letterMove of letterMoves) {
        const closure2 = getEpsilonClosure(nfa, letterMove.vertex);
        for (const v2 of closure2) {
          nfa.addEdge(vertex, v2, letterMove.letter);
        }
      }
    }
    for (const edge of edges) {
      if (edge.letter !== "e") {
        const closure = getEpsilonClosure(nfa, edge.vertex);
        for (const v of closure) {
          nfa.addEdge(vertex, v, edge.letter);
        }
      }
    }
  }
  // Remove epsilon edges
  for (const [vertex, edges] of nfa.getAdjacencyList().entries()) {
    for (const edge of edges) {
      if (edge.letter === "e") {
        nfa.removeEdge(vertex, edge.vertex, edge.letter);
      }
    }
  }
  // Remove predictably useless edges
  for (const vertex of nfa.getAdjacencyList().keys()) {
    if (vertex.includes("*")) {
      nfa.removeVertex(vertex);
    }
  }
  // Remove vertices accessible only by previously existent epsilon edges
  // for (const [vertex, edges] of nfa.getIncomingEdges().entries()) {
  //   if (vertex === "start") continue;
  //   let allEdgesEpsilon = true;
  //   for (const edge of edges) {
  //     if (edge.letter !== "e") {
  //       allEdgesEpsilon = false;
  //       break;
  //     }
  //   }
  //   if (allEdgesEpsilon) nfa.removeVertex(vertex);
  // }
  return nfa;
}
