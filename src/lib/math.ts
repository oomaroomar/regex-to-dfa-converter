/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Graph } from "./graph";

/* eslint-disable @typescript-eslint/no-explicit-any */
const S = ["a", "b", "e"];

// Reverse order iteration allows us to avoid reordering the tree when encountering a Kleene star
// Union, however, will require reordering
type Leaf = {
  type: "letter";
  value: string;
};

type Node = {
  type: "union" | "*" | "word";
  children: (Leaf | Node)[];
};

export function regexToAST(regex: string): Node {
  let i = regex.length - 1;

  const tree = {
    type: "word" as const,
    children: [] as (Leaf | Node)[],
  };

  function walk(parent: {
    type: string;
    children: (Leaf | Node)[];
  }): Leaf | Node {
    if (S.includes(regex[i] ?? "")) {
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

    if (regex[i] === "|") {
      i--;
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
    throw new Error("Unexpected symbol: " + regex[i]);
  }

  tree.children.push(walk(tree));

  return tree;
}

// Append right children after left children
export function astToEpsilonNFA(ast: Node) {
  const nfa = new Graph();
  nfa.addVertex("final");
  let counter = 0;
  walk(ast, "final");

  // Recursively walk the AST and add edges to the NFA, returns attachToId

  function walk(node: Node | Leaf, attachTo: string): string {
    if (node.type === "letter") {
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
    throw new Error("Unexpected node type: " + node.type);
  }

  return nfa;
}
