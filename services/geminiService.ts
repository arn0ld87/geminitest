import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { QuizResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonFromMarkdown = <T,>(markdownString: string): T | null => {
  const jsonMatch = markdownString.match(/```json\n([\s\S]*?)\n```/);
  const jsonString = jsonMatch ? jsonMatch[1] : markdownString;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
};

export const solveQuizWithGrounding = async (quizText: string): Promise<{ quizResults: QuizResult[] } | null> => {
  try {
    const prompt = `You are an expert quiz solver. Analyze the following text which contains one or more multiple-choice questions. For each question, identify the correct answer using your knowledge and up-to-date information from Google Search.

Respond ONLY with a JSON object in the following format:
{
  "quizResults": [
    {
      "question": "The text of the first question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The text of the correct option",
      "explanation": "A brief explanation of why this is the correct answer."
    }
  ]
}

Do not include any introductory text, concluding text, or markdown formatting like \`\`\`json. Your entire response must be a single, valid JSON object.

Here is the quiz text:
---
${quizText}
---
`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const parsedJson = parseJsonFromMarkdown<{ quizResults: QuizResult[] }>(response.text);
    return parsedJson;
  } catch (error) {
    console.error("Error solving quiz:", error);
    throw new Error("Failed to get a response from the AI. Please check your API key and network connection.");
  }
};

export const generateChatResponse = async (prompt: string, model: 'gemini-2.5-flash-lite' | 'gemini-2.5-flash' | 'gemini-2.5-pro', useThinkingMode: boolean): Promise<string> => {
  try {
    const config = useThinkingMode && model === 'gemini-2.5-pro' 
      ? { thinkingConfig: { thinkingBudget: 32768 } } 
      : {};

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to get a chat response from the AI.");
  }
};

export const analyzeImage = async (imageParts: Part[], prompt: string): Promise<string> => {
  try {
    const contents = { parts: [...imageParts, { text: prompt }] };
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze the image.");
  }
};


export const analyzeVideoDescription = async (description: string): Promise<string> => {
    try {
        const prompt = `You are a video analysis expert. Based on the following title and description of a video, provide a detailed analysis of its potential content, themes, and key information.

Video Description: "${description}"

Provide your analysis in well-structured markdown.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing video description:", error);
        throw new Error("Failed to analyze the video description.");
    }
};
