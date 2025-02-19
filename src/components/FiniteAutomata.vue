<script setup lang="ts">
import { ref, watch } from 'vue'
import { graphToVNetworkGraph, vConfig, type vEdge, type vNode } from '../v-network-graph-utils'
import type { Graph } from '@/math/graph'

const props = defineProps<{
  automata: Graph
}>()

const nodes = ref<Record<string, vNode>>({})
const edges = ref<Record<string, vEdge>>({})
const layout = ref<Record<string, Record<string, { x: number; y: number }>>>({ nodes: {} })

watch(props, () => {
  const { vNFAnodes, vNFAedges, layouts } = graphToVNetworkGraph(props.automata)
  nodes.value = vNFAnodes.value
  edges.value = vNFAedges.value
  layout.value.nodes = layouts.value.nodes
})

const { vNFAnodes, vNFAedges, layouts } = graphToVNetworkGraph(props.automata)
nodes.value = vNFAnodes.value
edges.value = vNFAedges.value
layout.value.nodes = layouts.value.nodes
console.log('hello', layout.value.nodes)
</script>

<template>
  <v-network-graph v-model:layouts="layout" :nodes="nodes" :edges="edges" :configs="vConfig">
    <template #edge-label="{ edge, hovered, selected, ...slotProps }">
      <v-edge-label
        :class="{ hovered, selected }"
        :text="edge.label"
        align="center"
        vertical-align="above"
        v-bind="slotProps"
      />
    </template>
  </v-network-graph>
</template>

<style scoped></style>
