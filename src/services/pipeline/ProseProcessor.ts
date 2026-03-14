import { Type, ThinkingLevel } from "@google/genai";
import { EngineState, StorySegment, NarrativeMode, AuditFlag, TokenUsage } from '../../../types';
import { getSystemInstruction } from '../../constants/prompts';
import { generateNextSegment, generateAuditAnalysis, generateCorrection } from '../../../services/gemini';
import { MODEL_NAME, MODEL_PRO } from '../../../constants';
import { parseResponse } from '../../utils/parser';
import { NarrativeManifold } from '../../utils/manifold';
import { cleanProse } from '../../utils/cleaner';

export class ProseProcessor {
  static async generate(
    targetState: EngineState,
    effectiveInput: string,
    historyForCompute: StorySegment[],
    narrativeMode: NarrativeMode,
    engineState: EngineState,
    image?: string,
    tempOverride?: number
  ): Promise<{ content: string, thought?: string, usage?: TokenUsage, auditFlags: AuditFlag[] }> {
    
    const renderPrompt = `
[STATE]
${NarrativeManifold.translateState(targetState)}
Goal: ${targetState.CURRENT_GOAL}
Pins: ${targetState.ACTIVE_PINS.join(', ')}
Command: "${effectiveInput}"

[TASK]
Write next narrative block. Refer to SCHEMA for definitions.
`.trim();

    const renderRes = await generateNextSegment(
      historyForCompute.slice(-5), 
      undefined, 
      getSystemInstruction(narrativeMode, targetState) + "\n" + renderPrompt,
      MODEL_NAME,
      {
        thinkingLevel: ThinkingLevel.LOW,
        temperature: tempOverride ?? 0.9
      },
      image
    );
    
    const parsedRender = parseResponse(renderRes.text);
    let content = cleanProse(parsedRender.content);
    const thought = parsedRender.thought;
    const usage = renderRes.usage;

    // Audit
    const auditRes = await generateAuditAnalysis({ text: content } as StorySegment, targetState || engineState);
    const { audit } = parseResponse(auditRes.text);
    const auditFlags: AuditFlag[] = audit || [];
    
    if (auditFlags.some(f => f.severity === 'high')) {
      const correctionRes = await generateCorrection(content, auditFlags);
      content = correctionRes.text;
    }

    return { content, thought, usage, auditFlags };
  }
}
