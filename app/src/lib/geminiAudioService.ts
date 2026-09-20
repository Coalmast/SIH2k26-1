const GEMINI_API_KEY = "AIzaSyAxZfOUDrMBN6BLMtA0XRJzHlsPRMUoYlE"; // WARNING: HARDCODED KEY
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface GrievanceAnalysis {
  detectedLanguage: string;
  transcription: string;
  englishSummary: string;
  category: 'SAFETY' | 'WAGES' | 'WORKING_CONDITIONS' | 'HARASSMENT' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const analyzeGrievanceAudio = async (base64Audio: string, mimeType: string = 'audio/m4a'): Promise<GrievanceAnalysis> => {
  // Simulate network delay for realistic UI testing
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Hardcoded mock response to bypass API
  return {
    detectedLanguage: "Hindi",
    transcription: "मेरी शिफ्ट के दौरान सुरक्षा उपकरण ठीक से काम नहीं कर रहे हैं, मुझे डर है कि कोई दुर्घटना हो सकती है।",
    englishSummary: "The safety equipment is not working properly during my shift, and I am afraid an accident might happen.",
    category: "SAFETY",
    severity: "HIGH"
  };
};
