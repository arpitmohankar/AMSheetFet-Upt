// sheetRoutes.ts
import express, { Request, Response, Router } from 'express';
import googleSheetService from '../services/googleSheetService';

const router: Router = express.Router();

interface SheetDataResponse {
  success: boolean;
  data?: string[][];
  message?: string;
  error?: string;
}

// Fix: Add proper type annotations to the route handler
router.get(
  '/sheet-data', 
  async (req: Request, res: Response<SheetDataResponse>): Promise<void> => {
    try {
      const sheetData = await googleSheetService.getSheetData();
      res.status(200).json({
        success: true,
        data: sheetData,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: 'Failed to fetch Google Sheet data.',
        error: errorMessage,
      });
    }
  }
);

export default router;