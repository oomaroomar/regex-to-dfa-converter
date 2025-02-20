<script setup lang="ts">
import { ref, watch } from 'vue'
import { graphToVNetworkGraph, vConfig, type vEdge, type vNode } from '../v-network-graph-utils'
import type { Graph } from '@/math/graph'

const props = defineProps<{
  automata: Graph
  title: string
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
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full max-w-[90vw] min-h-[80vh]">
    <h1 class="text-2xl font-bold">{{ title }}</h1>
    <v-network-graph
      class="border-2 border-black"
      v-model:layouts="layout"
      :nodes="nodes"
      :edges="edges"
      :configs="vConfig"
    >
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
  </div>
</template>

<style scoped></style>
