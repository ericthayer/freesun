import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import MaterialIcon from './MaterialIcon';

interface DemoBannerProps {
  onSignUp?: () => void;
}

const DemoBanner: React.FC<DemoBannerProps> = ({ onSignUp }) => {
  return (
    <Alert
      severity="info"
      sx={{ mb: 3 }}
      icon={<MaterialIcon icon="info" />}
      action={
        onSignUp && (
          <Button
            color="inherit"
            size="small"
            onClick={onSignUp}
            startIcon={<MaterialIcon icon="person_add" />}
          >
            Sign Up
          </Button>
        )
      }
    >
      <AlertTitle>Demo Mode</AlertTitle>
      You're viewing sample data to explore the application features. Sign up to create and manage your own records.
    </Alert>
  );
};

export default DemoBanner;
