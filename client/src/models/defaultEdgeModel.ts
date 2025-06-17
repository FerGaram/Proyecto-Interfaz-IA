// Estructura de datos por defecto para las aristas
export interface defaultEdgeModel {
    id: string,
    source: string,
    sourceHandle: string,
    target: string,
    targetHandle: string,
    label: string,
    style?: any, // Permitir estilos dinámicos
    selected?: boolean, // Permitir flag de selección
}