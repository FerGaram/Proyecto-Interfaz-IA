# ----------------------------------
# Búsquedas
# ----------------------------------

import math


def busquedaAmplitud(grafo, inicio, meta):
    cola = [inicio]
    padres = {inicio: None}
    print("BFS pasos:")
    
    while cola:
        actual = cola.pop(0)

        camino_p = []
        node = actual
        while node is not None:
            camino_p.insert(0, node)
            node = padres[node]
        print(" -> ".join(camino_p))

        if actual == meta:
            costo = len(camino_p) - 1  # Cada arista cuesta 1
            return camino_p, costo

        for v, _ in grafo.get(actual, []):
            if v not in padres:
                padres[v] = actual
                cola.append(v)
    
    return None, None




def dfs_limitado(grafo, nodo_actual, objetivo, profundidad_max, visitados=None, camino=None, padres=None):
    """
    DFS limitada para IDDFS, retorna camino, padres y costo (# aristas).
    """
    if padres is None:
        padres = {}
    if visitados is None:
        visitados = set()
    if camino is None:
        camino = []

    # Marcamos y agregamos al camino
    visitados.add(nodo_actual)
    camino.append(nodo_actual)

    # Verificar objetivo
    if nodo_actual == objetivo:
        costo = len(camino) - 1
        return list(camino), costo, padres

    # Si alcanzamos profundidad máxima
    if profundidad_max <= 0:
        camino.pop()
        visitados.remove(nodo_actual)
        return None, None, padres

    # Explorar vecinos
    for vecino, _ in grafo.get(nodo_actual, []):
        if vecino not in visitados:
            padres[vecino] = nodo_actual
            resultado, padres, costo = dfs_limitado(
                grafo, vecino, objetivo, profundidad_max - 1,
                visitados, camino, padres
            )
            if resultado:
                return resultado, costo, padres

    # Backtrack
    camino.pop()
    visitados.remove(nodo_actual)
    return None, padres, None

def busquedaProfundidad(grafo, nodo_inicio, nodo_meta):
    nodos = [nodo_inicio]  # Pila (modo LIFO)
    padres = {nodo_inicio: None} 

    while nodos:
        print("Nodos: ", nodos)
        nodo = nodos.pop(0)
        print("Nodo: ", nodo)

        if nodo == nodo_meta:
            # Construir camino
            camino = []
            actual = nodo_meta
            while actual is not None:
                camino.insert(0, actual)
                actual = padres[actual]
            costo = len(camino) - 1  
            return camino, costo

        # Expandir
        for hijo in reversed([h for h, _ in grafo.get(nodo, [])]):
            print("hijo:", hijo)
            if padres[nodo] is not None and hijo == padres[nodo]:
                continue  
            if hijo not in padres:
                padres[hijo] = nodo
                nodos.insert(0, hijo)

    return None, None



def busquedaProfundidadIterativa(grafo, inicio, meta, maxima_profundidad=10):
    """Búsqueda por profundización iterativa (IDDFS).
    Retorna camino, costo (# aristas) y padres, o (None, None, {}) si no se encuentra."""
    for limite in range(maxima_profundidad + 1):
        print(f"Intentando IDDFS con límite={limite}")
        resultado, padres, costo = dfs_limitado(
            grafo, inicio, meta, limite
        )
        if resultado:
            print(f"Meta encontrada con costo {costo}")
            return resultado, costo
    print("No se encontró la meta dentro del límite dado.")
    return None, None



def busquedaAvara(grafo, coords, inicio, meta):
    def heuristica(n):
        if n in coords and meta in coords:
            x1, y1 = coords[n]
            x2, y2 = coords[meta]
            return math.hypot(x2 - x1, y2 - y1)
        return 0

    nodos = [inicio]
    padres = {inicio: None}
    visitados = set()
    costo_total = {inicio: 0} 

    print("Avara pasos:")
    while nodos:
        print("Lista de nodos:", nodos)
        nodo = nodos.pop(0) 
        print("Expandimos:", nodo)

        if nodo == meta:
            camino = []
            actual = meta
            while actual is not None:
                camino.insert(0, actual)
                actual = padres[actual]
            return camino, costo_total[meta]

        visitados.add(nodo)

        hijos = []
        for hijo, peso in grafo.get(nodo, []):
            if hijo not in visitados and hijo not in nodos:
                padres[hijo] = nodo
                costo_total[hijo] = costo_total[nodo] + peso
                hijos.append(hijo)

        hijos.sort(key=lambda x: heuristica(x))
        print("Frontera:", hijos)

        for hijo in hijos:
            i = 0
            while i < len(nodos) and heuristica(hijo) >= heuristica(nodos[i]):
                i += 1
            nodos.insert(i, hijo)

    return None, None, None

def busquedaCostoUniforme(grafo, inicio, meta):
    frontera = [(0, inicio)]
    padres = {inicio: None}
    costos = {inicio: 0}
    visitados = set()

    while frontera:
        frontera.sort(key=lambda x: x[0])
        costo_actual, nodo = frontera.pop(0)

        if nodo in visitados:
            continue

        if nodo == meta:
            camino = []
            while nodo:
                camino.insert(0, nodo)
                nodo = padres[nodo]
            print("\nCosto total del camino:", costo_actual)
            return camino, costo_actual

        visitados.add(nodo)
        for vecino, peso in grafo.get(nodo, []):
            nuevo_costo = costo_actual + peso
            if vecino not in costos or nuevo_costo < costos[vecino]:
                costos[vecino] = nuevo_costo
                padres[vecino] = nodo
                if vecino not in visitados:
                    frontera.append((nuevo_costo, vecino))

    return None, None # si no se encontró camino



def busquedaAEstrella(grafo, coords, inicio, meta):
    def h(n):
        if n not in coords or meta not in coords:
            raise ValueError(f"No hay coordenadas para {n} o {meta}")
        x1, y1 = coords[n]; x2, y2 = coords[meta]
        return math.hypot(x2 - x1, y2 - y1)

    frontera = [(0, inicio)]
    padres = {inicio: None}
    costos = {inicio: 0}
    visitados = set()

    tabla = []

    while frontera:
        frontera.sort(key=lambda x: costos[x[1]] + h(x[1]))
        _, nodo = frontera.pop(0)

        if nodo in visitados:
            continue

        f_n = round(costos[nodo] + h(nodo), 2)
        tabla.append((nodo, round(costos[nodo], 2), round(h(nodo), 2), f_n))

        if nodo == meta:
            camino = []
            while nodo:
                camino.insert(0, nodo)
                nodo = padres[nodo]

            # Imprimir tabla
            print("\nTabla de nodos expandido en A*:")
            print(f"{'Nodo':<8}{'g(n)':<8}{'h(n)':<8}{'f(n)':<8}")
            for fila in tabla:
                print(f"{fila[0]:<8}{fila[1]:<8}{fila[2]:<8}{fila[3]:<8}")
            print("Costo total del camino:", costos[meta])
            return camino, costos[meta]

        visitados.add(nodo)

        for vecino, peso in grafo.get(nodo, []):
            nuevo_costo = costos[nodo] + peso
            if vecino not in costos or nuevo_costo < costos[vecino]:
                costos[vecino] = nuevo_costo
                padres[vecino] = nodo
                if vecino not in visitados:
                    frontera.append((nuevo_costo, vecino))

    return None, None


def validar_para(algoritmo, grafo, coords, meta):
    if meta not in grafo:
        print(f"❌ El nodo meta '{meta}' no existe en el grafo.")
        return False

    if algoritmo in ("A*", "Ávara"):
        if not coords or meta not in coords:
            print(f"❌ El grafo no tiene coordenadas suficientes para {algoritmo}.")
            return False

    if algoritmo in ("A*", "Costo Uniforme"):
        tiene_pesos = any(w != 1.0 for vecinos in grafo.values() for _, w in vecinos)
        if not tiene_pesos:
            print(f"⚠️ El grafo no tiene pesos definidos. {algoritmo} tratará todos como 1.")
    return True