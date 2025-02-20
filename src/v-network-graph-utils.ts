import { reactive, ref } from 'vue'
import * as vNG from 'v-network-graph'
import type { Graph } from './math/graph'

export type vNode = {
  name: string
  color?: string
}
export type vEdge = {
  source: string
  target: string
  label: string
}

export function graphToVNetworkGraph(graph: Graph) {
  const vNFAnodes = ref<Record<string, vNode>>({})
  const vNFAedges = ref<Record<string, vEdge>>({})
  const layouts = ref<Record<string, Record<string, { x: number; y: number }>>>({ nodes: {} })
  const maxY = Math.max(...Object.values(graph.getLayout()).map((layout) => layout.y))
  graph.getAdjacencyList().forEach((edges, vertex) => {
    let selfEdges = ''
    edges.forEach((edge) => {
      if (edge.vertex === vertex) {
        if (selfEdges.length > 0) selfEdges += ', '
        selfEdges += edge.letter
      }
    })
    const name = selfEdges.length > 0 ? vertex + ': ' + selfEdges : vertex
    vNFAnodes.value[vertex] = { name: name, color: 'white' }
    if (graph.getFinalStates().has(vertex)) {
      vNFAnodes.value[vertex].color = '#4BB543'
    }
    const position = graph.getLayout(vertex)
    layouts.value.nodes[vertex] = position
      ? { x: position.x, y: position.y - maxY }
      : { x: 20, y: 20 }
    edges.forEach((edge) => {
      vNFAedges.value[`${vertex}-${edge.vertex}-${edge.letter}`] = {
        source: vertex,
        target: edge.vertex,
        label: edge.letter,
      }
    })
  })
  return { vNFAnodes, vNFAedges, layouts }
}

export const vConfig = reactive(
  vNG.defineConfigs({
    node: {
      normal: {
        color: (node) => node.color,
        radius: 20,
        strokeWidth: 2,
        strokeColor: '#000000',
      },
      label: {
        fontSize: 16,
        direction: 'center',
      },
    },
    edge: {
      selfLoop: {
        angle: 355,
      },
      label: {
        fontSize: 16,
        color: '#000000',
      },
      normal: {
        width: 3,
        color: '#000000',
        dasharray: '0',
        linecap: 'butt',
        animate: false,
        animationSpeed: 50,
      },
      gap: 30,
      type: 'curve',
      margin: 2,
      marker: {
        source: {
          type: 'none',
          width: 4,
          height: 4,
          margin: -1,
          offset: 0,
          units: 'strokeWidth',
          color: null,
        },
        target: {
          type: 'arrow',
          width: 4,
          height: 4,
          margin: -1,
          offset: 0,
          units: 'strokeWidth',
          color: null,
        },
      },
    },
  }),
)
