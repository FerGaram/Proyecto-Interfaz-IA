import { useState, useCallback } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  useNodeId,
  type BuiltInNode,
  type NodeProps,
} from "@xyflow/react";

export const NodeCircle = ({
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
    <div className="node-circle">
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Left} id="left" />

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

      <div className="node-coords-circle">
        ({Math.round(positionAbsoluteX)}, {Math.round(positionAbsoluteY)})
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
    </div>
  );
};
