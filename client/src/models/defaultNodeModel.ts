// Estructura de datos por defecto para los nodos
export interface defaultNodeModel {
    id: string,
    position: { x: number, y: number },
    data: { label: string },
    type: string,
    style?: any, // Permitir estilos dinámicos
    selected?: boolean, // Permitir flag de selección
    parentId?: string, // Permitir pertenecer a un nodeGroup
    draggable?: boolean, // Permitir negar el movimiento
    width?: number, // Permitir dar un tamaño específico
    height?: number,
}