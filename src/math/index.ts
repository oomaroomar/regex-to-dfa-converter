import { Graph } from './graph.ts'

// Reverse order iteration allows us to avoid reordering the tree when encountering a Kleene star
// Union, however, will require reordering
type Leaf = {
  type: 'letter' | 'start' | 'end'
  value: string
}

// const nodeTypes = ['union', '*', 'word']
type NodeType = 'union' | '*' | 'word' | 'overflow'

type Node = {
  type: NodeType
  children: (Leaf | Node)[]
}

const SpecialCharacters = ['(', ')', '*', '+', '$']

// These values are used to position the nodes of the graph
// The name xRadius is used to imply that 0 + xRadius is the right edge of the screen
const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const xRadius = (vw * 0.9) / 2
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
const maxY = vh * 0.9

export function regexToAST(regex: string): Node {
  let i = regex.length - 1
  const tree = {
    type: 'word',
    children: [],
  } as Node
  let isEnd = true
  function walk(parent: { type: string; children: (Leaf | Node)[] }): Leaf | Node {
    if (!SpecialCharacters.includes(regex[i] ?? '')) {
      if (isEnd) {
        isEnd = false
        return {
          type: 'end' as const,
          value: regex[i--]!,
        }
      }
      let temp = i - 1
      while (regex[temp] === '(') {
        temp--
      }
      if (regex[temp] === '$') {
        const start = {
          type: 'start' as const,
          value: regex[i--]!,
        }
        // $ signifies that we are at the start of the string
        return start
      }
      return {
        type: 'letter' as const,
        value: regex[i--]!,
      }
    }

    if (regex[i] === '*') {
      i--
      const node = {
        type: '*' as const,
        children: [] as (Leaf | Node)[],
      }
      node.children.push(walk(node))
      return node
    }

    if (regex[i] === '+') {
      i--
      const node = {
        type: 'union' as const,
        children: [parent.children.pop()!],
      }
      node.children.push(walk(node))
      return node
    }

    if (regex[i] === ')') {
      i--
      const node = {
        type: 'word' as const,
        children: [] as (Leaf | Node)[],
      }

      while (regex[i] !== '(') {
        node.children.push(walk(node))
      }
      i--
      return node
    }
    if (regex[i] === '$') {
      i--
      return {
        type: 'overflow' as const,
        children: [],
      }
    }

    throw new Error('Unexpected symbol: ' + regex[i])
  }

  tree.children = [...(walk(tree) as Node).children]
  tree.children = tree.children.filter((child) => child.type !== 'overflow')

  return tree
}

export function astToEpsilonNFA(ast: Node) {
  const nfa = new Graph()
  nfa.addVertex('final', { x: xRadius / 2, y: 0 })
  nfa.makeFinal('final')
  let counter = 0
  walk(ast, 'final')

  // Recursively walk the AST and add edges to the NFA, returns attachToId

  // Returns the id of the vertex that was created
  function walk(node: Node | Leaf, attachTo: string): string {
    if (node.type === 'start') {
      nfa.addVertex('start')
      nfa.addEdge('start', attachTo, node.value)
      counter++
      return 'start'
    }
    if (node.type === 'letter' || node.type === 'end') {
      const letterNodeId = counter.toString()
      nfa.addVertex(letterNodeId)
      nfa.addEdge(letterNodeId, attachTo, node.value)
      counter++
      return letterNodeId
    }
    if (node.type === 'word') {
      let i = 0
      let prevChild = attachTo
      let lastChild = ''
      while (i < node.children.length) {
        prevChild = walk(node.children[i]!, prevChild)
        if (i === node.children.length - 1) {
          lastChild = prevChild
        }
        i++
      }
      return lastChild
    }
    if (node.type === 'union') {
      const firstChild = walk(node.children[0]!, attachTo)
      const secondChild = walk(node.children[1]!, attachTo)
      if (firstChild === 'start' || secondChild === 'start') {
        // Get copies. Not references.
        const childThatIsNotStart = firstChild === 'start' ? secondChild : firstChild
        nfa.addEdge('start', childThatIsNotStart, 'e')

        return 'start'
      }

      nfa.addEdge(firstChild, secondChild, 'e')

      return firstChild
    }
    if (node.type === '*') {
      nfa.addVertex('temp')
      // nfa.addEdge(kleeneId, attachTo, "e");
      const kleeneId = walk(node.children[0]!, 'temp')
      const incomingEdges = nfa.getIncomingEdges('temp')
      if (incomingEdges) {
        for (const edge of incomingEdges) {
          nfa.addEdge(edge.vertex, kleeneId, edge.letter)
        }
      }
      nfa.addEdge(kleeneId, attachTo, 'e')
      nfa.removeVertex('temp')
      return kleeneId
    }

    throw new Error('Unexpected node type from ' + JSON.stringify(node))
  }
  nfa.genLayout('final', 0, -maxY / 2)
  return nfa
}

function getEpsilonClosure(enfa: Graph, vertex: string) {
  const closure = new Set<string>()
  function walk(vertex: string) {
    const edges = enfa.getEdges(vertex)
    closure.add(vertex)
    if (!edges) return
    for (const edge of edges) {
      if (edge.letter === 'e') {
        if (enfa.getFinalStates().has(edge.vertex)) {
          enfa.makeFinal(vertex)
        }
        closure.add(edge.vertex)
        walk(edge.vertex)
      }
    }
  }
  walk(vertex)
  return closure
}

function getLetterMoves(G: Graph, vertex: string) {
  const moves = new Set<{ vertex: string; letter: string }>()
  const edges = G.getEdges(vertex)
  if (!edges) return moves
  for (const edge of edges) {
    if (edge.letter !== 'e') {
      moves.add(edge)
    }
  }
  return moves
}

export function epsilonNFAtoNFA(enfa: Graph) {
  const nfa = enfa.copyGraph()
  // Add epsilon closures
  for (const [vertex, edges] of nfa.getAdjacencyList().entries()) {
    const closure = getEpsilonClosure(nfa, vertex)
    for (const v of closure) {
      const letterMoves = getLetterMoves(nfa, v)
      for (const letterMove of letterMoves) {
        nfa.addEdge(vertex, letterMove.vertex, letterMove.letter)
        console.log('Added: from ', vertex, ' to ', letterMove.vertex, ' with ', letterMove.letter)
        const closure2 = getEpsilonClosure(nfa, letterMove.vertex)
        for (const v2 of closure2) {
          nfa.addEdge(vertex, v2, letterMove.letter)
        }
      }
    }
    for (const edge of edges) {
      if (edge.letter !== 'e') {
        const closure = getEpsilonClosure(nfa, edge.vertex)
        for (const v of closure) {
          nfa.addEdge(vertex, v, edge.letter)
        }
      }
    }
  }
  console.log('NFA ADJ LIST: ', nfa.getAdjacencyList())
  // Remove epsilon edges
  for (const [vertex, edges] of nfa.getAdjacencyList().entries()) {
    for (const edge of edges) {
      if (edge.letter === 'e') {
        console.log('Removing edge: from ', vertex, ' to ', edge.vertex, ' with ', edge.letter)
        nfa.removeEdge(vertex, edge.vertex, edge.letter)
      }
    }
  }

  // Assign layout
  nfa.genLayout('final', 0, -maxY / 2)

  // Remove unaccessible vertices
  nfa.removeInaccessibleVertices()

  return nfa
}

// Powerset construction
export function nfaToDFA(nfa: Graph) {
  const dfa = new Graph()
  const powerSet = getPowerSet(new Set(nfa.getAdjacencyList().keys()))
  powerSet.forEach((subset) => {
    dfa.addVertex(Array.from(subset).join(', '))
  })
  // For each vertex in the NFA, create a new vertex in the DFA
  // and add edges to the appropriate subsets of the powerset
  nfa.getAdjacencyList().forEach((edges, vertex) => {
    const map = new Map<string, Set<string>>()
    dfa.addVertex(vertex)
    edges.forEach((edge) => {
      const currentSet = map.get(edge.letter) ?? new Set<string>()
      currentSet.add(edge.vertex)
      map.set(edge.letter, currentSet)
    })
    map.forEach((set, letter) => {
      dfa.addEdge(vertex, Array.from(set).join(', '), letter)
    })
  })
  // Union algorithm
  powerSet.forEach((subset) => {
    if (subset.size === 1) return
    const vertex = Array.from(subset).join(', ')
    dfa.addVertex(vertex)
    const map = new Map<string, Set<string>>()
    subset.forEach((vertex) => {
      const edges = nfa.getEdges(vertex)
      if (!edges) return
      edges.forEach((edge) => {
        const currentSet = map.get(edge.letter) ?? new Set<string>()
        const realVertices = edge.vertex.split(', ')
        realVertices.forEach((v) => {
          currentSet.add(v)
        })
        map.set(edge.letter, currentSet)
      })
    })
    map.forEach((set, letter) => {
      dfa.addEdge(vertex, Array.from(set).join(', '), letter)
    })
  })
  dfa.getIncomingEdges().forEach((edges, vertex) => {
    if (vertex === 'start') return
  })
  // dfa.removeInaccessibleVertices()
  dfa.getAdjacencyList().forEach((edges, vertex) => {
    const realVertices = vertex.split(', ')
    if (realVertices.some((v) => nfa.getFinalStates().has(v))) {
      dfa.makeFinal(vertex)
    }
  })
  dfa.removeInaccessibleVertices()
  const someFinalState = Array.from(dfa.getFinalStates())[0]
  dfa.genLayout(someFinalState, 0, -maxY / 2)

  return dfa
}

function getPowerSet<T>(set: Set<T>) {
  const subsets = getAllSubsets(Array.from(set))
  return new Set(subsets.map((subset) => new Set(subset)))
}

function getAllSubsets<T>(theArray: T[]) {
  return theArray.reduce(
    (subsets, value) => subsets.concat(subsets.map((set) => [value, ...set])),
    [[]] as T[][],
  )
}
