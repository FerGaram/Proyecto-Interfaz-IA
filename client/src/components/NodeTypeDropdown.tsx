import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import type { Dispatch, SetStateAction } from 'react';

interface NodeType {
  label: string;
  value: string;
}

interface NodeTypeDropdownProps {
  selectedType: string;
  setSelectedType: Dispatch<SetStateAction<string>>;
  nodeTypesArray: NodeType[];
}

export function NodeTypeDropdown({ selectedType, setSelectedType, nodeTypesArray }: NodeTypeDropdownProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="node-type-label">Tipo de nodo</InputLabel>
      <Select
        labelId="node-type-label"
        id="node-type-select"
        value={selectedType}
        label="Tipo de nodo"
        onChange={(e) => setSelectedType(e.target.value as string)}
      >
        {nodeTypesArray.map((node: NodeType) => (
          <MenuItem key={node.value} value={node.value}>
            {node.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}