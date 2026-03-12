import { Type } from "@google/genai";
import { EngineState, StorySegment, CriticSuggestion, CriticState } from '../../../types';
import { generateNextSegment } from '../../../services/gemini';
import { parseResponse } from '../../utils/parser';

const CRITIC_LENSES = [
  {
    id: 'Absurdist',
    description: 'Inject surreal or illogical elements that challenge the reality of the scene.',
    prompt: 'Analyze the prose through an Absurdist lens. Find a moment where reality is too stable and suggest a surreal pivot or an illogical detail that heightens the existential dread or wonder.'
  },
  {
    id: 'Minimalist',
    description: 'Strip away adjectives and focus on raw, brutal action and sensory data.',
    prompt: 'Analyze the prose through a Minimalist lens. Identify purple prose or unnecessary emotional hand-holding. Suggest a rewrite that is colder, sharper, and more focused on external facts.'
  },
  {
    id: 'Deconstructionist',
    description: 'Question the narrative assumptions or genre tropes being used.',
    prompt: 'Analyze the prose through a Deconstructionist lens. Identify a trope or assumption the narrative is leaning on. Suggest an edit that subverts this expectation or forces the characters to confront the artifice of their situation.'
  },
  {
    id: 'Gothic',
    description: 'Add atmospheric dread, decay, and heightened emotional stakes.',
    prompt: 'Analyze the prose through a Gothic lens. Find a moment that could be more atmospheric. Suggest an edit that adds shadows, decay, or a sense of inevitable doom.'
  },
  {
    id: 'Satirical',
    description: 'Mock the current situation, characters, or the world-building itself.',
    prompt: 'Analyze the prose through a Satirical lens. Find a moment of self-importance or cliché. Suggest an edit that mocks the situation or highlights the absurdity of the world-building.'
  }
];

const CRITIC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    critique: { type: Type.STRING },
    suggestedEdit: { type: Type.STRING }
  },
  required: ["critique", "suggestedEdit"]
};

export class CriticProcessor {
  static async critique(
    content: string,
    engineState: EngineState
  ): Promise<CriticSuggestion | null> {
    const criticState = engineState.CRITIC_STATE;
    if (!criticState || !criticState.isEnabled) return null;

    // Select a lens from the matrix, avoiding the last 2 used if possible
    const availableLenses = CRITIC_LENSES.filter(l => !criticState.history.slice(-2).includes(l.id));
    const lens = availableLenses[Math.floor(Math.random() * availableLenses.length)];

    const criticPrompt = `
[PROSE]
${content}

[LENS: ${lens.id}]
${lens.prompt}

[TASK]
Provide a brief critique and a specific suggested edit for a segment of the prose.
The edit should be a direct replacement for a part of the text.
`.trim();

    const res = await generateNextSegment(
      [], 
      undefined, 
      "You are the Subversive Critic. Your goal is to offer genuine, high-quality alternatives to the current narrative path. Do not be repetitive. Do not fixate on one theme.\n" + criticPrompt,
      undefined,
      {
        responseMimeType: "application/json",
        responseSchema: CRITIC_SCHEMA,
        temperature: 0.8
      }
    );

    const parsed = parseResponse(res.text) as any;
    if (!parsed.critique || !parsed.suggestedEdit) return null;

    return {
      lens: lens.id,
      critique: parsed.critique,
      suggestedEdit: parsed.suggestedEdit
    };
  }

  static getNextState(engineState: EngineState, lensId: string): CriticState {
    const current = engineState.CRITIC_STATE || { isEnabled: true, activeLens: '', history: [] };
    return {
      ...current,
      activeLens: lensId,
      history: [...current.history, lensId].slice(-10)
    };
  }
}
