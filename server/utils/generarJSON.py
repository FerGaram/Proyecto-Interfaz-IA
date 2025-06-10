import requests
import json

def leer_grafo_desde_archivo(ruta):
    """
    Lee un archivo con formato específico para extraer las coordenadas de nodos
    y las aristas con sus pesos.

    Formato esperado:
    NODE_COORDS:
    A: (x, y)
    B: (x, y)
    ...
    EDGES:
    A-B: peso
    C-D
    ...

    Los pesos son opcionales; si no se especifican, se asume 1.0.
    """
    grafo, coords = {}, {}
    seccion = None

    with open(ruta, 'r', encoding='utf-8') as archivo:
        for linea in archivo:
            linea = linea.strip()
            if not linea or linea.startswith('#'):
                continue

            encabezado = linea.rstrip(':').upper()
            if encabezado == 'NODE_COORDS':
                seccion = 'coords'
                continue
            elif encabezado == 'EDGES':
                seccion = 'edges'
                continue

            if seccion == 'coords':
                try:
                    nodo, tup = linea.split(':', 1)
                    x, y = tup.strip().lstrip('(').rstrip(')').split(',')
                    coords[nodo.strip()] = (float(x), float(y))
                except Exception as e:
                    raise ValueError(f"Error al leer coordenadas en línea: '{linea}' - {e}")
            elif seccion == 'edges':
                try:
                    if ':' in linea:
                        arista, peso = linea.split(':', 1)
                        w = float(peso.strip())
                    else:
                        arista, w = linea, 1.0
                    a, b = [n.strip() for n in arista.split('-')]
                    grafo.setdefault(a, []).append((b, w))
                    grafo.setdefault(b, []).append((a, w))
                except Exception as e:
                    raise ValueError(f"Error al leer aristas en línea: '{linea}' - {e}")
            else:
                # Ignorar líneas fuera de secciones conocidas
                pass

    return grafo, coords


def generar_json_para_api(ruta_archivo, inicio, meta, algoritmo):
    """
    Genera el diccionario JSON para enviar a la API a partir del archivo de entrada
    y parámetros de búsqueda.
    """
    grafo, coords = leer_grafo_desde_archivo(ruta_archivo)
    aristas = {}

    # Evitar duplicados de aristas (porque se agregaron en ambas direcciones)
    for nodo, vecinos in grafo.items():
        for vecino, peso in vecinos:
            clave = f"{nodo}-{vecino}"
            inversa = f"{vecino}-{nodo}"
            if clave not in aristas and inversa not in aristas:
                aristas[clave] = peso

    return {
        "nodos": coords,
        "aristas": aristas,
        "inicio": inicio,
        "meta": meta,
        "algoritmo": algoritmo
    }


def probar_api():
    """
    Función para testear la conexión y respuesta de la API con un archivo de ejemplo.
    """
    data = generar_json_para_api("tests/ejemplo_entrada.txt", "A", "C", "A*")
    try:
        response = requests.post("http://localhost:8000/buscar", json=data)
        response.raise_for_status()
        print("Respuesta de la API:")
        print(json.dumps(response.json(), indent=2))
    except requests.RequestException as e:
        print(f"Error al conectar con la API: {e}")


if __name__ == "__main__":
    probar_api()
