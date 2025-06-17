import { useCallback, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';

export type RobotState = 'idle' | 'walking' | 'jumping';

export const useRobotMovement = () => {
    const { getNodes, getEdges, setNodes } = useReactFlow();
    const isMovingRef = useRef(false);
    const [solutionPath, setSolutionPath] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());

    const setSolutionPathAndHighlight = useCallback((path: string[]) => {
        console.log('Setting solution path:', path);
        setSolutionPath(path);

        // Crear set de aristas destacadas
        const edgesToHighlight = new Set<string>();
        const edges = getEdges();

        for (let i = 0; i < path.length - 1; i++) {
            const sourceId = path[i];
            const targetId = path[i + 1];

            // Buscar la arista entre estos nodos
            const edge = edges.find((e: { source: string; target: string; }) =>
                (e.source === sourceId && e.target === targetId) ||
                (e.source === targetId && e.target === sourceId)
            );

            if (edge) {
                edgesToHighlight.add(edge.id);
            }
        }

        setHighlightedEdges(edgesToHighlight);
    }, [getEdges]);

    // Función para limpiar el camino destacado
    const clearSolutionPath = useCallback(() => {
        setSolutionPath([]);
        setHighlightedEdges(new Set());
    }, []);

    // Actualizar estado del robot para un nodo específico
    const updateRobotState = useCallback((nodeId: string, state: RobotState, isMoving: boolean = false, isCelebrating: boolean = false) => {
        console.log('Updating robot state:', { nodeId, state, isMoving, isCelebrating });

        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === nodeId && node.type === 'nodeRobot') {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            state,
                            isMoving,
                            isCelebrating
                        }
                    };
                }
                return node;
            })
        );
    }, [setNodes]);

    // Encontrar el nodo robot en el grafo
    const findRobotNode = useCallback(() => {
        const nodes = getNodes();
        return nodes.find(node => node.type === 'nodeRobot');
    }, [getNodes]);

    // Obtener posición del nodo
    const getNodePosition = useCallback((nodeId: string) => {
        const nodes = getNodes();
        const node = nodes.find(n => n.id === nodeId);
        return node ? { x: node.position.x, y: node.position.y } : null;
    }, [getNodes]);

    // Mover robot a nueva posición
    const moveRobotToPosition = useCallback((robotNodeId: string, targetPosition: { x: number, y: number }) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === robotNodeId) {
                    return {
                        ...node,
                        position: targetPosition
                    };
                }
                return node;
            })
        );
    }, [setNodes]);

    // Función principal para mover el robot
    const startRobotJourney = useCallback(async (robotNodeId: string) => {
        if (isMovingRef.current) {
            console.log('Robot already moving, ignoring request');
            return;
        }

        console.log('Starting robot journey for:', robotNodeId);
        console.log('Current solution path:', solutionPath);
        console.log('Solution path length:', solutionPath.length);

        // Verificar si hay un camino de solución
        if (!solutionPath || solutionPath.length === 0) {
            console.log('No solution path available');
            alert('Por favor, ejecuta un algoritmo primero para encontrar el camino que debe seguir el robot.');
            return;
        }

        if (solutionPath.length < 2) {
            console.log('Solution path too short:', solutionPath);
            alert('El camino de solución debe tener al menos 2 nodos.');
            return;
        }

        isMovingRef.current = true;

        try {
            console.log('Following solution path:', solutionPath);

            // Mover el robot al primer nodo del camino si no está ahí
            const firstNodeId = solutionPath[0];
            const firstNodePos = getNodePosition(firstNodeId);

            if (firstNodePos) {
                console.log('Moving robot to start position:', firstNodeId);
                moveRobotToPosition(robotNodeId, firstNodePos);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Seguir el camino de solución
            for (let i = 0; i < solutionPath.length - 1; i++) {
                if (!isMovingRef.current) break;

                const currentNodeId = solutionPath[i];
                const nextNodeId = solutionPath[i + 1];
                const isLastNode = i === solutionPath.length - 2;

                console.log(`Moving from ${currentNodeId} to ${nextNodeId}`);

                // Obtener posiciones
                const currentPos = getNodePosition(currentNodeId);
                const nextPos = getNodePosition(nextNodeId);

                if (!currentPos || !nextPos) {
                    console.log('Could not get positions for nodes:', currentNodeId, nextNodeId);
                    break;
                }

                // Fase 1: Saltar en el nodo actual
                updateRobotState(robotNodeId, 'jumping', true);
                await new Promise(resolve => setTimeout(resolve, 800));

                // Fase 2: Caminar hacia el siguiente nodo
                updateRobotState(robotNodeId, 'walking', true);

                // Animar movimiento gradualmente
                const steps = 30;
                const deltaX = (nextPos.x - currentPos.x) / steps;
                const deltaY = (nextPos.y - currentPos.y) / steps;

                for (let step = 1; step <= steps; step++) {
                    if (!isMovingRef.current) break;

                    const newPos = {
                        x: currentPos.x + (deltaX * step),
                        y: currentPos.y + (deltaY * step)
                    };
                    moveRobotToPosition(robotNodeId, newPos);
                    await new Promise(resolve => setTimeout(resolve, 40));
                }

                // Pequeña pausa antes del siguiente movimiento
                await new Promise(resolve => setTimeout(resolve, 300));

                // Si es el último nodo (nodo meta), celebrar
                if (isLastNode) {
                    console.log('Reached final node, celebrating!');
                    updateRobotState(robotNodeId, 'jumping', true, true);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    updateRobotState(robotNodeId, 'idle', false, false);
                }
            }

        } catch (error) {
            console.error('Error durante el movimiento del robot:', error);
            updateRobotState(robotNodeId, 'idle', false, false);
        } finally {
            isMovingRef.current = false;
            console.log('Robot journey finished');
        }
    }, [solutionPath, getNodePosition, moveRobotToPosition, updateRobotState]);

    // Detener movimiento del robot
    const stopRobotJourney = useCallback((robotNodeId: string) => {
        console.log('Stopping robot journey for:', robotNodeId);
        isMovingRef.current = false;
        updateRobotState(robotNodeId, 'idle', false, false);
    }, [updateRobotState]);

    return {
        startRobotJourney,
        stopRobotJourney,
        updateRobotState,
        setSolutionPathAndHighlight,
        clearSolutionPath,
        highlightedEdges,
        solutionPath,
        isMoving: isMovingRef.current
    };
};