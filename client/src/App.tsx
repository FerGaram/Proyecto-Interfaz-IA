import { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  type NodeChange,
  type EdgeChange,
  addEdge,
  MiniMap,
  ConnectionMode,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./App.css";
import type { defaultNodeModel } from "./models/defaultNodeModel";
import type { defaultEdgeModel } from "./models/defaultEdgeModel";
import { NodeTest } from "./components/nodes/NodeTest";
import { NodeCircle } from "./components/nodes/NodeCircle";
import { NodeEllipse } from "./components/nodes/NodeEllipse";
import { NodeRombo } from "./components/nodes/NodeRombo";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'; // Import Typography
import { NodeTypeDropdown } from './components/NodeTypeDropdown';

// Aquí se deben importar los nodos personalizados que se hayan hecho
const nodeTypes = {
  nodeTest: NodeTest,
  nodeCircle: NodeCircle,
  nodeEllipse: NodeEllipse,
  nodeRombo: NodeRombo,
};

// Lista de nodos iniciales de prueba, se podrían borrar más adelante
const nodosIniciales: Array<defaultNodeModel> = [
  {
    id: "1", // ID del nodo
    position: { x: 0, y: 0 }, // Posición inicial
    data: { label: "1" }, // Etiqueta / Texto a mostrar
    type: "nodeTest", // Tipo de nodo a utilizar
  },
  {
    id: "2",
    position: { x: 100, y: 100 },
    data: { label: "2" },
    type: "nodeTest",
  },
  {
    id: "3",
    position: { x: 200, y: 100 },
    data: { label: "3" },
    type: "nodeRombo",
  },
];

// Lista de aristas iniciales de prueba, se podrían borrar más adelante
const aristasIniciales: Array<defaultEdgeModel> = [
  {
    id: "xy-edge__1bottom-2top",
    source: "1",
    sourceHandle: "bottom",
    target: "2",
    targetHandle: "top",
    label: "",
  },
];

const nodeTypesArray = [
  { label: "Cuadro", value: "nodeTest" },
  { label: "Círculo", value: "nodeCircle" },
  { label: "Elipse", value: "nodeEllipse" },
  { label: "Rombo", value: "nodeRombo" },
  // Agrega aquí tus tipos personalizados
];

// Función principal
function Flow() {
  // Hooks para obtener y asignar nuevos nodos y aristas
  const [nodes, setNodes] = useState(nodosIniciales);
  const [edges, setEdges] = useState(aristasIniciales);

  // Hooks para conservar el último ID de nodo añadido
  const ultimoId = useRef(3); // Está así para contar las dos iniciales, si esas se borran, recuerden cambiar este valor
  // Valores para coordenadas que se usan cuando se añade un nodo individual
  const xPos = useRef(50);
  const yPos = useRef(50);

  // Hooks para almacenar los nodos iniciales y finales
  const [nodoInicial] = useState("");
  const [nodoFinal] = useState("");

  // Hook para el estado del panel minimizable
  const [minimized, setMinimized] = useState(false);

  // Handler para añadir/modificar/eliminar nodos, no hace falta modificar
  const onNodesChange = useCallback(
    (changes: NodeChange<defaultNodeModel>[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const [selectedType, setSelectedType] = useState("nodeTest");
  // Handler para añadir un nodo específico
  const addNode = useCallback(() => {
    ultimoId.current++;
    setNodes((nds: defaultNodeModel[]) => [
      ...nds,
      {
        id: ultimoId.current.toString(),
        position: { x: xPos.current, y: yPos.current },
        data: { label: ultimoId.current.toString() },
        type: selectedType, // ← usa el tipo seleccionado
      },
    ]);
  }, [selectedType]);

  // Handler para añadir/modificar/eliminar aristas, no hace falta modificar
  const onEdgesChange = useCallback(
    (changes: EdgeChange<defaultEdgeModel>[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Handler para manejar la conexión de nodos, no hace falta modificar
  const onConnect = useCallback(
    (params: import("@xyflow/react").Connection) =>
      setEdges((eds) => addEdge(params, eds)),
    []
  );

  // Handler para botón de prueba, muestra en la consola la estructura de los nodos y aristas
  const pruebaOnClick = () => {
    console.log(nodes);
    console.log(edges);
  };

  // Handler para eliminar aristas y nodos de la pantalla, y para resetear último nodo
  const limpiarPantalla = useCallback(() => {
    ultimoId.current = 0;
    setEdges(() => {
      return [];
    });
    setNodes(() => {
      return [];
    });
  }, []);

  // Historial para deshacer (Ctrl+Z) y rehacer (Ctrl+Y)
  const [history, setHistory] = useState<{ nodes: defaultNodeModel[]; edges: defaultEdgeModel[] }[]>([]);
  const [redoHistory, setRedoHistory] = useState<{ nodes: defaultNodeModel[]; edges: defaultEdgeModel[] }[]>([]);
  // Portapapeles para copiar/pegar/cortar/duplicar
  const clipboard = useRef<defaultNodeModel[] | null>(null);

  // Guardar estado en historial
  const saveToHistory = useCallback(() => {
    setHistory((h) => [...h, { nodes: [...nodes], edges: [...edges] }]);
    setRedoHistory([]); // Limpiar historial de rehacer al hacer una nueva acción
  }, [nodes, edges]);

  // Atajos de teclado
  const getSelectedNodes = () => nodes.filter((n: any) => n.selected);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    setRedoHistory((rh) => [...rh, { nodes: [...nodes], edges: [...edges] }]);
    const prev = history[history.length - 1];
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setHistory((h) => h.slice(0, -1));
  }, [history, nodes, edges]);

  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0) return;
    const next = redoHistory[redoHistory.length - 1];
    saveToHistory(); // Guardar estado actual antes de rehacer
    setNodes(next.nodes);
    setEdges(next.edges);
    setRedoHistory((rh) => rh.slice(0, -1));
  }, [redoHistory, saveToHistory]);

  const handleCopy = useCallback(() => {
    clipboard.current = getSelectedNodes();
  }, [nodes]);

  const handlePaste = useCallback(() => {
    if (clipboard.current && clipboard.current.length > 0) {
      saveToHistory();
      let idCounter = ultimoId.current;
      const newNodes = clipboard.current.map((n) => {
        idCounter++;
        return {
          ...n,
          id: idCounter.toString(),
          position: { x: n.position.x + 40, y: n.position.y + 40 },
          selected: false,
        };
      });
      ultimoId.current = idCounter;
      setNodes((nds) => [...nds, ...newNodes]);
    }
  }, [saveToHistory]);

  const handleCut = useCallback(() => {
    saveToHistory();
    clipboard.current = getSelectedNodes();
    setNodes((nds) => nds.filter((n: any) => !n.selected));
  }, [nodes, saveToHistory]);

  const handleDuplicate = useCallback(() => {
    const selected = getSelectedNodes();
    if (selected.length > 0) {
      saveToHistory();
      let idCounter = ultimoId.current;
      const newNodes = selected.map((n) => {
        idCounter++;
        return {
          ...n,
          id: idCounter.toString(),
          position: { x: n.position.x + 40, y: n.position.y + 40 },
          selected: false,
        };
      });
      ultimoId.current = idCounter;
      setNodes((nds) => [...nds, ...newNodes]);
    }
  }, [nodes, saveToHistory]);

  // Tema oscuro/claro
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  // Devuelve la pantalla principal de React Flow
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Ocupa el tamaño completo de la pantalla del navegador */}
      <div style={{ height: "100%" }}>
        <KeyboardShortcuts
          onUndo={handleUndo}
          onRedo={handleRedo} // <-- Prop onRedo añadida
          onCopy={handleCopy}
          onPaste={handlePaste}
          onCut={handleCut}
          onDuplicate={handleDuplicate}
        />
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
          <Panel position="top-left">
            <Box
              className="panel-box"
              sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                border: '1.5px solid',
                borderColor: 'divider',
                borderRadius: '10px',
                padding: '14px 18px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                fontSize: '1rem',
                minWidth: '180px',
                margin: '8px 0',
              }}
            >
              <Typography className="top-left-text" sx={{ color: 'text.primary', fontSize: '16px' }}>
                Nodo inicial:{" "}
                {nodoInicial === "" ? "Sin seleccionar" : nodoInicial}
              </Typography>
              <Typography className="top-left-text" sx={{ color: 'text.primary', fontSize: '16px' }}>
                Nodo final: {nodoFinal === "" ? "Sin seleccionar" : nodoFinal}
              </Typography>
            </Box>
          </Panel>
          <Panel position="top-center">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                bgcolor: darkMode ? 'rgba(30,30,40,0.55)' : 'rgba(220,220,230,0.75)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                padding: '16px 32px',
                margin: '0 auto',
                minWidth: 600,
                maxWidth: '90vw',
              }}
            >
              <NodeTypeDropdown
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                nodeTypesArray={nodeTypesArray}
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    minWidth: 180,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    backdropFilter: 'blur(8px)',
                    bgcolor: darkMode ? 'rgba(40,60,90,0.85)' : 'background.paper',
                    color: darkMode ? 'primary.main' : 'primary.dark',
                    border: '1.5px solid',
                    borderColor: 'primary.main',
                    '&:hover': { bgcolor: darkMode ? 'rgba(40,60,120,0.95)' : 'grey.100' }
                  }}
                  onClick={addNode}
                >
                  AÑADIR NUEVO NODO
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{
                    minWidth: 180,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    backdropFilter: 'blur(8px)',
                    bgcolor: darkMode ? 'rgba(80,60,120,0.7)' : 'background.paper',
                    color: darkMode ? 'secondary.light' : 'secondary.dark',
                    border: '1.5px solid',
                    borderColor: 'secondary.main',
                    '&:hover': { bgcolor: darkMode ? 'rgba(120,80,180,0.85)' : 'grey.100' }
                  }}
                  onClick={limpiarPantalla}
                >
                  LIMPIAR PANTALLA
                </Button>
                <Button
                  variant="text"
                  color="info"
                  sx={{
                    minWidth: 180,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    backdropFilter: 'blur(8px)',
                    bgcolor: darkMode ? 'rgba(40,80,90,0.7)' : 'background.paper',
                    color: darkMode ? 'info.light' : 'info.dark',
                    border: '1.5px solid',
                    borderColor: 'info.main',
                    '&:hover': { bgcolor: darkMode ? 'rgba(40,120,140,0.85)' : 'grey.100' }
                  }}
                  onClick={pruebaOnClick}
                >
                  IMPRIMIR NODOS Y ARISTAS
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    minWidth: 180,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    backdropFilter: 'blur(8px)',
                    bgcolor: darkMode ? 'rgba(40,60,90,0.5)' : 'background.paper',
                    color: darkMode ? 'primary.light' : 'primary.dark',
                    border: '1.5px solid',
                    borderColor: 'primary.main',
                    '&:hover': { bgcolor: darkMode ? 'rgba(40,60,120,0.7)' : 'grey.100' }
                  }}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? 'MODO CLARO' : 'MODO OSCURO'}
                </Button>
              </Stack>
            </Box>
          </Panel>
          <Panel
            position="top-right" /* Panel para mostrar controles en la esquina superior derecha */
          >
            <Box
              className={`postit${minimized ? " minimized" : ""}`}
              onClick={() => setMinimized(!minimized)}
              sx={{
                bgcolor: darkMode ? 'rgba(40,40,40,0.96)' : 'background.paper',
                color: 'text.primary',
                width: minimized ? '80px' : '320px',
                minHeight: minimized ? '32px' : '120px',
                padding: minimized ? '10px 8px' : '20px 18px',
                borderRadius: '10px 40px 10px 10px',
                boxShadow: '2px 4px 16px rgba(0, 0, 0, 0.15)',
                fontFamily: '\'Segoe UI\', Arial, sans-serif',
                fontSize: minimized ? '0.9rem' : '1rem',
                margin: '24px auto',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(.4, 2, .6, 1)',
                overflow: 'hidden',
                display: 'block',
                textAlign: minimized ? 'center' : 'left',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '4px 8px 24px rgba(0, 0, 0, 0.2)',
                },
                '& .top-right-header': {
                  color: 'text.primary',
                  fontSize: '18px',
                  marginTop: 0,
                  marginBottom: '10px',
                },
                '& .top-right-text': {
                  color: 'text.secondary',
                  fontSize: '16px',
                  margin: 0,
                  paddingLeft: '18px',
                  '& li': {
                    marginBottom: '8px',
                  }
                },
                '& .minimized ul, & .minimized h4, & .minimized br': {
                    display: 'none',
                }
              }}
              title="Haz clic para expandir o reducir"
            >
              <center>
                <h4 className="top-right-header">Controles</h4>
              </center>
              <ul className="top-right-text">
                <li>Desplazarse: haz clic fuera de un nodo y arrastra</li>
                <li>
                  Seleccionar múltiples nodos: Shift + clic y arrastra para
                  seleccionar múltiples nodos y aristas
                </li>
                <li>Borrar nodo/arista: haz clic y pulsa Retroceso</li>
                <li>
                  Conectar nodos: haz clic y arrastra desde un conector, y suelta
                  en otro del nodo a conectar
                </li>
              </ul>
              <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, marginTop: 8 }}>
                <b>Atajos útiles:</b>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li><b>Ctrl+Z</b>: Deshacer</li>
                  <li><b>Ctrl+Y</b>: Rehacer</li> {/* <-- Añadido atajo Ctrl+Y */} 
                  <li><b>Ctrl+C</b>: Copiar nodo(s) seleccionado(s)</li>
                  <li><b>Ctrl+V</b>: Pegar nodo(s)</li>
                  <li><b>Ctrl+X</b>: Cortar nodo(s)</li>
                  <li><b>Ctrl+D</b>: Duplicar nodo(s)</li>
                </ul>
              </div>
            </Box>
          </Panel>
          <Panel
            position="bottom-center" /* Panel para mostrar opciones de algoritmos */
          >
            <>Usen este panel para elegir algoritmos</>
          </Panel>
        </ReactFlow>
      </div>
    </ThemeProvider>
  );
}

export default Flow;
