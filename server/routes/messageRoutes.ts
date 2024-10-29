import express, { Request, Response, Router } from 'express';
import googleSheetService from '../services/googleSheetService';
import SheetStore from '../services/sheetStore';

const router: Router = express.Router();

// Type definitions
interface SendMessageRequest {
  phoneNumber: string;
  message: string;
  rowIndex: number;
}

interface SetSheetIdRequest {
  sheetUrl: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  sheetId?: string;
}

// Endpoint to send all messages
router.post(
  '/send-all-messages', 
  (
    req: Request,
    res: Response<ApiResponse>
  ) => {
    const sendAllMessages = async () => {
      try {
        const sheetData = await googleSheetService.getSheetData();
        
        for (let i = 0; i < sheetData.length; i++) {
          const rowIndex = i;
          await googleSheetService.updateSheetStatus(rowIndex, 'Message sent');
        }
        
        res.status(200).json({
          success: true,
          message: 'All messages sent'
        });
      } catch (error) {
        console.error('Error sending all messages:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to send all messages'
        });
      }
    };

    sendAllMessages().catch(error => {
      console.error('Unhandled error in sendAllMessages:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });
  }
);

// Endpoint to send a single message
router.post(
  '/send-message',
  (
    req: Request<{}, {}, SendMessageRequest>,
    res: Response<ApiResponse>
  ) => {
    const sendMessage = async () => {
      const { phoneNumber, message, rowIndex } = req.body;

      if (!phoneNumber || !message || rowIndex === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Phone number, message, and rowIndex are required.'
        });
      }

      try {
        await googleSheetService.updateSheetStatus(rowIndex, 'Message sent');
        res.status(200).json({
          success: true,
          message: 'Google Sheet updated successfully.'
        });
      } catch (error) {
        console.error('Error updating Google Sheet:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update Google Sheet.'
        });
      }
    };

    sendMessage().catch(error => {
      console.error('Unhandled error in sendMessage:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });
  }
);

// Endpoint to set the sheet ID
router.post(
  '/set-sheet-id',
  (
    req: Request<{}, {}, SetSheetIdRequest>,
    res: Response<ApiResponse>
  ) => {
    const setSheetId = async () => {
      const { sheetUrl } = req.body;

      if (!sheetUrl) {
        return res.status(400).json({
          success: false,
          error: 'Sheet URL is required'
        });
      }

      try {
        const sheetId = extractSheetId(sheetUrl);
        if (!sheetId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid Google Sheets URL' 
          });
        }

        const isValid = await googleSheetService.validateSheetAccess(sheetId);
        if (!isValid) {
          return res.status(400).json({ 
            success: false, 
            error: 'Unable to access sheet. Please check permissions.' 
          });
        }

        try {
          SheetStore.setSheetId(sheetId);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Failed to set sheet ID: Invalid ID provided'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Sheet ID set successfully',
          sheetId
        });
      } catch (error) {
        console.error('Error setting sheet ID:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to set sheet ID' 
        });
      }
    };

    setSheetId().catch(error => {
      console.error('Unhandled error in setSheetId:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });
  }
);

// Function to extract the sheet ID from the URL
function extractSheetId(url: string): string | null {
  try {
    const regex = /\/d\/([-\w]{25,})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

export default router;