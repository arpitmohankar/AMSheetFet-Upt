import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import messageRoutes from './routes/messageRoutes';
import sheetRoutes from './routes/sheetRoutes';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Create Express application with type
const app: Application = express();

// CORS configuration type
const corsOptions: cors.CorsOptions = {
    origin: 'http://localhost:3000', // Adjust origin if your client app's URL changes
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use('/api', messageRoutes);
app.use('/api', sheetRoutes);

// Port configuration
const PORT: number = Number(process.env.PORT) || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err: Error) => {
    console.error('Server failed to start:', err);
});

export default app;
