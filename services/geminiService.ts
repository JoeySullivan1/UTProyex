
import { GoogleGenAI, Type } from "@google/genai";
import { OriginalityResponse } from '../types';

const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API key not found. Please set the API_KEY environment variable.");
}
const ai = new GoogleGenAI({ apiKey: apiKey! });



export const getProjectInsightsStream = async (projectDescription: string, question: string) => {
  const prompt = `Contexto: Eres un asistente de IA analizando un proyecto de estudiante. La descripción del proyecto es: "${projectDescription}". El usuario tiene una pregunta sobre este proyecto. Responde la pregunta del usuario basándote únicamente en el contexto proporcionado. Sé conciso y claro. Pregunta: "${question}"`;

  try {
    const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response;
  } catch (error) {
    console.error("Error fetching project insights:", error);
    throw new Error("No se pudo obtener la respuesta de la IA.");
  }
};


export const calculateOriginality = async (projectDescription: string): Promise<OriginalityResponse> => {
  const prompt = `Eres un sistema de IA que evalúa la originalidad de proyectos académicos. Analiza la siguiente descripción de proyecto y proporciona un objeto JSON con dos claves: "score" (un número entre 0 y 100 que representa la singularidad, donde 100 es completamente único, pero intenta no ser tan exigente, ya que son proyectos escolares) y "justification" (una breve explicación para la puntuación). La descripción es: "${projectDescription}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "Puntuación de originalidad de 0 a 100."
            },
            justification: {
              type: Type.STRING,
              description: "Justificación de la puntuación."
            }
          },
          required: ["score", "justification"]
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as OriginalityResponse;

  } catch (error) {
    console.error("Error calculating originality:", error);
   
    return {
      score: 0,
      justification: "No se pudo calcular la originalidad debido a un error en la API."
    };
  }
};
