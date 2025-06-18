import { Panel } from "@xyflow/react";
import { Box } from "@mui/material";
import { useState } from "react";

interface Props {
  darkMode: boolean;
}

export function HelpPanel({ darkMode }: Props) {
  const [minimized, setMinimized] = useState(false);

  return (
    <Panel position="top-right">
      <Box
        className={`postit${minimized ? " minimized" : ""}`}
        onClick={() => setMinimized(!minimized)}
        sx={{
          bgcolor: darkMode ? "rgba(40,40,40,0.96)" : "background.paper",
          color: "text.primary",
          width: minimized ? "80px" : "320px",
          minHeight: minimized ? "32px" : "120px",
          padding: minimized ? "10px 8px" : "20px 18px",
          borderRadius: "10px 40px 10px 10px",
          boxShadow: "2px 4px 16px rgba(0, 0, 0, 0.15)",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          fontSize: minimized ? "0.9rem" : "1rem",
          margin: "24px auto",
          position: "relative",
          transition: "all 0.3s cubic-bezier(.4, 2, .6, 1)",
          overflow: "hidden",
          display: "block",
          textAlign: minimized ? "center" : "left",
          cursor: "pointer",
          "&:hover": {
            boxShadow: "4px 8px 24px rgba(0, 0, 0, 0.2)",
          },
          "& .top-right-header": {
            color: "text.primary",
            fontSize: "18px",
            marginTop: 0,
            marginBottom: "10px",
          },
          "& .top-right-text": {
            color: "text.secondary",
            fontSize: "16px",
            margin: 0,
            paddingLeft: "18px",
            "& li": {
              marginBottom: "8px",
            },
          },
          "& .minimized ul, & .minimized h4, & .minimized br": {
            display: "none",
          },
        }}
        title="Haz clic para expandir o reducir"
      >
        <center>
          <h4 className="top-right-header">Controles</h4>
        </center>
        <ul className="top-right-text">
          <li>Desplazarse: haz clic fuera de un nodo y arrastra</li>
          <li>
            Seleccionar múltiples nodos: Shift + clic y arrastra para
            seleccionar múltiples nodos y aristas
          </li>
          <li>Borrar nodo/arista: haz clic y pulsa Retroceso</li>
          <li>
            Conectar nodos: haz clic y arrastra desde un conector, y suelta en
            otro del nodo a conectar
          </li>
        </ul>
        <div
          style={{
            fontSize: "0.75rem",
            color: "gray",
            marginTop: 8,
          }}
        >
          <b>Atajos útiles:</b>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              <b>Ctrl+Z</b>: Deshacer
            </li>
            <li>
              <b>Ctrl+Y</b>: Rehacer
            </li>
            <li>
              <b>Ctrl+C</b>: Copiar nodo(s) seleccionado(s)
            </li>
            <li>
              <b>Ctrl+V</b>: Pegar nodo(s)
            </li>
            <li>
              <b>Ctrl+X</b>: Cortar nodo(s)
            </li>
            <li>
              <b>Ctrl+D</b>: Duplicar nodo(s)
            </li>
          </ul>
        </div>
      </Box>
    </Panel>
  );
}
