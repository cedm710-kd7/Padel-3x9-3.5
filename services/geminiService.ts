
import { GoogleGenAI } from "@google/genai";
import { playAudio } from '../utils/audioUtils';

const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const TEXT_MODEL = "gemini-flash-latest"; 
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

export const generateTournamentSummary = async (context: string): Promise<string> => {
    if (!API_KEY) {
        console.error("API_KEY is not set for Gemini.");
        return 'Error: API Key no configurada.';
    }
    try {
        const systemInstruction = "Actúa como un locutor de radio deportivo muy entusiasta y divertido. Tu tarea es generar un reporte o un resumen de un torneo de pádel, destacando a los líderes y a los que están en aprietos.";
        const userQuery = `Crea un resumen de una sola vez sobre la clasificación actual del torneo de Padel 3x9. Menciona a los líderes, y a la pareja que está en último lugar. Sé dramático y divertido. Clasificación actual:\n${context}`;
        
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: userQuery,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return response.text ?? 'No se pudo generar el resumen.';
    } catch (error) {
        console.error("Gemini Text API Error:", error);
        return 'Error al conectar con la IA. Inténtalo de nuevo.';
    }
};

export const announceTournamentWinner = async (winnerName: string): Promise<void> => {
    if (!API_KEY) {
        console.error("API_KEY is not set for Gemini TTS.");
        return;
    }
    try {
        const ttsPrompt = `Dile con voz fuerte y entusiasta: ¡Felicidades a los campeones, la pareja ${winnerName}! ¡Victoria, set y partido!`;

        const response = await ai.models.generateContent({
            model: TTS_MODEL,
            contents: [{ parts: [{ text: ttsPrompt }] }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: "Fenrir" } }
                }
            },
        });
        
        const audioPart = response.candidates?.[0]?.content?.parts?.[0];
        if (audioPart?.inlineData?.data) {
           const audioBase64 = audioPart.inlineData.data;
           playAudio(audioBase64);
        } else {
           console.error("No audio data received from Gemini TTS.");
        }
    } catch (error) {
        console.error("Gemini TTS API Error:", error);
    }
};
