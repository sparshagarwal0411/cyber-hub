import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface VisualAnalysisResult {
    safe: boolean;
    details: string;
    info?: string;
    risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export const geminiService = {
    async analyzeImage(file: File): Promise<VisualAnalysisResult> {
        if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
            throw new Error('Gemini API key is not configured.');
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert file to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const prompt = `
      Analyze this image for cybersecurity threats. 
      Identify if it contains:
      1. Phishing attempts (fake login pages, suspicious URLs).
      2. Fraudulent QR codes.
      3. Social engineering tactics.
      4. Malicious code or scripts (if screenshot of code).
      
      Respond in strict JSON format:
      {
        "safe": boolean,
        "risk": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "details": "A detailed explanation of the findings in 2-3 sentences.",
        "info": "Additional technical context or specific threat type found."
      }
    `;

        try {
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type
                    }
                }
            ]);

            const response = await result.response;
            let text = response.text();

            // Clean up potential markdown formatting in response
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(text);
        } catch (error: any) {
            console.error("Gemini Analysis Error:", error);
            throw new Error("Failed to analyze image with Gemini. " + (error.message || ""));
        }
    }
};
