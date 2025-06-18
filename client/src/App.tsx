import { useEffect, useRef, useState } from "react";
import FiguresCanvas from "./components/FiguresCanvas";
import type { FiguraOriginal } from "./utils/geometry";

function getVertices(fig: FiguraOriginal) {
  return [
    { x: fig.x, y: fig.y },
    { x: fig.x + fig.width, y: fig.y },
    { x: fig.x, y: fig.y + fig.height },
    { x: fig.x + fig.width, y: fig.y + fig.height },
  ];
}

function App() {
  const initialFig = { id: "a", x: 360, y: 260, width: 80, height: 80 };
  const [figuras, setFiguras] = useState<FiguraOriginal[]>([initialFig]);
  const [mode, setMode] = useState<"edit" | "inflated" | "rasterize" | "nodes">("edit");

  // Algoritmos disponibles
  const algoritmos = [
    { value: "BFS", label: "Búsqueda en Amplitud (BFS)" },
    { value: "DFS", label: "Búsqueda en Profundidad (DFS)" },
    { value: "DLS", label: "Profundidad Limitada (DLS)" },
    { value: "IDDFS", label: "Profundidad Iterativa (IDDFS)" },
    { value: "Costo Uniforme", label: "Costo Uniforme" },
    { value: "Ávara", label: "Ávara" },
    { value: "A*", label: "A*" },
  ];
  const [algoritmo, setAlgoritmo] = useState(algoritmos[0].value);
  const [grafo, setGrafo] = useState<any>(null);
  const [grafoJson, setGrafoJson] = useState<string>("");

  // Almacenar los rectángulos negros grandes y los rasterizados manualmente
  const [inflatedFiguras, setInflatedFiguras] = useState<FiguraOriginal[]>([]);
  const [rasterizedFiguras, setRasterizedFiguras] = useState<FiguraOriginal[]>([]);

  // Nodos (vértices de infladas)
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  // Estado para drag
  const dragId = useRef<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Estado para redimensionar
  const resizeId = useRef<string | null>(null);
  const resizeCorner = useRef<number>(-1);
  const resizeStart = useRef<{ x: number; y: number; fig: FiguraOriginal } | null>(null);

  // Mover figura arrastrando el rectángulo
  const handleMouseDownRect = (e: React.MouseEvent, id: string) => {
    if (mode !== 'edit') return;
    dragId.current = id;
    const fig = figuras.find(f => f.id === id);
    if (!fig) return;
    dragOffset.current = {
      x: e.clientX - fig.x,
      y: e.clientY - fig.y,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    // Lógica de redimensionamiento
    if (resizeId.current && resizeCorner.current !== -1 && resizeStart.current) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      const { fig } = resizeStart.current;
      let nx = fig.x, ny = fig.y, nw = fig.width, nh = fig.height;

      switch (resizeCorner.current) {
        case 0: // top-left
          nx = fig.x + dx; ny = fig.y + dy; nw = fig.width - dx; nh = fig.height - dy;
          break;
        case 1: // top-right
          ny = fig.y + dy; nw = fig.width + dx; nh = fig.height - dy;
          break;
        case 2: // bottom-left
          nx = fig.x + dx; nw = fig.width - dx; nh = fig.height + dy;
          break;
        case 3: // bottom-right
          nw = fig.width + dx; nh = fig.height + dy;
          break;
      }
      // Evitar tamaños negativos
      nw = Math.max(20, nw);
      nh = Math.max(20, nh);

      if (mode === 'rasterize') {
        setRasterizedFiguras(figs => figs.map(f => f.id === resizeId.current ? { ...f, x: nx, y: ny, width: nw, height: nh } : f));
      } else if (mode === 'edit') {
        setFiguras(figs => figs.map(f => f.id === resizeId.current ? { ...f, x: nx, y: ny, width: nw, height: nh } : f));
      }
      return;
    }

    // Lógica de arrastre
    if (dragId.current && mode === 'edit') {
      setFiguras(figs => figs.map(f =>
        f.id === dragId.current
          ? { ...f, x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }
          : f
      ));
    }
  };

  const handleMouseUp = () => {
    dragId.current = null;
    resizeId.current = null;
    resizeCorner.current = -1;
    resizeStart.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  // Iniciar redimensionamiento
  const handleResize = (id: string, corner: number, e: React.MouseEvent) => {
    resizeId.current = id;
    resizeCorner.current = corner;
    const figSource = mode === 'rasterize' ? rasterizedFiguras : figuras;
    const fig = figSource.find(f => f.id === id);
    if (!fig) return;
    resizeStart.current = { x: e.clientX, y: e.clientY, fig: { ...fig } };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    e.stopPropagation();
  };

  // Handlers para edición
  const handleAddFigura = () => {
    const id = (Math.random() * 100000).toFixed(0);
    setFiguras([...figuras, { id, x: 200 + Math.random() * 200, y: 200 + Math.random() * 100, width: 80, height: 80 }]);
  };
  const handleRemoveLast = () => setFiguras(figuras.slice(0, -1));

  // Handlers de modo
  const handleInflar = () => {
    // Crear un rectángulo negro más grande para cada figura original
    const inflated = figuras.map(f => ({
      id: f.id,
      x: f.x - 20,
      y: f.y - 20,
      width: f.width + 40,
      height: f.height + 40
    }));
    setInflatedFiguras(inflated);
    setRasterizedFiguras(inflated.map(f => ({ ...f })));
    setMode('inflated');
  };
  const handleEditar = () => setMode('edit');
  const handleRasterizar = () => setMode('rasterize');
  const handleColocarNodos = () => {
    setMode('nodes');
    setSelectedStart(null);
    setSelectedGoal(null);
  };
  const handleConfirmar = () => {
    setInflatedFiguras(rasterizedFiguras.map(f => ({ ...f })));
    setMode('inflated');
  };

  // Estado para mostrar la ruta y el robot
  const [camino, setCamino] = useState<string[]>([]);
  const [robotPos, setRobotPos] = useState<{ x: number; y: number } | null>(null);
  const [animating, setAnimating] = useState(false);
  const [costoRuta, setCostoRuta] = useState<number | null>(null);

  // Resetear animación al cambiar de algoritmo o calcular nueva ruta
  useEffect(() => {
    setAnimating(false);
    setRobotPos(null);
  }, [algoritmo, camino]);

  // Enviar grafo y nodos seleccionados al backend
  async function buscarRuta() {
    if (!grafo || !selectedStart || !selectedGoal) return;
    const body = {
      nodos: grafo.nodos,
      aristas: grafo.aristas,
      inicio: selectedStart,
      meta: selectedGoal,
      algoritmo,
    };
    try {
      const res = await fetch("http://localhost:8000/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.camino && Array.isArray(data.camino)) {
        setCamino(data.camino);
        setCostoRuta(data.costo ?? calcularCostoRuta(data.camino, grafo.nodos));
        // Mensaje explícito: pasos y distancias
        let detalles = '';
        let total = 0;
        for (let i = 0; i < data.camino.length - 1; i++) {
          const from = data.camino[i];
          const to = data.camino[i + 1];
          const dist = grafo.aristas[`${from}-${to}`] ?? grafo.aristas[`${to}-${from}`] ?? Math.hypot(
            grafo.nodos[to][0] - grafo.nodos[from][0],
            grafo.nodos[to][1] - grafo.nodos[from][1]
          );
          total += dist;
          detalles += `Paso ${i + 1}: ${from} → ${to}   Distancia: ${dist.toFixed(2)}\n`;
        }
        alert(`Ruta encontrada con ${data.camino.length} nodos y costo total ${total.toFixed(2)}:\n\n${detalles}`);
      } else {
        setCamino([]);
        setCostoRuta(null);
        alert("No se encontró ruta entre los nodos seleccionados.\nVerifica que haya conexión en el grafo de visibilidad.");
      }
    } catch (e) {
      setCamino([]);
      setCostoRuta(null);
      alert("Error al buscar ruta.\nVerifica la conexión con el backend.");
    }
  }

  // Calcular costo de ruta localmente (euclidiano)
  function calcularCostoRuta(camino: string[], nodos: Record<string, [number, number]>) {
    let total = 0;
    for (let i = 0; i < camino.length - 1; i++) {
      const [x1, y1] = nodos[camino[i]];
      const [x2, y2] = nodos[camino[i + 1]];
      total += Math.hypot(x2 - x1, y2 - y1);
    }
    return total;
  }

  // Animar robot sobre el camino (solo cuando se presiona el botón)
  function iniciarAnimacion() {
    if (!camino.length || !grafo) return;
    setRobotPos({ x: grafo.nodos[camino[0]][0], y: grafo.nodos[camino[0]][1] });
    setAnimating(true);
  }

  useEffect(() => {
    if (!animating || camino.length === 0 || !grafo) return;
    let i = 0;
    setRobotPos({ x: grafo.nodos[camino[0]][0], y: grafo.nodos[camino[0]][1] });
    const interval = setInterval(() => {
      i++;
      if (i >= camino.length) {
        setAnimating(false);
        clearInterval(interval);
        return;
      }
      setRobotPos({ x: grafo.nodos[camino[i]][0], y: grafo.nodos[camino[i]][1] });
    }, 600);
    return () => clearInterval(interval);
  }, [animating, camino, grafo]);

  function resetAnimacion() {
    setAnimating(false);
    setRobotPos(null);
  }

  // Scroll drag
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || dragId.current || resizeId.current) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-interactive="true"]')) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, scrollLeft: container.scrollLeft, scrollTop: container.scrollTop };
      document.body.style.cursor = "grab";
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      container.scrollLeft = panStart.current.scrollLeft - dx;
      container.scrollTop = panStart.current.scrollTop - dy;
    };
    const onMouseUp = () => {
      isPanning.current = false;
      document.body.style.cursor = "default";
    };
    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Estado de zoom y pan
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const scaleBy = 1.15;
        const mouseX = e.clientX - container.getBoundingClientRect().left;
        const mouseY = e.clientY - container.getBoundingClientRect().top;
        let newZoom = zoom;
        if (e.deltaY < 0) newZoom = Math.min(zoom * scaleBy, 5);
        else newZoom = Math.max(zoom / scaleBy, 0.2);
        setOffset(prev => ({ x: (prev.x - mouseX) * (newZoom / zoom) + mouseX, y: (prev.y - mouseY) * (newZoom / zoom) + mouseY }));
        setZoom(newZoom);
      }
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [zoom]);

  const renderButtons = () => {
    switch (mode) {
      case 'edit':
        return (
          <>
            <button onClick={handleAddFigura} style={{ fontWeight: 500, padding: "8px 18px", borderRadius: 8, border: "1px solid #bbb", background: "#f8f8f8", cursor: "pointer" }}>Agregar figura</button>
            <button onClick={handleRemoveLast} style={{ fontWeight: 500, padding: "8px 18px", borderRadius: 8, border: "1px solid #bbb", background: "#f8f8f8", cursor: "pointer" }}>Eliminar última</button>
            <button onClick={handleInflar} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "#b71c1c", color: "#fff", border: "none", cursor: "pointer" }}>Inflar figuras</button>
          </>
        );
      case 'inflated':
        return (
          <>
            <button onClick={handleEditar} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "#b71c1c", color: "#fff", border: "none", cursor: "pointer" }}>Editar figuras</button>
            <button onClick={handleRasterizar} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "#222", color: "#fff", border: "none", cursor: "pointer" }}>Rasterizar manual</button>
            <button onClick={handleColocarNodos} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "#1976d2", color: "#fff", border: "none", cursor: "pointer" }}>Colocar Nodos</button>
          </>
        );
      case 'rasterize':
        return (
          <>
            <button onClick={() => setMode('inflated')} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "#b71c1c", color: "#fff", border: "none", cursor: "pointer" }}>Cancelar</button>
            <button onClick={handleConfirmar} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "#222", color: "#fff", border: "none", cursor: "pointer" }}>Confirmar cambios</button>
          </>
        );
      case 'nodes':
        return null;
    }
  };

  // Calcular nodos (vértices) de las infladas actuales y enumerarlos
  const nodes = (mode === 'nodes' ? inflatedFiguras : []).flatMap((fig, figIdx) =>
    getVertices(fig).map((v, i) => ({
      ...v,
      id: `${fig.id}_${i}`,
      label: `${figIdx * 4 + i + 1}` // Enumeración global
    }))
  );

  // Generar grafo de visibilidad (nodos y aristas)
  const generarGrafo = () => {
    // Nodos: todos los vértices de las infladas
    const nodos: Record<string, [number, number]> = {};
    const aristas: Record<string, number> = {};
    const allVerts: { id: string; x: number; y: number }[] = [];
    for (const fig of inflatedFiguras) {
      const verts = getVertices(fig);
      for (let i = 0; i < 4; i++) {
        const id = `${fig.id}_${i}`;
        nodos[id] = [verts[i].x, verts[i].y];
        allVerts.push({ id, x: verts[i].x, y: verts[i].y });
      }
    }
    // Visibilidad: conectar todos los pares de nodos si el segmento no cruza ningún rectángulo inflado
    function segmentIntersectsRect(x1: number, y1: number, x2: number, y2: number, rect: FiguraOriginal) {
      // Si ambos extremos están dentro del rectángulo, no es válido
      if (
        x1 > rect.x && x1 < rect.x + rect.width && y1 > rect.y && y1 < rect.y + rect.height &&
        x2 > rect.x && x2 < rect.x + rect.width && y2 > rect.y && y2 < rect.y + rect.height
      ) return true;
      // Revisar intersección con cada lado
      const sides = [
        [rect.x, rect.y, rect.x + rect.width, rect.y], // top
        [rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height], // right
        [rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height], // bottom
        [rect.x, rect.y + rect.height, rect.x, rect.y], // left
      ];
      for (const [x3, y3, x4, y4] of sides) {
        if (segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4)) return true;
      }
      return false;
    }
    function ccw(ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
      return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
    }
    function segmentsIntersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
      return (
        ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) &&
        ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4)
      );
    }
    for (let i = 0; i < allVerts.length; i++) {
      for (let j = i + 1; j < allVerts.length; j++) {
        const a = allVerts[i], b = allVerts[j];
        let blocked = false;
        for (const rect of inflatedFiguras) {
          if (segmentIntersectsRect(a.x, a.y, b.x, b.y, rect)) {
            blocked = true;
            break;
          }
        }
        if (!blocked) {
          const dist = Math.hypot(b.x - a.x, b.y - a.y);
          aristas[`${a.id}-${b.id}`] = dist;
          aristas[`${b.id}-${a.id}`] = dist;
        }
      }
    }
    setGrafo({ nodos, aristas });
    setGrafoJson(JSON.stringify({ nodos, aristas }, null, 2));
  };

  // En modo 'nodes', mostrar controles para seleccionar nodos y buscar ruta
  const renderNodesControls = () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <select value={algoritmo} onChange={e => setAlgoritmo(e.target.value)} style={{ fontWeight: 500, padding: "8px 18px", borderRadius: 8, border: "1px solid #bbb", background: "#f8f8f8", cursor: "pointer" }}>
        {algoritmos.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
      </select>
      <button onClick={generarGrafo} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "#1976d2", color: "#fff", border: "none", cursor: "pointer" }}>Generar grafo</button>
      <button onClick={() => setSelecting('start')} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: selectedStart ? '#1976d2' : '#bbb', color: "#fff", border: "none", cursor: "pointer" }}>Seleccionar nodo inicial</button>
      <button onClick={() => setSelecting('goal')} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: selectedGoal ? '#43a047' : '#bbb', color: "#fff", border: "none", cursor: "pointer" }}>Seleccionar nodo meta</button>
      <button onClick={buscarRuta} disabled={!selectedStart || !selectedGoal || !grafo} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "#b71c1c", color: "#fff", border: "none", cursor: "pointer" }}>Buscar ruta</button>
      <button onClick={iniciarAnimacion} disabled={!camino.length || animating} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "#222", color: "#fff", border: "none", cursor: "pointer" }}>Iniciar animación</button>
      <button onClick={resetAnimacion} disabled={!robotPos && !animating} style={{ fontWeight: 600, padding: "8px 18px", borderRadius: 8, background: "#bbb", color: "#222", border: "none", cursor: "pointer" }}>Reset animación</button>
      {costoRuta !== null && <span style={{ fontWeight: 600, color: '#1976d2', marginLeft: 8 }}>Costo: {costoRuta.toFixed(2)}</span>}
      {grafoJson && <textarea value={grafoJson} readOnly style={{ width: 320, height: 120, fontSize: 13, fontFamily: 'monospace', background: '#f8f8f8', border: '1px solid #bbb', borderRadius: 8, padding: 8 }} />}
    </div>
  );

  // Control de selección de nodos
  const [selecting, setSelecting] = useState<null | 'start' | 'goal'>(null);
  const handleSelectNode = (nodeId: string) => {
    if (selecting === 'start') {
      setSelectedStart(nodeId);
      setSelecting(null);
    } else if (selecting === 'goal') {
      setSelectedGoal(nodeId);
      setSelecting(null);
    } else {
      // Comportamiento anterior: alternar selección
      if (!selectedStart) setSelectedStart(nodeId);
      else if (!selectedGoal && nodeId !== selectedStart) setSelectedGoal(nodeId);
      else if (nodeId === selectedStart) setSelectedStart(null);
      else if (nodeId === selectedGoal) setSelectedGoal(null);
    }
  };

  return (
    <div ref={containerRef} style={{ width: "100vw", height: "100vh", background: "#f7f7f7", position: "relative", overflow: "auto", cursor: "default" }}>
      <div style={{ width: 2000, height: 1200, position: "relative" }}>
        <svg width="2000" height="1200" style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}>
          <defs><pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#bbb" /></pattern></defs>
          <rect width="2000" height="1200" fill="url(#dots)" />
        </svg>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "0 0", pointerEvents: "none" }}>
          <FiguresCanvas
            figuras={figuras}
            inflatedFiguras={mode === 'rasterize' ? rasterizedFiguras : inflatedFiguras}
            mode={mode}
            onMouseDownRect={handleMouseDownRect}
            onResize={handleResize}
            nodes={nodes}
            selectedStart={selectedStart}
            selectedGoal={selectedGoal}
            onSelectNode={handleSelectNode}
            camino={camino}
            robotPos={robotPos}
          />
        </div>
      </div>
      <div style={{ position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)", zIndex: 10, background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px #0002", padding: "18px 32px", display: "flex", gap: 16, alignItems: "center" }}>
        {renderButtons()}
        {mode === 'nodes' && renderNodesControls()}
      </div>
    </div>
  );
}

export default App;
