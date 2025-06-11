import { useState, useCallback } from 'react'
import { ReactFlow, Controls, Background, applyEdgeChanges, applyNodeChanges, type NodeChange, type EdgeChange, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './App.css'

const nodosIniciales = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { label: 'Primer nodo' }
  },
  {
    id: '2',
    position: { x: 100, y: 100 },
    data: { label: 'Segundo nodo' }
  }
]

const aristasIniciales = [
  {
    id: 'e1-2', source: '1', target: '2', label: 'Arista'
  }
]

function Flow() {
  const [nodes, setNodes] = useState(nodosIniciales)
  const [edges, setEdges] = useState(aristasIniciales)

  const onNodesChange = useCallback(
    (changes: NodeChange<{ id: string; position: { x: number; y: number }; data: { label: string } }>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<{ id: string; source: string; target: string; label: string }>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  )

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [],
  )

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default Flow
