import { Handle, Position, type BuiltInNode, type NodeProps } from "@xyflow/react";

export const NodeRombo = ({ data }: NodeProps<BuiltInNode>) => {
    return (
        <div className="node-rombo">
            {/* Puntos de conexión */}
            <Handle type="source" position={Position.Top} id="top" />
            <Handle type="source" position={Position.Left} id="left" />
            <div className="rhombus-content">
                <label htmlFor="text">{data?.label}</label>
            </div>
            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="source" position={Position.Right} id="right" />
        </div>
    );
};