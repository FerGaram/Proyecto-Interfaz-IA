import { Handle, Position } from "@xyflow/react";

// Solo devuelve el Handle
export const NodeEmpty = () => {
  return (
    <div style={{ minHeight: 1, minWidth: 1 }}>
      <Handle type="source" position={Position.Top} id="top" />
    </div>
  );
};
