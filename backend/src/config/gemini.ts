import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import logger from '../utils/logger';

let geminiClient: GoogleGenerativeAI | null = null;
let geminiModel: GenerativeModel | null = null;

export const initializeGemini = (): void => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    geminiClient = new GoogleGenerativeAI(apiKey);
    geminiModel = geminiClient.getGenerativeModel({ model: modelName });

    logger.info(`Gemini AI initialized with model: ${modelName}`);
  } catch (error) {
    logger.error('Error initializing Gemini AI:', error);
    throw error;
  }
};

export const getGeminiModel = (): GenerativeModel => {
  if (!geminiModel) {
    initializeGemini();
  }
  
  if (!geminiModel) {
    throw new Error('Gemini model not initialized');
  }
  
  return geminiModel;
};

export const getGeminiClient = (): GoogleGenerativeAI => {
  if (!geminiClient) {
    initializeGemini();
  }
  
  if (!geminiClient) {
    throw new Error('Gemini client not initialized');
  }
  
  return geminiClient;
};

export default {
  initializeGemini,
  getGeminiModel,
  getGeminiClient
};
