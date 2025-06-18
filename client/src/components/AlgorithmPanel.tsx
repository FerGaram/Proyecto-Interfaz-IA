// src/components/AlgorithmPanel.tsx
import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { CloudDropdown } from "./CloudDropdown";

interface AlgorithmPanelProps {
  darkMode: boolean;
  algoritmo: string;
  setAlgoritmo: (value: string) => void;
  ejecutarAlgoritmo: () => void;
  clearSolutionPath: () => void;
  updateRobotSolutionPath: (path: string[]) => void;
}

export const AlgorithmPanel: React.FC<AlgorithmPanelProps> = ({
  darkMode,
  algoritmo,
  setAlgoritmo,
  ejecutarAlgoritmo,
  clearSolutionPath,
  updateRobotSolutionPath,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: darkMode
          ? "rgba(30,30,40,0.55)"
          : "rgba(220,220,230,0.75)",
        backdropFilter: "blur(8px)",
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
        padding: "8px 32px",
        margin: "0 auto",
        minWidth: 400,
        maxWidth: "90vw",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: "text.primary",
          letterSpacing: 1,
        }}
      >
        Seleccionar Algoritmo
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ width: "100%", justifyContent: "center", mb: 2 }}
      >
        <CloudDropdown
          label="Algoritmo"
          value={algoritmo}
          setValue={setAlgoritmo}
          options={[
            { value: "BFS", label: "BFS (Amplitud)" },
            { value: "DFS", label: "DFS (Profundidad)" },
            { value: "IDDFS", label: "IDDFS" },
            { value: "Costo Uniforme", label: "Costo Uniforme" },
            { value: "Ávara", label: "Ávara" },
            { value: "A*", label: "A*" },
          ]}
          minWidth={200}
        />
        <Button
          variant="contained"
          onClick={ejecutarAlgoritmo}
          className="boton-panel btn-primary"
        >
          Ejecutar algoritmo
        </Button>

        <Button
          variant="outlined"
          onClick={() => {
            clearSolutionPath();
            updateRobotSolutionPath([]);
            alert("Camino de solución limpiado");
          }}
          className="boton-panel btn-secondary"
        >
          Limpiar Camino
        </Button>
      </Stack>
    </Box>
  );
};
