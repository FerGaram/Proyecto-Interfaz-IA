import { Handle, Position, type BuiltInNode, type NodeProps } from "@xyflow/react";

export const NodeEllipse = ({ data }: NodeProps<BuiltInNode>) => {
  return (
   <div className="node-ellipse">
            <Handle type="source" position={Position.Top} id="top" />
            <Handle type="source" position={Position.Left} id="left" />
            <label htmlFor="text">{data?.label}</label>
            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="source" position={Position.Right} id="right" />
        </div>
  );
};
