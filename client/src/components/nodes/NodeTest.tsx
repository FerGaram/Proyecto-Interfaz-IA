import { Handle, Position, type BuiltInNode, type NodeProps } from "@xyflow/react"

// Nodo con cuatro conectores a todos sus lados, y con un label para su contenido
export const NodeTest = ({ data, positionAbsoluteX, positionAbsoluteY}: NodeProps<BuiltInNode>) => {
    return (
        <div className="node-test">
            <Handle type="source" position={Position.Top} id="top" />
            <Handle type="source" position={Position.Left} id="left" />

            <div className="label-container">
                <label htmlFor="text">{data?.label}</label>
                <div className="node-coords">
                    ({Math.round(positionAbsoluteX)}, {Math.round(positionAbsoluteY)})
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="source" position={Position.Right} id="right" />
        </div>

    )
}