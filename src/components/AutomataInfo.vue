<template>
  <div class="flex flex-col items-center justify-center border-2 border-black p-2">
    <h1 class="text-2xl font-bold">Regarding the automata</h1>
    <ul>
      <li>Accepting states are colored in <span class="text-[#4BB543]">green</span>.</li>
      <li>
        If a node has a self-loop, the letters are displayed in the node name. (A: a,b,c) means node
        A has edges with a, b, and c to itself.
      </li>
      <li>
        The starting node has the name "start" (with possibly self-loop letters attached). The DFA
        is constructed via powerset construction so some non-starting nodes will have a name that
        includes "start".
      </li>
      <li>The nodes are draggable. So you can position them as you like.</li>
      <li>
        Sink nodes are not displayed. If an edge is missing from the DFA, it means the computation
        has reached a sink state.
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
