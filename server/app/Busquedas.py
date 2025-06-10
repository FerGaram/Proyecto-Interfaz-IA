import math
from collections import deque

# ----------------------------------
# Búsquedas
# ----------------------------------

def busquedaAmplitud(grafo, inicio, meta, debug=False):
    cola = deque([inicio])
    padres = {inicio: None}

    if debug:
        print("BFS pasos:")

    while cola:
        actual = cola.popleft()

        if debug:
            camino_p = []
            node = actual
            while node is not None:
                camino_p.insert(0, node)
                node = padres[node]
            print(" -> ".join(camino_p))

        if actual == meta:
            camino = []
            while actual is not None:
                camino.insert(0, actual)
                actual = padres[actual]
            return camino, len(camino) - 1

        for v, _ in grafo.get(actual, []):
            if v not in padres:
                padres[v] = actual
                cola.append(v)

    return None, None


def busquedaProfundidad(grafo, nodo_inicio, nodo_meta, debug=False):
    pila = [nodo_inicio]
    padres = {nodo_inicio: None}

    while pila:
        if debug:
            print("Nodos en pila:", pila)

        nodo = pila.pop()  # Cambio: pop() para LIFO

        if debug:
            print("Nodo extraído:", nodo)

        if nodo == nodo_meta:
            camino = []
            while nodo:
                camino.insert(0, nodo)
                nodo = padres[nodo]
            return camino, len(camino) - 1

        for hijo, _ in reversed(grafo.get(nodo, [])):
            if padres[nodo] is not None and hijo == padres[nodo]:
                continue
            if hijo not in padres:
                padres[hijo] = nodo
                pila.append(hijo)  # Cambio: append en vez de insert(0)

    return None, None



def busquedaProfundidadIterativa(grafo, inicio, meta, maxima_profundidad=10, debug=False):
    def dfs_limitado(nodo_actual, profundidad_max, visitados, camino):
        visitados.add(nodo_actual)
        camino.append(nodo_actual)

        if nodo_actual == meta:
            return list(camino)

        if profundidad_max <= 0:
            camino.pop()
            visitados.remove(nodo_actual)
            return None

        for vecino, _ in grafo.get(nodo_actual, []):
            if vecino not in visitados:
                resultado = dfs_limitado(vecino, profundidad_max - 1, visitados, camino)
                if resultado:
                    return resultado

        camino.pop()
        visitados.remove(nodo_actual)
        return None

    for limite in range(maxima_profundidad + 1):
        if debug:
            print(f"Intentando IDDFS con límite={limite}")
        resultado = dfs_limitado(inicio, limite, set(), [])
        if resultado:
            if debug:
                print(f"Meta encontrada con costo {len(resultado) - 1}")
            return resultado, len(resultado) - 1

    if debug:
        print("No se encontró la meta dentro del límite dado.")
    return None, None


def busquedaAvara(grafo, coords, inicio, meta, debug=False):
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

    if debug:
        print("Avara pasos:")

    while nodos:
        if debug:
            print("Lista de nodos:", nodos)

        nodo = nodos.pop(0)

        if debug:
            print("Expandimos:", nodo)

        if nodo == meta:
            camino = []
            while nodo:
                camino.insert(0, nodo)
                nodo = padres[nodo]
            return camino, costo_total[meta]

        visitados.add(nodo)
        hijos = []

        for hijo, peso in grafo.get(nodo, []):
            if hijo not in visitados and hijo not in nodos:
                padres[hijo] = nodo
                costo_total[hijo] = costo_total[nodo] + peso
                hijos.append(hijo)

        hijos.sort(key=heuristica)

        if debug:
            print("Frontera:", hijos)

        for hijo in hijos:
            nodos.append(hijo)

    return None, None


def busquedaCostoUniforme(grafo, inicio, meta, debug=False):
    frontera = [(0, inicio)]
    padres = {inicio: None}
    costos = {inicio: 0}
    visitados = set()

    while frontera:
        frontera.sort()
        costo_actual, nodo = frontera.pop(0)

        if nodo in visitados:
            continue

        if nodo == meta:
            camino = []
            while nodo:
                camino.insert(0, nodo)
                nodo = padres[nodo]
            if debug:
                print("Costo total del camino:", costo_actual)
            return camino, costo_actual

        visitados.add(nodo)

        for vecino, peso in grafo.get(nodo, []):
            nuevo_costo = costo_actual + peso
            if vecino not in costos or nuevo_costo < costos[vecino]:
                costos[vecino] = nuevo_costo
                padres[vecino] = nodo
                if vecino not in visitados:
                    frontera.append((nuevo_costo, vecino))

    return None, None


def busquedaAEstrella(grafo, coords, inicio, meta, debug=False):
    def h(n):
        x1, y1 = coords[n]
        x2, y2 = coords[meta]
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

            if debug:
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
