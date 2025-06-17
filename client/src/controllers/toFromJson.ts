import type { defaultNodeModel } from '../models/defaultNodeModel'
import type { defaultEdgeModel } from '../models/defaultEdgeModel'

export function convertirAGrafoJSON(
  nodes: defaultNodeModel[],
  edges: defaultEdgeModel[],
  inicio: string,
  meta: string,
  algoritmo: string
) {
  const nodos: Record<string, [number, number]> = {}
  nodes.forEach(n => {
    nodos[n.id] = [n.position.x, n.position.y]
  })

  const aristas: Record<string, number> = {}
  edges.forEach(e => {
    const key = `${e.source}-${e.target}`
    const peso = parseFloat(e.label ?? '1.0')
   aristas[key] = isNaN(peso) ? 1.0 : peso
  })


  return {
    nodos,
    aristas,
    inicio,
    meta,
    algoritmo
  }
}