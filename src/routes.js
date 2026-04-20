import express from 'express';
import multer from 'multer';
import { getPredictResult } from './controller.js';

const upload = multer();
const router = express.Router();

router.post('/predict', upload.any(), getPredictResult);

export default router;
