type Position = { x: number; y: number }
export class Graph {
  adjacencyList: Map<string, { vertex: string; letter: string }[]>
  // Map of vertex to the edges that point to it. Allows for faster checking of incoming edges.
  incomingEdges: Map<string, { vertex: string; letter: string }[]>
  finalStates: Set<string>
  layout: Record<string, Position>

  constructor(
    adjacencyList?: Map<string, { vertex: string; letter: string }[]>,
    incomingEdges?: Map<string, { vertex: string; letter: string }[]>,
    finalStates?: Set<string>,
    layout?: Record<string, Position>,
  ) {
    this.adjacencyList = adjacencyList ?? new Map<string, { vertex: string; letter: string }[]>()
    this.incomingEdges = incomingEdges ?? new Map<string, { vertex: string; letter: string }[]>()
    this.finalStates = finalStates ?? new Set<string>()
    this.layout = layout ?? {}
  }

  genLayout(vertex: string, x: number, y: number) {
    const covered = new Set<string>()
    function getX(x: number, i: number, n: number) {
      return (
        x + 150 - 300 * (i / n) + Math.pow(-1, Math.floor(Math.random() * 2)) * 100 * Math.random()
      )
    }
    function getY(y: number) {
      return y - 150
    }
    function walk(vertex: string, x: number, y: number, graph: Graph) {
      if (covered.has(vertex)) return
      covered.add(vertex)
      graph.setPosition(vertex, { x, y })
      let sourceVertices = graph.getIncomingEdges(vertex)?.map((edge) => edge.vertex)
      sourceVertices = sourceVertices?.filter((v) => v !== vertex)
      if (!sourceVertices) return
      for (let i = 0; i < sourceVertices.length; i++) {
        walk(sourceVertices[i], getX(x, i, sourceVertices.length), getY(y), graph)
      }
    }
    walk(vertex, x, y, this)
  }

  removeInaccessibleVertices(start?: string) {
    const startVertex = start ?? 'start'
    const covered = new Set<string>()
    function walk(vertex: string, graph: Graph) {
      if (covered.has(vertex)) return
      covered.add(vertex)
      let removedSomething = false
      for (const [vertex, edges] of graph.incomingEdges) {
        if (vertex === startVertex) continue
        let inaccessible = true
        for (const edge of edges) {
          if (edge.vertex !== vertex) {
            inaccessible = false
            break
          }
        }
        if (inaccessible) {
          graph.removeVertex(vertex)
          removedSomething = true
        }
      }

      // If stuff got removed, we need to check again since some vertices
      // might have become inaccessible
      if (removedSomething) {
        covered.clear()
        walk(startVertex, graph)
      }
    }
    walk(startVertex, this)
  }
  // Returns a new graph that is a copy of the current graph
  copyGraph() {
    const newAdjList = new Map<string, { vertex: string; letter: string }[]>()
    for (const [vertex, edges] of this.getAdjacencyList().entries()) {
      newAdjList.set(
        vertex,
        edges.map((edge) => ({ vertex: edge.vertex, letter: edge.letter })),
      )
    }
    const newIncomingEdges = new Map<string, { vertex: string; letter: string }[]>()
    for (const [vertex, edges] of this.getIncomingEdges().entries()) {
      newIncomingEdges.set(
        vertex,
        edges.map((edge) => ({ vertex: edge.vertex, letter: edge.letter })),
      )
    }
    const newFinalStates = new Set<string>(Array.from(this.getFinalStates()).map((v) => v))
    const newLayout = { ...this.getLayout() }
    const newGraph = new Graph(newAdjList, newIncomingEdges, newFinalStates, newLayout)
    return newGraph
  }

  makeFinal(vertex: string) {
    this.finalStates.add(vertex)
  }

  getFinalStates() {
    return this.finalStates
  }

  addVertex(vertex: string, layout?: Position) {
    if (this.adjacencyList.has(vertex)) return
    this.adjacencyList.set(vertex, [])
    this.incomingEdges.set(vertex, [])
    if (layout) this.layout[vertex] = layout
  }

  removeVertex(vertex: string) {
    this.adjacencyList.delete(vertex)
    this.incomingEdges.delete(vertex)
    delete this.layout[vertex]
    this.finalStates.delete(vertex)
    for (const [v, edges] of this.adjacencyList.entries()) {
      this.adjacencyList.set(
        v,
        edges.filter((edge) => edge.vertex !== vertex),
      )
    }
    for (const [v, edges] of this.incomingEdges.entries()) {
      this.incomingEdges.set(
        v,
        edges.filter((edge) => edge.vertex !== vertex),
      )
    }
  }

  setPosition(vertex: string, layout: Position) {
    this.layout[vertex] = layout
  }

  addEdge(vertex1: string, vertex2: string, letter: string) {
    // Check if the edge already exists
    if (this.adjacencyList.get(vertex1)?.some((e) => e.vertex === vertex2 && e.letter === letter)) {
      return
    }
    if (!this.adjacencyList.get(vertex1)) this.addVertex(vertex1)
    if (!this.adjacencyList.get(vertex2)) this.addVertex(vertex2)
    this.adjacencyList.get(vertex1)?.push({ vertex: vertex2, letter })
    this.incomingEdges.get(vertex2)?.push({ vertex: vertex1, letter })
  }

  removeEdge(vertex1: string, vertex2: string, letter: string) {
    const edges = this.adjacencyList.get(vertex1)
    if (edges) {
      this.adjacencyList.set(
        vertex1,
        edges.filter((edge) => edge.letter !== letter || edge.vertex !== vertex2),
      )
    }
    const incomingEdges = this.incomingEdges.get(vertex2)
    if (incomingEdges) {
      this.incomingEdges.set(
        vertex2,
        incomingEdges.filter((edge) => edge.vertex !== vertex1 || edge.letter !== letter),
      )
    }
  }

  getEdges(vertex: string) {
    return this.adjacencyList.get(vertex)
  }

  getAdjacencyList() {
    return this.adjacencyList
  }

  // Such type safety, much wow
  getIncomingEdges(): Map<string, { vertex: string; letter: string }[]>
  getIncomingEdges(vertex: string): { vertex: string; letter: string }[] | undefined
  getIncomingEdges(vertex?: string) {
    if (vertex) {
      return this.incomingEdges.get(vertex)
    }
    return this.incomingEdges
  }

  getLayout(): Record<string, Position>
  getLayout(vertex: string): Position | undefined
  getLayout(vertex?: string): Record<string, Position> | Position | undefined {
    if (vertex) {
      return this.layout[vertex]
    }
    return this.layout
  }
}
