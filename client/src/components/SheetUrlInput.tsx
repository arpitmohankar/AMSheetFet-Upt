import React, { useState, FormEvent } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import api from '../services/api';

interface SheetUrlInputProps {
  onSheetIdSet: (sheetId: string) => void;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  sheetId?: string;
}

const SheetUrlInput: React.FC<SheetUrlInputProps> = ({ onSheetIdSet }) => {
  const [url, setUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post<ApiResponse>('/api/set-sheet-id', { sheetUrl: url });
      if (response.data.success && response.data.sheetId) {
        onSheetIdSet(response.data.sheetId);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to set sheet URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enter Google Sheet URL
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Google Sheet URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          margin="normal"
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Loading...' : 'Set Sheet'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SheetUrlInput;