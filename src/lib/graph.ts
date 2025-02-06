export class Graph {
  adjacencyList: Map<string, { vertex: string; letter: string }[]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex: string) {
    this.adjacencyList.set(vertex, []);
  }

  addEdge(vertex1: string, vertex2: string, letter: string) {
    this.adjacencyList.get(vertex1)?.push({ vertex: vertex2, letter });
  }

  getAdjacencyList() {
    return this.adjacencyList;
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
