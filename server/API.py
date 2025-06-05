from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Tuple, List, Optional
import math
from Busquedas import (
    busquedaAmplitud,
    busquedaProfundidad,
    busquedaProfundidadIterativa,
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
    algoritmo: str  # BFS, DFS, IDDFS, Costo Uniforme, Ávara, A*

def construir_grafo(aristas: Dict[str, float]) -> Dict[str, List[Tuple[str, float]]]:
    grafo = {}
    for clave, peso in aristas.items():
        if '-' not in clave:
            continue
        a, b = clave.split('-')
        grafo.setdefault(a, []).append((b, peso))
        grafo.setdefault(b, []).append((a, peso))  # Asumimos no dirigido
    return grafo

@app.post("/buscar")
def buscar_camino(data: GrafoInput):
    grafo = construir_grafo(data.aristas)
    coords = data.nodos
    inicio = data.inicio
    meta = data.meta
    algoritmo = data.algoritmo

    if not validar_para(algoritmo, grafo, coords, meta):
        raise HTTPException(status_code=400, detail="Datos inválidos para el algoritmo seleccionado.")

    if algoritmo == "BFS":
        camino, costo = busquedaAmplitud(grafo, inicio, meta)
    elif algoritmo == "DFS":
        camino, costo = busquedaProfundidad(grafo, inicio, meta)
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
        #"padres": padres
    }
    
    
