import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Flow from './App.tsx'
import { ReactFlowProvider } from '@xyflow/react'

createRoot(document.getElementById('root')!).render(
  <ReactFlowProvider>
    <StrictMode>
      <Flow />
    </StrictMode>
  </ReactFlowProvider>
  ,
)
