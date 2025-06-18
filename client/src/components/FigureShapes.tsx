import type { FiguraOriginal } from "../utils/geometry";
import React from "react";

interface Props {
  figura: FiguraOriginal;
  inflada?: boolean;
  onMouseDownRect?: (e: React.MouseEvent, id: string) => void;
  onResize?: (id: string, corner: number, e: React.MouseEvent) => void;
  editable?: boolean;
  rasterizable?: boolean;
  faded?: boolean; // Nuevo: para mostrar originales tenues y punteados
}

const FigureShapes: React.FC<Props> = ({
  figura,
  inflada,
  onMouseDownRect,
  onResize,
  editable = false,
  rasterizable = false,
  faded = false,
}) => {
  const { x, y, width, height } = figura;

  // No renderizar si las dimensiones no son válidas
  if (width <= 0 || height <= 0) {
    return null;
  }

  return (
    <g data-interactive="true">
      {/* Figura base */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={inflada ? "none" : faded ? "#b71c1c10" : "#b71c1c20"}
        stroke={inflada ? "#111" : "#b71c1c"}
        strokeWidth={inflada ? 4 : 2}
        rx={8}
        strokeDasharray={faded && !inflada ? "6 6" : undefined}
        opacity={inflada ? 1 : faded ? 0.7 : 1}
        onMouseDown={!inflada && editable ? (e) => onMouseDownRect?.(e, figura.id) : undefined}
        style={{ 
          cursor: !inflada && editable ? "grab" : "default", 
          pointerEvents: 'all' 
        }}
      />

      {/* Nodos de control para redimensionar (originales) */}
      {editable && !inflada && [
        [x, y], [x + width, y], [x, y + height], [x + width, y + height],
      ].map(([cx, cy], i) => (
        <circle
          key={`orig-handle-${i}`}
          cx={cx}
          cy={cy}
          r={6}
          fill="#b71c1c"
          stroke="#fff"
          strokeWidth={2}
          style={{ cursor: "nwse-resize", pointerEvents: "all" }}
          onMouseDown={onResize ? (e) => onResize(figura.id, i, e) : undefined}
        />
      ))}

      {/* Nodos de control para rasterizar (infladas) */}
      {rasterizable && inflada && [
        [x, y], [x + width, y], [x, y + height], [x + width, y + height],
      ].map(([cx, cy], i) => (
        <circle
          key={`infl-handle-${i}`}
          cx={cx}
          cy={cy}
          r={8}
          fill="#111"
          stroke="#fff"
          strokeWidth={2}
          style={{ cursor: "nwse-resize", pointerEvents: "all" }}
          onMouseDown={onResize ? (e) => onResize(figura.id, i, e) : undefined}
        />
      ))}
    </g>
  );
};

export default FigureShapes;
