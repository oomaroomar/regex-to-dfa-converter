<script setup lang="ts">
import { ref } from 'vue'
import { regexToAST, astToEpsilonNFA, epsilonNFAtoNFA, nfaToDFA } from './math'
import type { Graph } from './math/graph'
import FiniteAutomata from './components/FiniteAutomata.vue'

const regex = ref('')
const text = ref('')
const dfa = ref<Graph>()
const nfa = ref<Graph>()

const submit = () => {
  regex.value = '($' + text.value + ')'
  const ast = regexToAST(regex.value)
  const epsilonNFA = astToEpsilonNFA(ast)
  nfa.value = epsilonNFAtoNFA(epsilonNFA)
  dfa.value = nfaToDFA(nfa.value)
}
</script>

<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <form v-on:submit.prevent="submit">
      <input v-model="text" />
      <button type="submit">Submit</button>
    </form>
    <FiniteAutomata v-if="nfa" :automata="nfa" />
    <FiniteAutomata v-if="dfa" :automata="dfa" />
  </main>
</template>

<style scoped></style>
