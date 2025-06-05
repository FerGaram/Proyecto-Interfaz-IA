import requests
import json

def leer_grafo_desde_archivo(ruta):
    grafo, coords = {}, {}
    seccion = None

    with open(ruta, 'r') as archivo:
        for linea in archivo:
            linea = linea.strip()
            if not linea or linea.startswith('#'):
                continue

            encabezado = linea.rstrip(':').upper()
            if encabezado == 'NODE_COORDS':
                seccion = 'coords'
                continue
            if encabezado == 'EDGES':
                seccion = 'edges'
                continue

            if seccion == 'coords':
                nodo, tup = linea.split(':', 1)
                x, y = tup.strip().lstrip('(').rstrip(')').split(',')
                coords[nodo.strip()] = (float(x), float(y))
            elif seccion == 'edges':
                if ':' in linea:
                    arista, peso = linea.split(':', 1)
                    w = float(peso)
                else:
                    arista, w = linea, 1.0
                a, b = [n.strip() for n in arista.split('-')]
                grafo.setdefault(a, []).append((b, w))
                grafo.setdefault(b, []).append((a, w))
    return grafo, coords


def generar_json_para_api(ruta_archivo, inicio, meta, algoritmo):
    grafo, coords = leer_grafo_desde_archivo(ruta_archivo)
    aristas = {}
    for nodo, vecinos in grafo.items():
        for vecino, peso in vecinos:
            clave = f"{nodo}-{vecino}"
            inversa = f"{vecino}-{nodo}"
            if inversa not in aristas:
                aristas[clave] = peso
    return {
        "nodos": {k: list(v) for k, v in coords.items()},
        "aristas": aristas,
        "inicio": inicio,
        "meta": meta,
        "algoritmo": algoritmo
    }

def main():
    ruta = input("Ruta al archivo del grafo: ").strip()
    inicio = input("Nodo inicial: ").strip()
    meta = input("Nodo meta: ").strip()
    algoritmo = input("Algoritmo (BFS, DFS, IDDFS, Costo Uniforme, Ávara, A*): ").strip()

    datos = generar_json_para_api(ruta, inicio, meta, algoritmo)
    url = "http://127.0.0.1:8000/buscar"

    print(datos);
    
    print("\nEnviando datos al servidor...\n")
    response = requests.post(url, json=datos)

    if response.status_code == 200:
        resultado = response.json()
        print("\n Resultado:")
        print(json.dumps(resultado, indent=4, ensure_ascii=False))
    else:
        print("\n Error:")
        print(response.status_code, response.text)

if __name__ == "__main__":
    main()
