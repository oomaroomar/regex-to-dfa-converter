<script setup lang="ts">
import { ref } from 'vue'
import { regexToAST, astToEpsilonNFA, epsilonNFAtoNFA, nfaToDFA } from './math'
import type { Graph } from './math/graph'
import FiniteAutomata from './components/FiniteAutomata.vue'
import RegexInfo from './components/RegexInfo.vue'
import AutomataInfo from './components/AutomataInfo.vue'

const regex = ref('')
const text = ref('')
const epsilonNFA = ref<Graph>()
const nfa = ref<Graph>()
const dfa = ref<Graph>()
const submit = () => {
  regex.value = '($' + text.value + ')'
  const ast = regexToAST(regex.value)
  epsilonNFA.value = astToEpsilonNFA(ast)
  nfa.value = epsilonNFAtoNFA(epsilonNFA.value)
  dfa.value = nfaToDFA(nfa.value)
}
</script>

<template>
  <main class="flex flex-col items-center h-screen p-4 gap-4 overflow-auto">
    <div class="flex flex-row flex-wrap gap-4">
      <RegexInfo />
      <AutomataInfo />
    </div>
    <form class="flex items-center gap-2 justify-center" v-on:submit.prevent="submit">
      <input
        name="regex"
        class="border-black p-2"
        v-model="text"
        placeholder="Enter your regex here"
      />
      <button class="hover:cursor-pointer" type="submit">Submit</button>
    </form>
    <FiniteAutomata v-if="epsilonNFA" :automata="epsilonNFA" title="Epsilon NFA" />
    <FiniteAutomata v-if="nfa" :automata="nfa" title="NFA" />
    <FiniteAutomata v-if="dfa" :automata="dfa" title="DFA" />
  </main>
</template>

<style scoped></style>
