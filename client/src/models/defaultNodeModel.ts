// Estructura de datos por defecto para los nodos
export interface defaultNodeModel {
    id: string,
    position: { x: number, y: number },
    data: { label: string },
    type: string,
}