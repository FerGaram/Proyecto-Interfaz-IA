// src/components/NodeSelectionPanel.tsx
import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface NodeSelectionPanelProps {
  nodoInicial: string;
  nodoFinal: string;
  setNodoInicial: (id: string) => void;
  setNodoFinal: (id: string) => void;
  modoSeleccion: "inicio" | "final" | null;
  setModoSeleccion: (modo: "inicio" | "final" | null) => void;
}

export const NodeSelectionPanel: React.FC<NodeSelectionPanelProps> = ({
  nodoInicial,
  nodoFinal,
  setNodoInicial,
  setNodoFinal,
  modoSeleccion,
  setModoSeleccion,
}) => {
  return (
    <Box className="panel-box">
      <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
        Nodo inicial: {nodoInicial || "Sin seleccionar"}
      </Typography>
      <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
        Nodo final: {nodoFinal || "Sin seleccionar"}
      </Typography>

      <Stack spacing={1} mt={2}>
        <Button
          variant="contained"
          size="small"
          onClick={() => setModoSeleccion("inicio")}
        >
          Seleccionar nodo inicial
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => setModoSeleccion("final")}
        >
          Seleccionar nodo final
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => {
            setNodoInicial("");
            setNodoFinal("");
          }}
        >
          Limpiar selección
        </Button>
      </Stack>

      {modoSeleccion && (
        <Typography sx={{ fontSize: "14px", mt: 2 }}>
          Haz clic en un nodo para asignar como{" "}
          <strong>{modoSeleccion}</strong>
        </Typography>
      )}
    </Box>
  );
};
