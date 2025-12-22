import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ContractAnalysis, ConnectedAccount, AccountabilityReport, ProtocolUpdate, SecurityScanResult } from "../types";

// Helper to ensure API Key exists
const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export interface WebAnalysisResult {
  isMalicious: boolean;
  threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threatTypes: string[]; 
  misdirectionScore: number; 
  analysis: string;
  verdict: string;
}

export const analyzeWebResource = async (resourceInfo: string): Promise<WebAnalysisResult> => {
  const ai = getAiClient();
  const prompt = `
    Act as a Senior Cyber Forensic Analyst for the NEOXZ.COM PERPETUAL ENGINE.
    Analyze the provided digital resource for malicious intent, misdirection, and fraud.
    Resource: "${resourceInfo}"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isMalicious: { type: Type.BOOLEAN },
          threatLevel: { type: Type.STRING, enum: ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          threatTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
          misdirectionScore: { type: Type.NUMBER },
          analysis: { type: Type.STRING },
          verdict: { type: Type.STRING }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as WebAnalysisResult;
  }
  throw new Error("Web Analysis Failed");
};

export const fastResponse = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: prompt,
  });
  return response.text || "No response generated.";
};

export const complexThink = async (prompt: string, imageBase64?: string): Promise<string> => {
  const ai = getAiClient();
  const parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    });
  }
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
  return response.text || "Analysis complete.";
};

export const generateSovereignImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: "1K"
      }
    }
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image part found in response");
};

export const generateSovereignVideo = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
  const ai = getAiClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const performSecurityScan = async (content: string, type: 'TEXT' | 'IMAGE_BASE64'): Promise<SecurityScanResult> => {
  const ai = getAiClient();
  const prompt = `Scan for security threats: ${content.substring(0, 10000)}`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isSafe: { type: Type.BOOLEAN },
          threatLevel: { type: Type.STRING, enum: ['SAFE', 'LOW', 'MEDIUM', 'CRITICAL'] },
          threatType: { type: Type.STRING },
          details: { type: Type.STRING },
          extractedData: { type: Type.STRING }
        }
      }
    }
  });
  if (response.text) return JSON.parse(response.text);
  throw new Error("Scan failed");
};

export const generateBreachDossier = async (incidentDescription: string, reporterEmail: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Generate a formal INCIDENT DOSSIER for: ${incidentDescription}. Reporter: ${reporterEmail}. Authority: NE.B.RU.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
  });
  return response.text || "Dossier locked.";
};

export const discoverDigitalFootprint = async (email: string): Promise<ConnectedAccount[]> => {
  const ai = getAiClient();
  const prompt = `Simulate footprint scan for ${email}`;
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            platform: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['SOCIAL', 'FINANCE', 'UTILITY', 'ENTERTAINMENT', 'GOV'] },
            status: { type: Type.STRING, enum: ['SECURE', 'WARNING', 'CRITICAL_ISSUE'] },
            issueDescription: { type: Type.STRING },
            lastSync: { type: Type.NUMBER }
          }
        }
      }
    }
  });
  if (response.text) return JSON.parse(response.text);
  return [];
};

export const auditEntityAccountability = async (entityName: string): Promise<AccountabilityReport> => {
  const ai = getAiClient();
  const prompt = `Audit entity ${entityName}`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          entityName: { type: Type.STRING },
          score: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ['VERIFIED_ACCOUNTABLE', 'SUSPICIOUS_OPAQUE', 'UNACCOUNTABLE_GHOST'] },
          missingMarkers: { type: Type.ARRAY, items: { type: Type.STRING } },
          liabilityStance: { type: Type.STRING },
          riskAssessment: { type: Type.STRING }
        }
      }
    }
  });
  if (response.text) return JSON.parse(response.text);
  throw new Error("Audit failed");
};
