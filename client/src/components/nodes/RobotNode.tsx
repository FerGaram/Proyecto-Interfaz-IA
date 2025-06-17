import { Handle, Position, type BuiltInNode, type NodeProps } from "@xyflow/react";
import { useCallback, useRef } from "react";
import { useReactFlow } from '@xyflow/react';
//importación de los gif
import robotQuieto from '../../assets/Previews/Cute_Robot_Idle.gif';
import robotAvanzando from '../../assets/Previews/Cute_Robot_Walk.gif';
import robotSaltando from '../../assets/Previews/Cute_Robot_Jump.gif';

// Definir los tipos de estado del robot
export type RobotState = 'idle' | 'walking' | 'jumping';

// Definir el tipo de datos del robot
export interface RobotNodeData extends Record<string, unknown> {
    label?: string;
    state?: RobotState;
    isMoving?: boolean;
    isCelebrating?: boolean;
    solutionPath?: string[]; //Está variable recibe el camino del app
}

// Usar los archivos importados como imágenes del robot
const robotImages = {
    idle: robotQuieto,
    walking: robotAvanzando,
    jumping: robotSaltando,
};

export const RobotNode = ({ id, data }: NodeProps<BuiltInNode>) => {
    const { getNodes, setNodes } = useReactFlow();
    const isMovingRef = useRef(false);

    const robotData = data as RobotNodeData;
    const robotState = robotData?.state || 'idle';
    const isMoving = robotData?.isMoving || false;
    const isCelebrating = robotData?.isCelebrating || false;
    const solutionPath = robotData?.solutionPath || [];

    // Actualizar estado del robot
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

                //Salta en los nodos que pasa
                updateRobotState(robotNodeId, 'jumping', true);
                await new Promise(resolve => setTimeout(resolve, 800));

                // Camina al  siguiente nodo
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

    const handleRobotClick = useCallback(() => {
        if (!id) return;

        console.log('Robot clicked!', { id, isMoving, robotState, solutionPath });

        if (isMoving) {
            console.log('Stopping robot journey');
            stopRobotJourney(id);
        } else {
            console.log('Starting robot journey');
            startRobotJourney(id);
        }
    }, [id, isMoving, startRobotJourney, stopRobotJourney, solutionPath]);

    const getCurrentImage = () => {
        return robotImages[robotState];
    };

    const getStatusEmoji = () => {
        if (isCelebrating) {
            return '🎉'; // Emoji de celebración cuando llega al nodo meta
        }
        if (isMoving) {
            switch (robotState) {
                case 'walking':
                    return '🏃';
                case 'jumping':
                    return '🤔';
                default:
                    return '🚶';
            }
        }
        return '😴'; // Durmiendo cuando está idle
    };

    return (
        <div
            className="robot-node"
            onClick={handleRobotClick}
            style={{
                cursor: 'pointer',
                position: 'relative',
                border: '2px solid purple',
                borderRadius: '12px',
                padding: '1px',
                backgroundColor: '#f0f8f0',//Esta varible hay que modificar en caso de que se quiera ver el fondo
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
            }}
        >
            <Handle type="target" position={Position.Top} id="top" />
            <Handle type="target" position={Position.Left} id="left" />

            <div className={`robot-container ${robotState} ${isMoving ? 'moving' : ''}`}>
                <img
                    src={getCurrentImage()}
                    alt={`Robot ${robotState}`}
                    width={64}
                    height={64}
                    className="robot-image"
                    style={{
                        display: 'block',
                        filter: isMoving ? 'brightness(1.2)' : 'none',
                        transform: isCelebrating ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.3s ease'
                    }}
                />
                <div
                    className="robot-status"
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        fontSize: '20px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        animation: isCelebrating ? 'celebrate 0.6s ease-in-out infinite alternate' : 'none'
                    }}
                >
                    {getStatusEmoji()}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="source" position={Position.Right} id="right" />

            {/* Animación para la celebración */}
            <style >{`
                @keyframes celebrate {
                    0% { 
                        transform: scale(1) rotate(0deg);
                        filter: hue-rotate(0deg);
                    }
                    100% { 
                        transform: scale(1.2) rotate(15deg);
                        filter: hue-rotate(60deg);
                    }
                }
            `}</style>
        </div>
    );
};