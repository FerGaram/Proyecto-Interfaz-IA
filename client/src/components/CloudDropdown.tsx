import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { alpha, useTheme } from '@mui/material/styles';
import Grow from '@mui/material/Grow';
import type { Dispatch, SetStateAction } from 'react';

interface Option {
  label: string;
  value: string;
}

interface CloudDropdownProps {
  label: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  options: Option[];
  minWidth?: number;
}

export function CloudDropdown({ label, value, setValue, options, minWidth = 200 }: CloudDropdownProps) {
  const theme = useTheme();
  return (
    <FormControl size="small" sx={{ minWidth, width: '100%' }} variant="outlined">
      <InputLabel
        id={label + '-label'}
        sx={{
          fontSize: 16, // Más grande el label de afuera
          fontWeight: 700,
          color: theme.palette.text.secondary,
          background: 'transparent',
          px: 0.5,
          zIndex: 2,
        }}
      >
        {label}
      </InputLabel>
      <Select
        labelId={label + '-label'}
        id={label + '-select'}
        value={value}
        label={label}
        onChange={(e: SelectChangeEvent<string>) => setValue(e.target.value as string)}
        MenuProps={{
          PaperProps: {
            component: Grow,
            style: {
              background: theme.palette.mode === 'dark'
                ? 'rgba(30,40,60,0.80)' // Blur y transparencia
                : alpha(theme.palette.background.paper, 0.85),
              backdropFilter: 'blur(18px)',
              borderRadius: 18,
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
              marginTop: 8,
              padding: 0,
              minWidth: minWidth + 24,
            },
            elevation: 0,
          },
          MenuListProps: {
            sx: {
              padding: 0,
            },
          },
        }}
        sx={{
          borderRadius: 8,
          fontWeight: 500,
          fontSize: 16, // Regresa el texto de adentro a tamaño normal
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(40,60,90,0.85)' : 'background.paper',
          color: theme.palette.text.primary,
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          '& .MuiSelect-select': {
            padding: '10px 16px',
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            fontSize: 16, // Normal
            fontWeight: 500,
          },
          '& .MuiSelect-icon': {
            fontSize: 22,
            top: 'calc(50% - 11px)',
            right: 10,
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{
              my: 1,
              mx: 2,
              borderRadius: 12,
              fontSize: 16, // Normal
              fontWeight: 500, // Un poco más marcado pero no exagerado
              background: 'none',
              color: theme.palette.text.primary,
              transition: 'background 0.25s, color 0.25s, transform 0.25s',
              boxShadow: '0 2px 8px 0 rgba(31,38,135,0.08)',
              '&:hover': {
                background: theme.palette.mode === 'dark'
                  ? 'rgba(120,180,255,0.13)'
                  : 'rgba(100,180,255,0.13)',
                color: theme.palette.primary.main,
                transform: 'scale(1.04)',
              },
              '&.Mui-selected': {
                background: theme.palette.mode === 'dark'
                  ? 'rgba(120,180,255,0.22)'
                  : 'rgba(100,180,255,0.18)',
                color: theme.palette.primary.main,
              },
              '&:not(:last-child)': {
                marginBottom: 8,
              },
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
