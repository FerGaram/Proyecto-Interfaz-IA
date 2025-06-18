import { useState, useCallback } from "react";
import {
  Handle,
  useReactFlow,
  useNodeId,
  type BuiltInNode,
  type NodeProps,
} from "@xyflow/react";

export const NodeRombo = ({
  data,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps<BuiltInNode>) => {
  const nodeId = useNodeId();
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data.label);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label: labelValue } } : n
      )
    );
  }, [labelValue, nodeId, setNodes]);

  return (
    <div className="node-rombo" style={{ position: "relative" }}>
      {/* Único handle central */}
      <Handle
        type="source"
        position="top"
        id="center"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "#555",
          width: 10,
          height: 10,
          borderRadius: "50%",
          position: "absolute",
          opacity: 0,
          pointerEvents: "auto", 
        }}
      />

      <div className="rhombus-content">
        {isEditing ? (
          <input
            className="editable-input"
            autoFocus
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        ) : (
          <label onDoubleClick={() => setIsEditing(true)}>{data.label}</label>
        )}
      </div>

      <div className="node-coords-rombo">
        ({Math.round(positionAbsoluteX)}, {Math.round(positionAbsoluteY)})
      </div>
    </div>
  );
};
