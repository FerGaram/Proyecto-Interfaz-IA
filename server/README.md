

#  Buscador de Caminos con Algoritmos de Búsqueda

Este proyecto implementa una API en FastAPI que permite buscar caminos en un grafo utilizando distintos algoritmos como BFS, DFS, IDDFS, Costo Uniforme, Búsqueda Ávara y A\*.


## Requisitos

* Python 3.12+ (no se recomienda Python instalado en un entorno virtual)
* [Poetry](https://python-poetry.org/docs/)

---

## 🛠️ Instalación del entorno

1. **Instalar dependencias**:

   ```bash
   poetry install
   ```

No se preocupen si marca algún error, mientras instale las dependencias se podrá realizar el paso siguiente.

2. **Activar el entorno virtual**:

   ```bash
   poetry shell
   ```

---

##  Ejecutar la API

Con el entorno activado, lanza el servidor con:

```bash
uvicorn API:app --reload
```

Esto iniciará la API en `http://127.0.0.1:8000`.

### 📄 Endpoints disponibles

* `POST /buscar`: Permite enviar un grafo, nodos y el algoritmo de búsqueda para obtener el camino y su costo.

###  Documentación interactiva

* Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Script de prueba: `generarJSON.py`

Este script permite generar una solicitud de ejemplo a la API con datos desde la terminal.

1. Abre otra terminal y activa el entorno:

   ```bash
   poetry shell
   ```

2. Ejecuta el script:

   ```bash
   python generarJSON.py
   ```

3. Proporciona los datos solicitados:

```
Ruta al archivo del grafo: grafo.txt
Nodo inicial: A
Nodo meta: F
Algoritmo (BFS, DFS, IDDFS, Costo Uniforme, Ávara, A*): BFS
```

---

## Ejemplo de JSON de entrada de la API
```json
---
{
    'nodos': {'A': [0.0, 0.0], 'B': [2.0, 1.0], 'C': [2.0, -1.0], 'D': [4.0, 0.0], 'E': [6.0, 2.0], 'F': [6.0, -2.0]}, 
    'aristas': {'A-B': 2.0, 'A-C': 2.0, 'B-D': 3.0, 'C-D': 3.0, 'D-E': 2.5, 'D-F': 2.5},
    'inicio': 'A', 
    'meta': 'F', 
    'algoritmo': 'BFS'
}

```
---

##  Ejemplo de respuesta

```json
{
    "camino": ["A", "B", "D", "F"],
    "costo": 3
}
```
