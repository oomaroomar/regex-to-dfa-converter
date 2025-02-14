import { astToEpsilonNFA, epsilonNFAtoNFA, regexToAST } from "~/lib/math";

export default function DFA({ regex }: { regex: string }) {
  const ast = regexToAST("($" + regex + ")");
  console.log("ast", ast);
  const enfa = astToEpsilonNFA(ast);
  console.log("enfa", enfa);
  const nfa = epsilonNFAtoNFA(enfa);
  console.log("nfa", nfa);
  return <div className="h-full">{JSON.stringify(enfa)}</div>;
}
