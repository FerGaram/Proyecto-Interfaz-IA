import { useState } from 'react'
import { ReactFlow, Controls, Background } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './App.css'

const nodes = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { label: 'Prueba' }
  }
]

function Flow() {
  // const [count, setCount] = useState(0)

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow nodes={nodes}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default Flow
