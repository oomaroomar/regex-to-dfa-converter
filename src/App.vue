<script setup lang="ts">
import { ref } from 'vue'
import { regexToAST, astToEpsilonNFA, epsilonNFAtoNFA } from './math'
const regex = ref('')
const text = ref('')

const submit = () => {
  regex.value = '($' + text.value + ')'
  const ast = regexToAST(regex.value)
  const epsilonNFA = astToEpsilonNFA(ast)
  const enfaFinalStates = epsilonNFA.getFinalStates()
  console.log('epsilonNFA', epsilonNFA)
  console.log('enfa finalStates', enfaFinalStates)
  const nfa = epsilonNFAtoNFA(epsilonNFA)
  const nfaFinalStates = nfa.getFinalStates()
  console.log('nfa', nfa)
  console.log('nfa finalStates', nfaFinalStates)
}
</script>

<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <h1>Hello World</h1>
    <form v-on:submit.prevent="submit">
      <input v-model="text" />
      <button type="submit">Submit</button>
    </form>
  </main>
</template>

<style scoped></style>
