import { GoogleGenAI, Content, Type, ThinkingLevel } from "@google/genai";
import { MODEL_NAME, MODEL_FLASH_LITE, MODEL_PRO, THINKING_BUDGET } from '../constants';
import { SUBVERSIVE_INSTRUCTION, AUDIT_INSTRUCTION, CORRECTION_INSTRUCTION, INGESTION_INSTRUCTION, SUMMARIZER_INSTRUCTION, DYNAMIC_INITIALIZATION_PROMPT } from '../src/constants/prompts';
import { StorySegment, TokenUsage, Blueprint, EngineState, AuditFlag, PlotDNA, PhysicsPayload } from '../types';
import { NarrativeManifold } from '../src/utils/manifold';

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeNarrativePhysics = async (logline: string, genre: string, axioms?: any): Promise<{ physics: PhysicsPayload, banned_terms: string[] }> => {
    const ai = getGenAI();
    let prompt = `LOGLINE: ${logline}\nGENRE: ${genre}`;
    if (axioms) {
        prompt += `\nAXIOMS (User Defined): ${JSON.stringify(axioms)}`;
    }
    const contents: Content[] = [{
        role: 'user',
        parts: [{ text: prompt }]
    }];

    try {
        const res = await callGemini(ai, MODEL_PRO, {
            systemInstruction: DYNAMIC_INITIALIZATION_PROMPT,
            temperature: 0.7,
            responseMimeType: "application/json",
            thinkingLevel: ThinkingLevel.HIGH
        }, contents);

        const data = JSON.parse(res.text);
        return {
            physics: data.physics,
            banned_terms: data.banned_terms
        };
    } catch (error) {
        console.error("Gemini Physics Initialization Error:", error);
        // Fallback to default physics if Gemini fails
        return {
            physics: {
                causal_debt: 0,
                progression: 0,
                pacing: 0.5,
                introspection_density: 0.5,
                action_intensity: 0.5,
                primary_resource: { label: 'Resource', value: 0.5, description: 'Primary narrative resource' },
                environmental_friction: { label: 'Friction', value: 0.5, description: 'Environmental resistance' },
                protagonist_integrity: { label: 'Integrity', value: 1.0, description: 'Protagonist state' },
                narrative_credit: 3
            },
            banned_terms: []
        };
    }
};

const callGemini = async (ai: any, model: string, config: any, contents: Content[]): Promise<{ text: string, usage?: TokenUsage }> => {
  if (contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: "Initialize." }]
    });
  }

  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model,
        config: {
          ...config,
          thinkingConfig: config.thinkingConfig || (model.includes('pro') || model.includes('flash-preview') ? {
            thinkingLevel: config.thinkingLevel || ThinkingLevel.HIGH
          } : undefined)
        },
        contents
      });

      // Check if we have candidates
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error(`Gemini returned no candidates. Finish reason: ${response.candidates?.[0]?.finishReason || 'Unknown'}`);
      }

      const text = response.text;
      if (text === undefined || text === null) {
        const finishReason = response.candidates[0].finishReason;
        throw new Error(`Gemini response text is missing. Finish reason: ${finishReason}`);
      }

      if (text.trim() === "") {
        console.warn(`Gemini returned an empty string for model ${model}.`);
      }

      let usage: TokenUsage | undefined;
      if (response.usageMetadata) {
        usage = {
          input: response.usageMetadata.promptTokenCount || 0,
          output: response.usageMetadata.candidatesTokenCount || 0,
          total: response.usageMetadata.totalTokenCount || 0
        };
      }

      return { text, usage };

    } catch (error: any) {
      const isTransientError = 
        error?.status === 429 || 
        error?.status === 500 ||
        error?.status === 503 ||
        error?.message?.includes('429') || 
        error?.message?.includes('quota') ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('deadline exceeded') ||
        error?.message?.includes('Connection lost');
      
      if (isTransientError) {
        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
          console.warn(`Gemini Transient Error (${model}). Retrying in ${Math.round(delay)}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      console.error(`Gemini API Fatal Error (${model}):`, error);
      throw error;
    }
  }
  throw new Error(`Max retries exceeded for Gemini API (${model})`);
};

export const generateNextSegment = async (
  history: StorySegment[], 
  userInput?: string,
  systemInstruction?: string,
  model: string = MODEL_NAME,
  configOverrides?: {
    responseMimeType?: string;
    responseSchema?: any;
    temperature?: number;
    thinkingLevel?: ThinkingLevel;
  },
  image?: string // Current turn image
): Promise<{ text: string, usage?: TokenUsage }> => {
  const ai = getGenAI();
  
  const contents: Content[] = history.map(seg => {
    const parts: any[] = [{ text: seg.text }];
    if (seg.image) {
      const mimeType = seg.image.split(';')[0].split(':')[1] || 'image/png';
      const base64Data = seg.image.split(',')[1] || seg.image;
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }
    return {
      role: seg.role,
      parts
    };
  });

  if (userInput || image) {
    const parts: any[] = [];
    if (userInput) parts.push({ text: userInput });
    if (image) {
      const mimeType = image.split(';')[0].split(':')[1] || 'image/png';
      const base64Data = image.split(',')[1] || image;
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      });
    }
    
    contents.push({
      role: 'user',
      parts
    });
  }

  const config: any = {
    systemInstruction,
    temperature: configOverrides?.temperature ?? 0.9, 
    maxOutputTokens: 4096,
    thinkingLevel: configOverrides?.thinkingLevel
  };

  if (model === MODEL_NAME) {
    config.thinkingConfig = {
        thinkingBudget: THINKING_BUDGET
    };
  }

  if (configOverrides?.responseMimeType) {
    config.responseMimeType = configOverrides.responseMimeType;
  }
  if (configOverrides?.responseSchema) {
    config.responseSchema = configOverrides.responseSchema;
  }

  return callGemini(ai, model, config, contents);
};

export const generateSubversiveAnalysis = async (blueprint: Blueprint, schema?: any): Promise<{ text: string }> => {
    const ai = getGenAI();
    
    const contents: Content[] = [{
        role: 'user',
        parts: [{ text: JSON.stringify(blueprint, null, 2) }]
    }];

    try {
        const config: any = {
            systemInstruction: SUBVERSIVE_INSTRUCTION,
            temperature: 1.0,
            maxOutputTokens: 8192,
            thinkingLevel: ThinkingLevel.HIGH
        };
        if (schema) {
            config.responseMimeType = "application/json";
            config.responseSchema = schema;
        }
        const res = await callGemini(ai, MODEL_PRO, config, contents);
        return { text: res.text };
    } catch (error) {
        console.error("Gemini Subversive Error:", error);
        return { text: "" }; // Fail silently
    }
};

export const generateAuditAnalysis = async (segment: StorySegment, state: EngineState, schema?: any): Promise<{ text: string }> => {
    const ai = getGenAI();
    
    const context = `
    STATE: ${NarrativeManifold.translateState(state)}
    GOAL: ${state.CURRENT_GOAL}
    PINS: ${state.ACTIVE_PINS.join(', ')}

    LATEST SEGMENT TO AUDIT:
    ${segment.text}
    `;

    const contents: Content[] = [{
        role: 'user',
        parts: [{ text: context }]
    }];

    try {
        const config: any = {
            systemInstruction: AUDIT_INSTRUCTION,
            temperature: 0.5,
            maxOutputTokens: 8192,
            thinkingLevel: ThinkingLevel.HIGH
        };
        if (schema) {
            config.responseMimeType = "application/json";
            config.responseSchema = schema;
        }
        const res = await callGemini(ai, MODEL_PRO, config, contents);
        return { text: res.text };
    } catch (error) {
        console.error("Gemini Auditor Error:", error);
        return { text: "" };
    }
};

export const generateCorrection = async (prose: string, flags: AuditFlag[]): Promise<{ text: string }> => {
    const ai = getGenAI();
    
    const context = `
    ORIGINAL PROSE:
    ${prose}

    AUDITOR FLAGS:
    ${JSON.stringify(flags, null, 2)}
    `;

    const contents: Content[] = [{
        role: 'user',
        parts: [{ text: context }]
    }];

    try {
        const res = await callGemini(ai, MODEL_PRO, {
            systemInstruction: CORRECTION_INSTRUCTION,
            temperature: 0.7,
            maxOutputTokens: 8192,
            thinkingLevel: ThinkingLevel.HIGH
        }, contents);
        return { text: res.text };
    } catch (error) {
        console.error("Gemini Correction Error:", error);
        return { text: prose };
    }
};

export const generateSummary = async (prose: string): Promise<string> => {
    const ai = getGenAI();
    
    const contents: Content[] = [{
        role: 'user',
        parts: [{ text: prose }]
    }];

    try {
        const res = await callGemini(ai, MODEL_FLASH_LITE, {
            systemInstruction: SUMMARIZER_INSTRUCTION,
            temperature: 0.3,
            maxOutputTokens: 1024
        }, contents);
        return res.text;
    } catch (error) {
        console.error("Gemini Summary Error:", error);
        return prose.slice(0, 500) + "..."; // Fallback
    }
};

export const generateCoverIllustration = async (context: string): Promise<string> => {
  const ai = getGenAI();
  const prompt = `Create a high-quality, atmospheric cover illustration for a fiction story. 
  Context/Theme: ${context}. 
  Style: Cinematic, detailed, dramatic lighting, digital art.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }]
      }
    });
    
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                // Default to png if mimeType missing, though it should be there
                const mime = part.inlineData.mimeType || 'image/png';
                return `data:${mime};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image Gen Error", error);
    throw error;
  }
};

export const analyzeNovelDNA = async (novelText: string, usePro: boolean = false): Promise<{ dna: PlotDNA, usage?: TokenUsage }> => {
    const ai = getGenAI();
    const model = usePro ? MODEL_PRO : MODEL_FLASH_LITE;
    
    const contents: Content[] = [{
        role: 'user',
        parts: [{ text: `NOVEL TEXT:\n${novelText}` }]
    }];

    try {
        const res = await callGemini(ai, model, {
            systemInstruction: INGESTION_INSTRUCTION,
            temperature: 0.2, // Low temperature for extraction
            responseMimeType: "application/json",
            maxOutputTokens: 16384
        }, contents);

        const dna = JSON.parse(res.text.replace(/```json|```/g, '').trim());
        return { dna, usage: res.usage };
    } catch (error) {
        console.error("Gemini Ingestion Error:", error);
        throw error;
    }
};
