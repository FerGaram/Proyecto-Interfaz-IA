// src/components/TopActionsPanel.tsx
import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { CloudDropdown } from "./CloudDropdown";
import type { defaultNodeModel } from "../models/defaultNodeModel";
import type { defaultEdgeModel } from "../models/defaultEdgeModel";

interface TopActionsPanelProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  nodeTypesArray: { label: string; value: string }[];
  addNode: () => void;
  limpiarPantalla: () => void;
  pruebaOnClick: () => void;
  setEdges: (edges: defaultEdgeModel[]) => void;
  nodes: defaultNodeModel[];
  generarConexionesSinColision: (nodes: defaultNodeModel[]) => defaultEdgeModel[];
}

export const TopActionsPanel: React.FC<TopActionsPanelProps> = ({
  darkMode,
  setDarkMode,
  selectedType,
  setSelectedType,
  nodeTypesArray,
  addNode,
  limpiarPantalla,
  pruebaOnClick,
  setEdges,
  nodes,
  generarConexionesSinColision,
}) => {
  return (
    <Box className="top-center-panel">
      <CloudDropdown
        label="Tipo de nodo"
        value={selectedType}
        setValue={setSelectedType}
        options={nodeTypesArray}
        minWidth={180}
      />
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="contained"
          onClick={addNode}
          className="boton-panel btn-primary"
        >
          AÑADIR NUEVO NODO
        </Button>
        <Button
          variant="outlined"
          onClick={limpiarPantalla}
          className="boton-panel btn-secondary"
        >
          LIMPIAR PANTALLA
        </Button>
        <Button
          variant="text"
          onClick={pruebaOnClick}
          className="boton-panel btn-info"
        >
          IMPRIMIR NODOS Y ARISTAS
        </Button>
        <Button
          variant="outlined"
          sx={{
            minWidth: 180,
            fontWeight: 600,
            fontSize: "1rem",
            borderRadius: "8px",
            boxShadow: "none",
            backdropFilter: "blur(8px)",
            bgcolor: darkMode ? "rgba(40,60,90,0.5)" : "background.paper",
            color: darkMode ? "primary.light" : "primary.dark",
            border: "1.5px solid",
            borderColor: "primary.main",
            "&:hover": {
              bgcolor: darkMode ? "rgba(40,60,120,0.7)" : "grey.100",
            },
          }}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "MODO CLARO" : "MODO OSCURO"}
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            const nuevas = generarConexionesSinColision(nodes);
            setEdges(nuevas);
            alert("Conexiones generadas automáticamente");
          }}
        >
          Generar conexiones automáticas
        </Button>
      </Stack>
    </Box>
  );
};
