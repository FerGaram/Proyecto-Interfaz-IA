import type { defaultNodeModel } from "../models/defaultNodeModel";
import type { defaultEdgeModel } from "../models/defaultEdgeModel";

// Asumimos tamaño promedio de nodo rectangular
const NODE_WIDTH = 80;
const NODE_HEIGHT = 40;

function calcularDistanciaEuclidiana(a: defaultNodeModel, b: defaultNodeModel): number {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function intersectaLineaConRectangulo(p1: { x: number, y: number }, p2: { x: number, y: number }, centro: { x: number, y: number }) {
//   const rect = {
//     left: centro.x - NODE_WIDTH / 2,
//     right: centro.x + NODE_WIDTH / 2,
//     top: centro.y - NODE_HEIGHT / 2,
//     bottom: centro.y + NODE_HEIGHT / 2,
//   };

//   const lineIntersects = (x1: number, y1: number, x2: number, y2: number, rx1: number, ry1: number, rx2: number, ry2: number) => {
//     const intersects = (a1: number, a2: number, b1: number, b2: number) => Math.max(a1, b1) <= Math.min(a2, b2);

//     return (
//       intersects(x1, x2, rx1, rx2) &&
//       intersects(y1, y2, ry1, ry2)
//     );
//   };

//   return lineIntersects(
//     p1.x, p1.y, p2.x, p2.y,
//     rect.left, rect.top, rect.right, rect.bottom
//   );
const hw = NODE_WIDTH / 2;
  const hh = NODE_HEIGHT / 2;

  const rectPoints = [
    { x: centro.x - hw, y: centro.y - hh }, // top-left
    { x: centro.x + hw, y: centro.y - hh }, // top-right
    { x: centro.x + hw, y: centro.y + hh }, // bottom-right
    { x: centro.x - hw, y: centro.y + hh }, // bottom-left
  ];

  const rectEdges = [
    [rectPoints[0], rectPoints[1]], // top
    [rectPoints[1], rectPoints[2]], // right
    [rectPoints[2], rectPoints[3]], // bottom
    [rectPoints[3], rectPoints[0]], // left
  ];

  return rectEdges.some(([a, b]) => segmentosIntersectan(p1, p2, a, b));
}

function segmentosIntersectan(p1: any, p2: any, q1: any, q2: any): boolean {
  const ccw = (A: any, B: any, C: any) =>
    (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);

  return (
    ccw(p1, q1, q2) !== ccw(p2, q1, q2) &&
    ccw(p1, p2, q1) !== ccw(p1, p2, q2)
  );
}

export function generarConexionesSinColision(
  nodos: defaultNodeModel[]
): defaultEdgeModel[] {
  const edges: defaultEdgeModel[] = [];

  for (let i = 0; i < nodos.length; i++) {
    for (let j = i + 1; j < nodos.length; j++) {
      const nodoA = nodos[i];
      const nodoB = nodos[j];

      // Validar que la línea no cruce otro nodo
      const hayColision = nodos.some((n) => {
        if (n.id === nodoA.id || n.id === nodoB.id) return false;
        return intersectaLineaConRectangulo(nodoA.position, nodoB.position, n.position);
      });

      if (!hayColision) {
        const distancia = calcularDistanciaEuclidiana(nodoA, nodoB);
        edges.push({
          id: `auto-${nodoA.id}-${nodoB.id}`,
          source: nodoA.id,
          target: nodoB.id,
          sourceHandle: "center", // si lo definiste como "center" en el nodo
          targetHandle: "center",
          label: distancia.toFixed(1),
          style: { strokeDasharray: "3 2" }, // opcional
        });
      }
    }
  }

  return edges;
}
