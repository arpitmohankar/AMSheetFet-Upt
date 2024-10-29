import React, { useEffect, useState } from 'react';
import MessageButton from './MessageButton';
import SheetUrlInput from './SheetUrlInput';
import api from '../services/api';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button
} from '@mui/material';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  sheetId?: string;
}

type SheetRow = [string, string, string, string];

interface StatusMap {
  [key: number]: string;
}

const SheetDisplay: React.FC = () => {
  const [sheetData, setSheetData] = useState<SheetRow[]>([]);
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [sheetId, setSheetId] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse>('/api/sheet-data');
      const data = response.data.data || [];
      setSheetData(data);
      
      // Initialize statuses from sheet data
      const initialStatuses: StatusMap = {};
      data.forEach((row: SheetRow, index: number) => {
        initialStatuses[index] = row[3] === 'Message sent' ? 'success' : '';
      });
      setStatuses(initialStatuses);
    } catch (error) {
      console.error('Error fetching sheet data:', error);
    }
  };

  useEffect(() => {
    if (sheetId) {
      fetchData();
    }
  }, [sheetId]);

  const handleUpdateStatus = (rowIndex: number): void => {
    setStatuses(prev => ({
      ...prev,
      [rowIndex]: 'success'
    }));
  };

  if (!sheetId) {
    return <SheetUrlInput onSheetIdSet={setSheetId} />;
  }

  const handleSendAll = async (): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/api/send-all-messages');
      if (response.data.success) {
        const newStatuses: StatusMap = {};
        sheetData.forEach((_row, index) => {
          newStatuses[index] = 'success';
        });
        setStatuses(newStatuses);
      }
    } catch (error) {
      console.error('Error sending all messages:', error);
      alert('Failed to send all messages');
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSendAll}>
          Send All
        </Button>
      </Box>
      <TableContainer component={Paper} style={{ backgroundColor: '#1e1e1e' }}>
        <Typography variant="h5" style={{ textAlign: 'center', color: '#ffffff', padding: '1rem' }}>
          Google Sheet Data
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ color: '#ffffff' }}>Serial No.</TableCell>
              <TableCell style={{ color: '#ffffff' }}>Phone Number</TableCell>
              <TableCell style={{ color: '#ffffff' }}>Message</TableCell>
              <TableCell style={{ color: '#ffffff' }}>Status</TableCell>
              <TableCell style={{ color: '#ffffff' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sheetData.length > 0 ? (
              sheetData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell style={{ color: '#ffffff' }}>{row[0]}</TableCell>
                  <TableCell style={{ color: '#ffffff' }}>{row[1]}</TableCell>
                  <TableCell style={{ color: '#ffffff' }}>{row[2]}</TableCell>
                  <TableCell style={{ color: '#ffffff' }}>
                    {statuses[index] === 'success' ? (
                      <span role="img" aria-label="success">✅</span>
                    ) : (
                      <span role="img" aria-label="pending">❌</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <MessageButton
                      phoneNumber={row[1]}
                      message={row[2]}
                      rowIndex={index}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} style={{ color: '#ffffff', textAlign: 'center' }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SheetDisplay;