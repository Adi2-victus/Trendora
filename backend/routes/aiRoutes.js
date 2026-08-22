import express from 'express';
import { handleAiQuery } from '../controller/aiController.js';

const aiRoutes = express.Router();

aiRoutes.post('/chat', handleAiQuery);

export default aiRoutes;
