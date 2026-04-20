import { predictImage } from './predict-service.js';

export const getPredictResult = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No image uploaded',
      });
    }

    const photo = req.files[0].buffer;
    const predict = await predictImage(photo);
    const { diseaseLabel, confidenceScore } = predict;

    return res.status(200).json({
      status: 'success',
      message: 'Predict success',
      data: {
        disease: diseaseLabel,
        confidenceScore,
      },
    });
  } catch (error) {
    console.error('Predict error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during prediction',
    });
  }
};
