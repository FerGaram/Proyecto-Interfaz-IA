import { useState, useCallback, useRef } from 'react'
import { ReactFlow, Controls, Background, applyEdgeChanges, applyNodeChanges, type NodeChange, type EdgeChange, addEdge, MiniMap, ConnectionMode, Panel } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './App.css'
import type { defaultNodeModel } from './models/defaultNodeModel'
import type { defaultEdgeModel } from './models/defaultEdgeModel'
import { NodeTest } from './components/nodes/NodeTest'

// Aquí se deben importar los nodos personalizados que se hayan hecho
const nodeTypes = { nodeTest: NodeTest }

// Lista de nodos iniciales de prueba, se podrían borrar más adelante
const nodosIniciales: Array<defaultNodeModel> = [
  {
    id: '1',  // ID del nodo
    position: { x: 0, y: 0 }, // Posición inicial
    data: { label: '1' }, // Etiqueta / Texto a mostrar
    type: 'nodeTest'  // Tipo de nodo a utilizar
  },
  {
    id: '2',
    position: { x: 100, y: 100 },
    data: { label: '2' },
    type: 'nodeTest'
  },
]

// Lista de aristas iniciales de prueba, se podrían borrar más adelante
const aristasIniciales: Array<defaultEdgeModel> = [
  {
    id: 'xy-edge__1bottom-2top', source: '1', sourceHandle: 'bottom', target: '2', targetHandle: 'top', label: ''
  }
]

// Función principal
function Flow() {
  // Hooks para obtener y asignar nuevos nodos y aristas
  const [nodes, setNodes] = useState(nodosIniciales)
  const [edges, setEdges] = useState(aristasIniciales)

  // Hooks para conservar el último ID de nodo añadido
  const ultimoId = useRef(2)  // Está así para contar las dos iniciales, si esas se borran, recuerden cambiar este valor
  // Valores para coordenadas que se usan cuando se añade un nodo individual
  const xPos = useRef(50)
  const yPos = useRef(50)

  // Hooks para almacenar los nodos iniciales y finales
  const [nodoInicial, setNodoInicial] = useState('')
  const [nodoFinal, setNodoFinal] = useState('')

  // Handler para añadir/modificar/eliminar nodos, no hace falta modificar
  const onNodesChange = useCallback(
    (changes: NodeChange<defaultNodeModel>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  )

  // Handler para añadir un nodo específico
  const addNode = useCallback(() => {
    ultimoId.current++
    setNodes((nds: any) => {
      console.log(nds)
      return [
        ...nds,
        {
          id: ultimoId.current.toString(),
          position: { x: xPos.current, y: yPos.current },
          data: { label: ultimoId.current.toString() },
          type: 'nodeTest'
        }
      ]
    })
  }, [])

  // Handler para añadir/modificar/eliminar aristas, no hace falta modificar
  const onEdgesChange = useCallback(
    (changes: EdgeChange<defaultEdgeModel>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  )

  // Handler para manejar la conexión de nodos, no hace falta modificar
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [],
  )

  // Handler para botón de prueba, muestra en la consola la estructura de los nodos y aristas
  const pruebaOnClick = () => {
    console.log(nodes)
    console.log(edges)
  }

  // Handler para eliminar aristas y nodos de la pantalla, y para resetear último nodo
  const limpiarPantalla = useCallback(() => {
    ultimoId.current = 0
    setEdges(() => { return [] })
    setNodes(() => { return [] })
  }, [])

  // Devuelve la pantalla principal de React Flow
  return (
    // Ocupa el tamaño completo de la pantalla del navegador
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes} // Nodos iniciales
        onNodesChange={onNodesChange} // Handler de cambios de nodos
        nodeTypes={nodeTypes} // Tipos de nodos personalizados
        edges={edges} // Aristas iniciales
        onEdgesChange={onEdgesChange} // Handler de cambios de aristas
        onConnect={onConnect} // Handler de conexiones
        fitView // Ajusta la pantalla para contener y centrar los nodos iniciales
        connectionMode={ConnectionMode.Loose} // Se define de esta forma para que los conectores puedan iniciar y terminar conexiones
      >
        <Background /* Fondo punteado */ />
        <Controls /* Botones de la esquina inferior izquierda */ />
        <MiniMap /* Minimapa de la esquina inferior derecha */ />
        <Panel position='top-left'>
          <>
            <p>Nodo inicial: {nodoInicial === '' ? 'Sin seleccionar' : nodoInicial}</p>
            <p>Nodo final: {nodoFinal === '' ? 'Sin seleccionar' : nodoFinal}</p>
          </>
        </Panel>
        <Panel position='top-center' /* Panel para mostrar botones de prueba en parte superior */>
          <>
            <center>
              <h4>Botones de prueba</h4>
              <button onClick={pruebaOnClick} /* BORRAR AL TERMINAR DE HACER PRUEBAS */>Imprimir nodos y aristas en consola</button><br />
              <button onClick={addNode}>Añadir nuevo nodo</button>
              <button onClick={limpiarPantalla}>Limpiar pantalla</button>
            </center>
          </>
        </Panel>
        <Panel position='top-right' /* Panel para mostrar controles en la esquina superior derecha */>
          <>
            <center>
              <h4>Controles</h4>
            </center>
            <ul>
              <li>Desplazarse: haz clic fuera de un nodo y arrastra</li>
              <li>Seleccionar múltiples nodos: Shift + clic y arrastra<br />para seleccionar múltiples nodos y aristas</li>
              <li>Borrar nodo/arista: haz clic y pulsa Retroceso</li>
              <li>Conectar nodos: haz clic y arrastra desde un<br />conector, y suelta en otro del nodo a conectar</li>
            </ul>
          </>
        </Panel>
        <Panel position='bottom-center' /* Panel para mostrar opciones de algoritmos */>
          <>
            Usen este panel para elegir algoritmos
          </>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default Flow
