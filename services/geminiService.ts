import { GoogleGenAI, Content, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { ChatMessage, Sender } from "../types";

// Helper to convert internal message format to Gemini Content format
const formatHistory = (messages: ChatMessage[]): Content[] => {
  return messages.map((msg) => {
    const parts: Part[] = [];
    
    // If there is text
    if (msg.text) {
      parts.push({ text: msg.text });
    }

    // Note: We represent user images in history via text description context usually,
    // but for this specific flow, sending just text history is efficient.
    // However, if the user JUST sent an image, we handled it in the 'current' turn logic previously.
    // To keep it simple and robust, we mostly rely on text history for context.
    
    return {
      role: msg.sender === Sender.User ? 'user' : 'model',
      parts: parts,
    };
  });
};

interface GenerateResponseResult {
  text: string;
  image?: string;
}

export const generateResponse = async (
  currentInput: string,
  currentImageBase64: string | undefined,
  history: ChatMessage[]
): Promise<GenerateResponseResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Detect if user is asking for a card/image using keywords
  const lowerInput = currentInput.toLowerCase();
  const isRequestingImage = 
    lowerInput.includes('карт') || 
    lowerInput.includes('образ') || 
    lowerInput.includes('зображ') || 
    lowerInput.includes('малюн') ||
    lowerInput.includes('символ');

  // Select model:
  // 1. If sending an image -> gemini-2.5-flash-image
  // 2. If requesting a generated image -> gemini-2.5-flash-image (it can generate images)
  // 3. Otherwise -> gemini-3-flash-preview (better reasoning)
  const modelName = (currentImageBase64 || isRequestingImage) 
    ? 'gemini-2.5-flash-image' 
    : 'gemini-3-flash-preview';

  const contents: Content[] = formatHistory(history);

  // Construct current message parts
  const currentParts: Part[] = [];
  
  if (currentImageBase64) {
    // Remove data:image/...;base64, prefix if present for clean base64
    const base64Data = currentImageBase64.split(',')[1] || currentImageBase64;
    
    currentParts.push({
      inlineData: {
        mimeType: 'image/jpeg', 
        data: base64Data
      }
    });
  }
  
  if (currentInput) {
    let textToSend = currentInput;
    // Inject style prompting if the user is asking for an image to ensure Dixit style
    if (isRequestingImage && !currentImageBase64) {
       textToSend += " (Style: Surrealist illustration, Dixit card style, dreamlike, whimsical, metaphorical, soft lighting, detailed, no text)";
    }
    currentParts.push({ text: textToSend });
  }

  // Add current message to contents
  contents.push({
    role: 'user',
    parts: currentParts
  });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9, // Higher temperature for more creative cards
      }
    });

    // Parse response for both Text and Image (inlineData)
    let generatedText = '';
    let generatedImage: string | undefined = undefined;

    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.text) {
          generatedText += part.text;
        }
        if (part.inlineData) {
          // Construct data URI for the frontend
          generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    return {
      text: generatedText || "Я відчуваю, що зараз час для тиші...",
      image: generatedImage
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Не вдалося з'єднатися з полем інформації. Спробуйте пізніше.");
  }
};