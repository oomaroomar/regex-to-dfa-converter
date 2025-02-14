export class Graph {
  adjacencyList: Map<string, { vertex: string; letter: string }[]>;
  // Map of vertex to the edges that point to it. Allows for faster checking of incoming edges.
  incomingEdges: Map<string, { vertex: string; letter: string }[]>;

  constructor(
    adjacencyList?: Map<string, { vertex: string; letter: string }[]>,
    incomingEdges?: Map<string, { vertex: string; letter: string }[]>,
  ) {
    this.adjacencyList =
      adjacencyList ?? new Map<string, { vertex: string; letter: string }[]>();
    this.incomingEdges =
      incomingEdges ?? new Map<string, { vertex: string; letter: string }[]>();
  }

  addVertex(vertex: string) {
    this.adjacencyList.set(vertex, []);
    this.incomingEdges.set(vertex, []);
  }

  removeVertex(vertex: string) {
    this.adjacencyList.delete(vertex);
    this.incomingEdges.delete(vertex);
    for (const [v, edges] of this.adjacencyList.entries()) {
      this.adjacencyList.set(
        v,
        edges.filter((edge) => edge.vertex !== vertex),
      );
    }
    for (const [v, edges] of this.incomingEdges.entries()) {
      this.incomingEdges.set(
        v,
        edges.filter((edge) => edge.vertex !== vertex),
      );
    }
  }

  addEdge(vertex1: string, vertex2: string, letter: string) {
    // Check if the edge already exists
    if (
      this.adjacencyList
        .get(vertex1)
        ?.some((e) => e.vertex === vertex2 && e.letter === letter)
    ) {
      return;
    }
    this.adjacencyList.get(vertex1)?.push({ vertex: vertex2, letter });
    this.incomingEdges.get(vertex2)?.push({ vertex: vertex1, letter });
  }

  removeEdge(vertex1: string, vertex2: string, letter: string) {
    const edges = this.adjacencyList.get(vertex1);
    if (edges) {
      this.adjacencyList.set(
        vertex1,
        edges.filter(
          (edge) => edge.letter !== letter && edge.vertex !== vertex2,
        ),
      );
    }
    const incomingEdges = this.incomingEdges.get(vertex2);
    if (incomingEdges) {
      this.incomingEdges.set(
        vertex2,
        incomingEdges.filter(
          (edge) => edge.vertex !== vertex1 && edge.letter !== letter,
        ),
      );
    }
  }

  getEdges(vertex: string) {
    return this.adjacencyList.get(vertex);
  }

  getAdjacencyList() {
    return this.adjacencyList;
  }

  getIncomingEdges() {
    return this.incomingEdges;
  }

  printGraph() {
    const keys = this.adjacencyList.keys();
    for (const i of keys) {
      const values = this.adjacencyList.get(i);
      let conc = "";
      for (const j of values ?? []) conc += `${j.letter}: ${j.vertex}, `;
      console.log(`${i} -> ${conc}`);
    }
  }
}
