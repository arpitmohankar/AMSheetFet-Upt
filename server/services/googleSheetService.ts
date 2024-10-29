// googleSheetService.ts
import { google, sheets_v4 } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import SheetStore from './sheetStore';

// Types
interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}
import dotenv from 'dotenv';
dotenv.config();
const DEFAULT_RANGE = 'Sheet1!A:D';

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

function getGoogleCredentials(): GoogleCredentials {
  return {
    type: getRequiredEnvVar('GOOGLE_TYPE'),
    project_id: getRequiredEnvVar('GOOGLE_PROJECT_ID'),
    private_key_id: getRequiredEnvVar('GOOGLE_PRIVATE_KEY_ID'),
    private_key: getRequiredEnvVar('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    client_email: getRequiredEnvVar('GOOGLE_CLIENT_EMAIL'),
    client_id: getRequiredEnvVar('GOOGLE_CLIENT_ID'),
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: getRequiredEnvVar('GOOGLE_CLIENT_X509_CERT_URL')
  };
}

const auth = new google.auth.GoogleAuth({
  credentials: getGoogleCredentials(),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const getSheetData = async (): Promise<string[][]> => {
  try {
    const sheetId = SheetStore.getSheetId();
    if (!sheetId) {
      throw new Error('Sheet ID not set');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: DEFAULT_RANGE,
    });
    
    // Handle null case explicitly
    if (!response.data.values) {
      return [];
    }

    // Type assertion to ensure string[][]
    return response.data.values as string[][];
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

const updateSheetStatus = async (rowIndex: number, status: string): Promise<boolean> => {
  try {
    const sheetId = SheetStore.getSheetId();
    if (!sheetId) {
      throw new Error('Sheet ID not set');
    }

    const range = `Sheet1!D${rowIndex + 1}`;
    
    // Use proper types for the update request
    const request: sheets_v4.Params$Resource$Spreadsheets$Values$Update = {
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[status]]
      }
    };

    await sheets.spreadsheets.values.update(request);
    return true;
  } catch (error) {
    console.error('Error updating Google Sheet status:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

const validateSheetAccess = async (sheetId: string): Promise<boolean> => {
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:A1',
    });
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  getSheetData,
  updateSheetStatus,
  validateSheetAccess,
};