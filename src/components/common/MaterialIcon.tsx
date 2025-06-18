import React from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import { Box } from '@mui/material';

interface MaterialIconProps {
  icon: string;
  sx?: SxProps<Theme>;
  fontSize?: 'inherit' | 'small' | 'medium' | 'large' | number;
  color?: 'inherit' | 'primary' | 'secondary' | 'action' | 'disabled' | 'error' | string;
  className?: string;
  onClick?: () => void;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({
  icon,
  sx = {},
  fontSize = 'medium',
  color = 'inherit',
  className = '',
  onClick,
}) => {
  const getFontSize = () => {
    if (typeof fontSize === 'number') return `${fontSize}px`;
    switch (fontSize) {
      case 'small': return '20px';
      case 'medium': return '24px';
      case 'large': return '36px';
      case 'inherit': return 'inherit';
      default: return '24px';
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary': return 'primary.main';
      case 'secondary': return 'secondary.main';
      case 'action': return 'action.active';
      case 'disabled': return 'action.disabled';
      case 'error': return 'error.main';
      case 'inherit': return 'inherit';
      default: return color;
    }
  };

  return (
    <Box
      component="span"
      className={`material-icons ${className}`}
      onClick={onClick}
      sx={{
        fontSize: getFontSize(),
        color: getColor(),
        cursor: onClick ? 'pointer' : 'inherit',
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      {icon}
    </Box>
  );
};

export default MaterialIcon;