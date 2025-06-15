from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional, Tuple, List
from app.Busquedas import (
    busquedaAmplitud,
    busquedaProfundidad,
    busquedaProfundidadIterativa,
    busquedaProfundidadLimitada,
    busquedaCostoUniforme,
    busquedaAvara,
    busquedaAEstrella,
    validar_para
)

app = FastAPI()

class GrafoInput(BaseModel):
    nodos: Dict[str, Tuple[float, float]] = {}
    aristas: Dict[str, float]
    inicio: str
    meta: str
    algoritmo: str  # Valores permitidos: BFS, DFS, IDDFS, Costo Uniforme, Ávara, A*, DLS
    limite: Optional[int] = None

def construir_grafo(aristas: Dict[str, float]) -> Dict[str, List[Tuple[str, float]]]:
    grafo = {}
    for clave, peso in aristas.items():
        if '-' not in clave:
            continue
        a, b = clave.split('-', 1)  # Limitar split a 1, por si acaso
        grafo.setdefault(a, []).append((b, peso))
        grafo.setdefault(b, []).append((a, peso))  # Grafo no dirigido
    return grafo

@app.post("/buscar")
def buscar_camino(data: GrafoInput):
    grafo = construir_grafo(data.aristas)
    coords = data.nodos
    inicio = data.inicio
    meta = data.meta
    algoritmo = data.algoritmo.strip()  # Por si hay espacios extra

    if inicio not in grafo:
        raise HTTPException(status_code=400, detail=f"Nodo inicio '{inicio}' no existe en el grafo.")
    if meta not in grafo:
        raise HTTPException(status_code=400, detail=f"Nodo meta '{meta}' no existe en el grafo.")

    if not validar_para(algoritmo, grafo, coords, meta):
        raise HTTPException(status_code=400, detail="Datos inválidos para el algoritmo seleccionado.")

    if algoritmo == "BFS":
        camino, costo = busquedaAmplitud(grafo, inicio, meta)
    elif algoritmo == "DFS":
        camino, costo = busquedaProfundidad(grafo, inicio, meta)
    elif algoritmo == "DLS":
        if data.limite is None:
            raise HTTPException(status_code=400, detail="Debe especificarse un límite para la búsqueda en profundidad limitada.")
        camino, costo = busquedaProfundidadLimitada(grafo, inicio, meta, data.limite)
    elif algoritmo == "IDDFS":
        camino, costo = busquedaProfundidadIterativa(grafo, inicio, meta)
    elif algoritmo == "Costo Uniforme":
        camino, costo = busquedaCostoUniforme(grafo, inicio, meta)
    elif algoritmo == "Ávara":
        camino, costo = busquedaAvara(grafo, coords, inicio, meta)
    elif algoritmo == "A*":
        camino, costo = busquedaAEstrella(grafo, coords, inicio, meta)
    else:
        raise HTTPException(status_code=400, detail="Algoritmo no reconocido.")

    if camino is None:
        return {"mensaje": "No se encontró un camino."}

    return {
        "camino": camino,
        "costo": costo,
    }
