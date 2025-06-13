import { Handle, Position, type BuiltInNode, type NodeProps } from "@xyflow/react"

// Nodo con cuatro conectores a todos sus lados, y con un label para su contenido
export const NodeTest = ({ data }: NodeProps<BuiltInNode>) => {
    return (
        <div className="node-test">
            <Handle type="source" position={Position.Top} id="top" />
            <Handle type="source" position={Position.Left} id="left" />
            <label htmlFor="text">{data?.label}</label>
            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="source" position={Position.Right} id="right" />
        </div>
    )
}

// Para darle estilo pueden utilizar el archivo index.css, ahí también encontrarán el ejemplo de cómo se hizo con la clase node-test