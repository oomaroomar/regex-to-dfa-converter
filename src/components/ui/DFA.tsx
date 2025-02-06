import { astToEpsilonNFA, regexToAST } from "~/lib/math";

export default function DFA({ regex }: { regex: string }) {
  const ast = regexToAST("(" + regex + ")");
  console.log(ast);
  const nfa = astToEpsilonNFA(ast);
  console.log(nfa.getAdjacencyList());
  return <div className="h-full">{JSON.stringify(nfa)}</div>;
}

// function convertRegexToEpsilonNFA(regex: string) {}

function convertEpsilonNFAtoDFA(epsilonNFA: string) {
  return epsilonNFA;
}
