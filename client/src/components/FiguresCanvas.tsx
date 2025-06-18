import React from "react";
import FigureShapes from "./FigureShapes";
import type { FiguraOriginal } from "../utils/geometry";

interface Node {
  id: string;
  x: number;
  y: number;
  label?: string;
}

interface Props {
  figuras: FiguraOriginal[];
  inflatedFiguras?: FiguraOriginal[];
  mode: 'edit' | 'inflated' | 'rasterize' | 'nodes';
  onMouseDownRect?: (e: React.MouseEvent, id: string) => void;
  onResize?: (id: string, corner: number, e: React.MouseEvent) => void;
  nodes?: Node[];
  selectedStart?: string | null;
  selectedGoal?: string | null;
  onSelectNode?: (nodeId: string) => void;
  camino?: string[];
  robotPos?: { x: number; y: number } | null;
}
 
function getVertices(fig: FiguraOriginal) {
  return [
    { x: fig.x, y: fig.y },
    { x: fig.x + fig.width, y: fig.y },
    { x: fig.x, y: fig.y + fig.height },
    { x: fig.x + fig.width, y: fig.y + fig.height },
  ];
}

const FiguresCanvas: React.FC<Props> = ({
  figuras,
  inflatedFiguras = [],
  mode,
  onMouseDownRect,
  onResize,
  nodes = [],
  selectedStart,
  selectedGoal,
  onSelectNode,
  camino = [],
  robotPos = null,
}) => {
  const showOriginals = true;
  const showInflated = mode === 'inflated' || mode === 'rasterize' || mode === 'nodes';
  const inflatedRasterizable = mode === 'rasterize';

  // Calcular aristas (solo en modo nodes): cada lado de cada inflada
  let edges: { from: Node; to: Node }[] = [];
  if (mode === 'nodes' && inflatedFiguras.length > 0) {
    for (const fig of inflatedFiguras) {
      const verts = getVertices(fig);
      const ids = [0, 1, 3, 2, 0]; // Recorrido de las esquinas en orden
      for (let i = 0; i < 4; i++) {
        const from = { ...verts[ids[i]], id: `${fig.id}_${ids[i]}` };
        const to = { ...verts[ids[i + 1]], id: `${fig.id}_${ids[i + 1]}` };
        edges.push({ from, to });
      }
    }
  }

  // Dibuja la ruta óptima si existe
  let pathLines: { from: Node; to: Node }[] = [];
  if (mode === 'nodes' && camino.length > 1 && nodes.length > 0) {
    for (let i = 0; i < camino.length - 1; i++) {
      const from = nodes.find(n => n.id === camino[i]);
      const to = nodes.find(n => n.id === camino[i + 1]);
      if (from && to) pathLines.push({ from, to });
    }
  }

  return (
    <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
      <g style={{ pointerEvents: 'all' }}>
        {/* Ruta óptima (resaltada) */}
        {mode === 'nodes' && pathLines.map((edge, i) => (
          <g key={edge.from.id + '-' + edge.to.id + '-path'}>
            <line
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              stroke="#ff9800"
              strokeWidth={14}
              opacity={0.95}
              strokeLinecap="round"
              filter="url(#glow)"
            />
          </g>
        ))}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Robot animado */}
        {mode === 'nodes' && robotPos && (
          <circle
            cx={robotPos.x}
            cy={robotPos.y}
            r={13}
            fill="#b71c1c"
            stroke="#fff"
            strokeWidth={4}
            style={{ filter: 'drop-shadow(0 2px 8px #b71c1c88)' }}
          />
        )}
        {/* Aristas del grafo de visibilidad (en modo nodes) */}
        {mode === 'nodes' && edges.map((edge, i) => (
          <line
            key={edge.from.id + '-' + edge.to.id}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke="#222"
            strokeWidth={4}
            opacity={0.9}
          />
        ))}
        {/* Figuras infladas (negro) */}
        {showInflated &&
          inflatedFiguras.map((f) => (
            <FigureShapes
              key={f.id + "-inflada"}
              figura={f}
              inflada={true}
              rasterizable={inflatedRasterizable}
              onResize={onResize}
            />
          ))}
        {/* Figuras originales (rojo, siempre visibles, tenues y punteadas si no es modo edit) */}
        {showOriginals &&
          figuras.map((fig) => (
            <FigureShapes
              key={fig.id}
              figura={fig}
              editable={mode === 'edit'}
              onMouseDownRect={onMouseDownRect}
              onResize={onResize}
              faded={mode !== 'edit'}
            />
          ))}
        {/* Nodos: inicial (verde), final (rojo), otros (azul) */}
        {mode === 'nodes' && nodes.map((node, idx) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={12}
              fill={
                node.id === selectedStart ? '#43a047' :
                node.id === selectedGoal ? '#b71c1c' :
                '#2196f3'
              }
              stroke="#fff"
              strokeWidth={3}
              style={{ cursor: "pointer", pointerEvents: "all", filter: node.id === selectedStart || node.id === selectedGoal ? 'drop-shadow(0 2px 8px #0006)' : undefined }}
              onClick={() => onSelectNode && onSelectNode(node.id)}
            />
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill="#fff"
              pointerEvents="none"
              style={{ textShadow: '0 1px 4px #000, 0 0 8px #000' }}
            >
              {node.label || idx + 1}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

export default FiguresCanvas;
