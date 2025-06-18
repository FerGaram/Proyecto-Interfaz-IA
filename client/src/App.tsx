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
  type MiniMapNodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./App.css";
import type { defaultNodeModel } from "./models/defaultNodeModel";
import type { defaultEdgeModel } from "./models/defaultEdgeModel";
import { NodeTest } from "./components/nodes/NodeTest";
import { NodeRombo } from "./components/nodes/NodeRombo";
import { RobotNode } from "./components/nodes/RobotNode";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useRobotMovement } from "./components/useRobotMovement";
import { convertirAGrafoJSON } from "./controllers/toFromJson";

import { generarConexionesSinColision } from "./utils/autoConnectUtils";
import { HelpPanel } from "./components/HelpPanel";
import { NodeSelectionPanel } from "./components/NodeSelectionPanel";
import { TopActionsPanel } from "./components/TopActionsPanel";
import { AlgorithmPanel } from "./components/AlgorithmPanel";



// Aquí se deben importar los nodos personalizados que se hayan hecho
const nodeTypes = {
  nodeTest: NodeTest,
  nodeRombo: NodeRombo,
  nodeRobot: RobotNode,
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
  {
    id: "0",
    position: { x: 400, y: 200 },
    data: { label: "Robot" },
    type: "nodeRobot",
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
  { label: "Rectángulo", value: "nodeTest" },
  { label: "Rombo", value: "nodeRombo" },
  // Agrega aquí tus tipos personalizados
];

// Componente personalizado para MiniMap con tipado correcto
function MiniMapNodeCustom(props: MiniMapNodeProps) {
  const {
    x,y,width,height,style = {},selected,strokeColor,
    strokeWidth: sw,color,borderRadius,className,
  } = props;
  const stroke = selected ? "#ff3333" : strokeColor || "#222";
  const strokeWidth = selected ? 6 : sw || 2;
  const fill = color || style.background || "#fff";

  // Detecta tipo por className (React Flow pone el tipo de nodo en la clase)
  const typeClass = (className || "").toLowerCase();
  if (typeClass.includes("rombo")) {
    const cx = Number(x) + Number(width) / 2;
    const cy = Number(y) + Number(height) / 2;
    const w = Number(width) / 2 - strokeWidth;
    const h = Number(height) / 2 - strokeWidth;
    const points = [
      [cx, cy - h],
      [cx + w, cy],
      [cx, cy + h],
      [cx - w, cy],
    ]
      .map((p) => p.join(","))
      .join(" ");
    return (
      <polygon
        points={String(points)}
        fill={String(fill)}
        stroke={String(stroke)}
        strokeWidth={String(strokeWidth)}
      />
    );
  }
  // Rectángulo por defecto
  return (
    <rect
      x={String(Number(x) + strokeWidth / 2)}
      y={String(Number(y) + strokeWidth / 2)}
      width={String(Number(width) - strokeWidth)}
      height={String(Number(height) - strokeWidth)}
      rx={String(borderRadius)}
      fill={String(fill)}
      stroke={String(stroke)}
      strokeWidth={String(strokeWidth)}
    />
  );
}

// Función principal
function Flow() {
  // Hooks para obtener y asignar nuevos nodos y aristas
  const [nodes, setNodes] = useState(nodosIniciales);
  const [edges, setEdges] = useState(aristasIniciales);

  const [algoritmo, setAlgoritmo] = useState("BFS");
  const [modoSeleccion, setModoSeleccion] = useState<"inicio" | "final" | null>(
    null
  );

  // Hooks para conservar el último ID de nodo añadido
  const ultimoId = useRef(3); // Está así para contar las dos iniciales, si esas se borran, recuerden cambiar este valor
  // Valores para coordenadas que se usan cuando se añade un nodo individual
  const xPos = useRef(50);
  const yPos = useRef(50);

  // Hooks para almacenar los nodos iniciales y finales
  const [nodoInicial, setNodoInicial] = useState("");
  const [nodoFinal, setNodoFinal] = useState("");

  const {
    highlightedEdges: solutionEdges,
    setSolutionPathAndHighlight,
    clearSolutionPath,
  } = useRobotMovement();

  // Función para actualizar el solutionPath en el nodo robot
  const updateRobotSolutionPath = useCallback((solutionPath: string[]) => {
    setCurrentSolutionPath(solutionPath);
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.type === "nodeRobot") {
          return {
            ...node,
            data: {
              ...node.data,
              solutionPath: solutionPath,
            },
          };
        }
        return node;
      })
    );
  }, []);

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
  const onConnect = useCallback((params: any) => {
    const nuevoPeso = prompt("Ingrese el peso de la arista:", "1.0") || "1.0";
    const pesoNum = parseFloat(nuevoPeso);

    const edgeConPeso = {
      ...params,
      label: nuevoPeso,
      data: { peso: pesoNum },
    };

    setEdges((eds) => addEdge(edgeConPeso, eds));
  }, []);

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

  const ejecutarAlgoritmo = async () => {
    // Verificar si hay nodos en la pantalla
    if (nodes.length === 0) {
      alert(
        "No hay nodos en la pantalla. Agrega algunos nodos antes de ejecutar el algoritmo."
      );
      return;
    }

    // Verificar si existe un nodo robot
    const robotNode = nodes.find((node) => node.type === "nodeRobot");

    // Si no existe el nodo robot, agregarlo automáticamente
    if (!robotNode) {
      const newRobotId = (ultimoId.current + 1).toString();
      ultimoId.current++;

      const newRobotNode = {
        id: newRobotId,
        position: { x: 400, y: 200 },
        data: { label: "Robot" },
        type: "nodeRobot" as const,
      };

      setNodes((prevNodes) => [...prevNodes, newRobotNode]);

      // Pequeña pausa para asegurar que el nodo se agregue antes de continuar
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const data = convertirAGrafoJSON(
      nodes,
      edges,
      nodoInicial,
      nodoFinal,
      algoritmo
    );

    if (!nodoInicial || !nodoFinal) {
      alert("Selecciona nodo inicial y final.");
      return;
    }

    console.log("Datos enviados al servidor:", data);
    try {
      const resp = await fetch("http://localhost:8000/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resultado = await resp.json();

      if (resp.ok) {
        console.log("Camino:", resultado.camino);

        // Establecer el camino de solución y destacar aristas
        setSolutionPathAndHighlight(resultado.camino);

        // Actualizar el camino en el nodo robot
        updateRobotSolutionPath(resultado.camino);

        alert(
          `Camino encontrado: ${resultado.camino.join(" → ")}\nCosto: ${
            resultado.costo
          }\n\n¡Haz clic en el robot para que siga el camino!`
        );
      } else {
        alert("Error: " + resultado.detail);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor.");
    }
  };

  // Historial para deshacer (Ctrl+Z) y rehacer (Ctrl+Y)
  const [history, setHistory] = useState<
    { nodes: defaultNodeModel[]; edges: defaultEdgeModel[] }[]
  >([]);
  const [redoHistory, setRedoHistory] = useState<
    { nodes: defaultNodeModel[]; edges: defaultEdgeModel[] }[]
  >([]);
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
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  // Derivar nodos y aristas resaltados para evitar ciclos infinitos
  const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
  const styledEdges = edges.map((edge) => {
    const isConnectedToSelected =
      selectedNodeIds.includes(edge.source) ||
      selectedNodeIds.includes(edge.target);
    const isSolutionEdge = solutionEdges.has(edge.id); // Esta viene del hook

    let strokeColor = theme.palette.divider;
    let strokeWidth = 1.5;

    if (isSolutionEdge) {
      strokeColor = "#4CAF50"; // Verde para el camino de solución
      strokeWidth = 3;
    } else if (isConnectedToSelected) {
      strokeColor = theme.palette.primary.main;
      strokeWidth = 2.5;
    }

    return {
      ...edge,
      style: {
        ...(edge.style || {}),
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        transition: "stroke 0.2s, stroke-width 0.2s",
      },
      selected: isConnectedToSelected || isSolutionEdge,
    };
  });
  const highlightedNodes = nodes.map((node) => {
    if (node.selected) {
      return {
        ...node,
        style: {
          ...(node.style || {}),
          boxShadow: `0 0 0 4px ${theme.palette.primary.main}22, 0 2px 12px 0 ${theme.palette.primary.main}11`,
          zIndex: 10,
          transition: "box-shadow 0.25s",
        },
      };
    } else {
      // Elimina el boxShadow si no está seleccionado
      const { boxShadow, zIndex, transition, ...restStyle } = node.style || {};
      return {
        ...node,
        style: restStyle,
      };
    }
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
          nodes={highlightedNodes} // Nodos resaltados
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          edges={styledEdges} // Aristas con estilo
          onEdgesChange={onEdgesChange} // Handler de cambios de aristas
          onConnect={onConnect} // Handler de conexiones
          onNodeClick={(_, node) => {
            if (modoSeleccion === "inicio") {
              setNodoInicial(node.id);
              setModoSeleccion(null); // desactiva modo
            } else if (modoSeleccion === "final") {
              setNodoFinal(node.id);
              setModoSeleccion(null);
            }
          }}
          fitView // Ajusta la pantalla para contener y centrar los nodos iniciales
          connectionMode={ConnectionMode.Loose} // Se define de esta forma para que los conectores puedan iniciar y terminar conexiones
          colorMode={darkMode ? "dark" : "light"}
          defaultEdgeOptions={{ type: 'straight' }}
        >
          <Background /* Fondo punteado */ />
          <Controls /* Botones de la esquina inferior izquierda */ />
          <MiniMap
            nodeStrokeColor={undefined}
            nodeColor={undefined}
            nodeStrokeWidth={undefined}
            maskColor={
              darkMode ? "rgba(30,30,40,0.25)" : "rgba(220,220,230,0.15)"
            }
            nodeComponent={MiniMapNodeCustom}
          />
          <Panel position="top-left">
            <NodeSelectionPanel
              nodoInicial={nodoInicial}
              nodoFinal={nodoFinal}
              setNodoInicial={setNodoInicial}
              setNodoFinal={setNodoFinal}
              modoSeleccion={modoSeleccion}
              setModoSeleccion={setModoSeleccion}
            />
          </Panel>

          <Panel position="top-center">
            <TopActionsPanel
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              nodeTypesArray={nodeTypesArray}
              addNode={addNode}
              limpiarPantalla={limpiarPantalla}
              pruebaOnClick={pruebaOnClick}
              setEdges={setEdges}
              nodes={nodes}
              generarConexionesSinColision={generarConexionesSinColision}
            />
          </Panel>

          <HelpPanel darkMode={darkMode} />

          <Panel position="bottom-center">
            <AlgorithmPanel
              darkMode={darkMode}
              algoritmo={algoritmo}
              setAlgoritmo={setAlgoritmo}
              ejecutarAlgoritmo={ejecutarAlgoritmo}
              clearSolutionPath={clearSolutionPath}
              updateRobotSolutionPath={updateRobotSolutionPath}
            />
          </Panel>

        </ReactFlow>
      </div>
    </ThemeProvider>
  );
}

export default Flow;
