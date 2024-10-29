import React from 'react';
import api from '../services/api';
import { Button } from '@mui/material';

interface MessageButtonProps {
  phoneNumber: string;
  message: string;
  rowIndex: number;
  onUpdateStatus: (rowIndex: number) => void;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  sheetId?: string;
}


const MessageButton: React.FC<MessageButtonProps> = ({ phoneNumber, message, rowIndex, onUpdateStatus }) => {
  const handleSendMessage = async (): Promise<void> => {
    try {
      const response = await api.post<ApiResponse>('/api/send-message', {
        phoneNumber,
        message,
        rowIndex
      });
      
      if (response.data.success) {
        onUpdateStatus(rowIndex);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message.');
    }
  };

  return (
    <Button variant="contained" color="primary" onClick={handleSendMessage}>
      Send Message
    </Button>
  );
};

export default MessageButton;