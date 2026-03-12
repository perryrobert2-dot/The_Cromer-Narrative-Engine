import { EngineState, DEFAULT_STATE, Blueprint, SubversiveAnalysis, AuditFlag } from '../../types';

export const parseResponse = (rawText: string): { state: EngineState | null; content: string; thought?: string; blueprint?: Blueprint; subversive?: SubversiveAnalysis; audit?: AuditFlag[] } => {
  let state: EngineState | null = null;
  let content = rawText;
  let thought: string | undefined;
  let blueprint: Blueprint | undefined;
  let subversive: SubversiveAnalysis | undefined;
  let audit: AuditFlag[] | undefined;

  // Extract Thought Block
  const thoughtRegex = /<THOUGHT_BLOCK>([\s\S]*?)<\/THOUGHT_BLOCK>/i;
  const thoughtMatch = content.match(thoughtRegex);
  if (thoughtMatch) {
    thought = thoughtMatch[1].trim();
    content = content.replace(thoughtMatch[0], '').trim();
  }

  // Try parsing the whole text as JSON first (common with Structured Outputs)
  if (rawText.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(rawText.trim());
      // If it has our signature keys, it's likely the state
      if (parsed.PHASE || parsed.blueprint || parsed.subversive || parsed.audit || parsed.PROGRESSION !== undefined) {
        const extractState = (obj: any): EngineState => {
          const stateUpdate: Partial<EngineState> = {};
          if (obj.PHASE) stateUpdate.PHASE = String(obj.PHASE);
          if (obj.GENRE) stateUpdate.GENRE = obj.GENRE;
          if (obj.INTENT) stateUpdate.INTENT = obj.INTENT;
          if (obj.GRAPH) stateUpdate.GRAPH = obj.GRAPH;
          if (obj.ACTIVE_PINS) stateUpdate.ACTIVE_PINS = Array.isArray(obj.ACTIVE_PINS) ? obj.ACTIVE_PINS : [];
          if (obj.NARRATIVE_DEBT) stateUpdate.NARRATIVE_DEBT = Array.isArray(obj.NARRATIVE_DEBT) ? obj.NARRATIVE_DEBT : [];
          if (obj.CURRENT_GOAL) stateUpdate.CURRENT_GOAL = obj.CURRENT_GOAL;
          if (obj.INTENSITY !== undefined) stateUpdate.INTENSITY = Number(obj.INTENSITY);
          
          if (obj.TITLE) stateUpdate.TITLE = obj.TITLE;
          if (obj.LOGLINE) stateUpdate.LOGLINE = obj.LOGLINE;
          if (obj.WORLD_LOGIC) stateUpdate.WORLD_LOGIC = obj.WORLD_LOGIC;
          if (obj.PILLARS) stateUpdate.PILLARS = Array.isArray(obj.PILLARS) ? obj.PILLARS : [];

          // Aesthetics
          if (obj.AESTHETICS) {
            stateUpdate.AESTHETICS = obj.AESTHETICS;
          } else if (obj.TONE_STYLE || obj.VOICE) {
            stateUpdate.AESTHETICS = {
              STYLE: obj.TONE_STYLE || "",
              VOICE: obj.VOICE || { primary: "Neutral", density: 0.5, metaphorFrequency: 0.5 }
            };
          }

          // Physics
          if (obj.PHYSICS) {
            stateUpdate.PHYSICS = obj.PHYSICS;
          } else {
            const legacyPhysics: any = {};
            ['PROGRESSION', 'VISCOSITY', 'SURFACE_TENSION', 'STAKES', 'AGENCY', 'ENTROPY', 'INFORMATION_GAP', 'RESONANCE', 'CAUSAL_DEBT_LEDGER', 'NARRATIVE_CREDIT'].forEach(key => {
              if (obj[key] !== undefined) legacyPhysics[key.toLowerCase()] = Number(obj[key]);
            });
            if (Object.keys(legacyPhysics).length > 0) {
              stateUpdate.PHYSICS = legacyPhysics;
            }
          }

          if (obj.BANNED_TERMS_VIOLATED !== undefined) stateUpdate.BANNED_TERMS_VIOLATED = Boolean(obj.BANNED_TERMS_VIOLATED);
          
          return stateUpdate as EngineState;
        };

        if (parsed.blueprint) {
          blueprint = parsed.blueprint as Blueprint;
          if (parsed.state) state = extractState(parsed.state);
          if (parsed.content) content = parsed.content;
          return { state, content, thought, blueprint, subversive, audit };
        }
        if (parsed.subversive) {
          subversive = parsed.subversive as SubversiveAnalysis;
          return { state, content, thought, blueprint, subversive, audit };
        }
        if (parsed.audit) {
          audit = parsed.audit as AuditFlag[];
          return { state, content, thought, blueprint, subversive, audit };
        }
        if (parsed.PHASE || parsed.PROGRESSION !== undefined) {
          state = extractState(parsed);
          return { state, content: "", thought, blueprint, subversive, audit };
        }
      }
    } catch (e) {
      // Not pure JSON or invalid, fall back to regex
    }
  }

  // Regex to find JSON blocks. 
  // We prioritize Markdown code blocks, then loose brace blocks.
  const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/i;
  // Loose regex needs to be careful not to match random braces in text
  // We look for a block that starts with { and contains key terms
  const looseJsonRegex = /(\{(?:[^{}]|(?:\{[^{}]*\}))*\})/g; 

  let match = rawText.match(jsonBlockRegex);
  
  // If no code block, try to find a JSON-like object that contains our keywords
  if (!match) {
     const potentialMatches = rawText.match(looseJsonRegex);
     if (potentialMatches) {
        // Find the one that looks like our state
        const stateMatch = potentialMatches.find(m => 
            m.includes('"PHASE"') || 
            m.includes('"blueprint"') ||
            m.includes('"subversive"') ||
            m.includes('"audit"')
        );
        if (stateMatch) {
            match = [stateMatch, stateMatch]; // Simulate regex match array
        }
     }
  }

  // Patch 1.2.3: Naked JSON detection (No braces at all)
  if (!match) {
      if (rawText.includes('"PHASE"') || rawText.includes('"blueprint"')) {
          // Try to wrap the whole thing in braces if it looks like a key-value list
          const nakedMatch = rawText.trim();
          match = [nakedMatch, nakedMatch];
      }
  }

  if (match && match[1]) {
    content = rawText.replace(match[0], '').trim();
    try {
      let jsonStr = match[1].trim();
      
      // Patch 1.2.2: Handle cases where the JSON might be missing the initial { 
      // (User mentioned removing it)
      if (jsonStr.startsWith('"PHASE"') || jsonStr.startsWith('"blueprint"')) {
          jsonStr = '{' + jsonStr;
      }
      if (!jsonStr.endsWith('}')) {
          jsonStr = jsonStr + '}';
      }

      // Fix: Remove non-printable control characters
      jsonStr = jsonStr.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "");

      // Heuristic Fixes for common LLM JSON errors:
      // 1. Missing quote on keys (e.g. "NARRATIVE_DEBT: [)
      jsonStr = jsonStr.replace(/"([A-Z_]+):\s*\[/g, '"$1": [');
      jsonStr = jsonStr.replace(/"([A-Z_]+):\s*"/g, '"$1": "');
      jsonStr = jsonStr.replace(/"([A-Z_]+):\s*\{/g, '"$1": {');
      jsonStr = jsonStr.replace(/"([A-Z_]+):\s*([0-9]+)/g, '"$1": $2');
      
      const parsed = JSON.parse(jsonStr);
      
        const extractState = (obj: any): EngineState => {
          const stateUpdate: Partial<EngineState> = {};
          if (obj.PHASE) stateUpdate.PHASE = String(obj.PHASE);
          if (obj.GENRE) stateUpdate.GENRE = obj.GENRE;
          if (obj.INTENT) stateUpdate.INTENT = obj.INTENT;
          if (obj.GRAPH) stateUpdate.GRAPH = obj.GRAPH;
          if (obj.ACTIVE_PINS) stateUpdate.ACTIVE_PINS = Array.isArray(obj.ACTIVE_PINS) ? obj.ACTIVE_PINS : [];
          if (obj.NARRATIVE_DEBT) stateUpdate.NARRATIVE_DEBT = Array.isArray(obj.NARRATIVE_DEBT) ? obj.NARRATIVE_DEBT : [];
          if (obj.CURRENT_GOAL) stateUpdate.CURRENT_GOAL = obj.CURRENT_GOAL;
          if (obj.INTENSITY !== undefined) stateUpdate.INTENSITY = Number(obj.INTENSITY);
          
          // Capture World Bible Fields
          if (obj.TITLE) stateUpdate.TITLE = obj.TITLE;
          if (obj.LOGLINE) stateUpdate.LOGLINE = obj.LOGLINE;
          if (obj.WORLD_LOGIC) stateUpdate.WORLD_LOGIC = obj.WORLD_LOGIC;
          if (obj.PILLARS) stateUpdate.PILLARS = Array.isArray(obj.PILLARS) ? obj.PILLARS : [];

          // Aesthetics
          if (obj.AESTHETICS) {
            stateUpdate.AESTHETICS = obj.AESTHETICS;
          } else if (obj.TONE_STYLE || obj.VOICE) {
            stateUpdate.AESTHETICS = {
              STYLE: obj.TONE_STYLE || "",
              VOICE: obj.VOICE || { primary: "Neutral", density: 0.5, metaphorFrequency: 0.5 }
            };
          }

          // Physics
          if (obj.PHYSICS) {
            stateUpdate.PHYSICS = obj.PHYSICS;
          } else {
            const legacyPhysics: any = {};
            ['PROGRESSION', 'VISCOSITY', 'SURFACE_TENSION', 'STAKES', 'AGENCY', 'ENTROPY', 'INFORMATION_GAP', 'RESONANCE', 'CAUSAL_DEBT_LEDGER', 'NARRATIVE_CREDIT'].forEach(key => {
              if (obj[key] !== undefined) legacyPhysics[key.toLowerCase()] = Number(obj[key]);
            });
            if (Object.keys(legacyPhysics).length > 0) {
              stateUpdate.PHYSICS = legacyPhysics;
            }
          }

          if (obj.BANNED_TERMS_VIOLATED !== undefined) stateUpdate.BANNED_TERMS_VIOLATED = Boolean(obj.BANNED_TERMS_VIOLATED);
          
          return stateUpdate as EngineState;
        };

      // Check if it's a Blueprint (Architect Phase)
      if (parsed.blueprint) {
        const b = parsed.blueprint;
        blueprint = {
          ...b,
          active_pins: Array.isArray(b.active_pins) ? b.active_pins : [],
          narrative_debt: Array.isArray(b.narrative_debt) ? b.narrative_debt : [],
          pillars: Array.isArray(b.pillars) ? b.pillars : []
        } as Blueprint;

        if (parsed.state) {
          state = extractState(parsed.state);
        }
        if (parsed.content) {
          content = parsed.content;
        }
      } 
      // Check if it's a Subversive Analysis
      else if (parsed.subversive) {
          const s = parsed.subversive;
          subversive = {
              ...s,
              chaos_injection: s.chaos_injection ? {
                  ...s.chaos_injection,
                  suggested_pins: Array.isArray(s.chaos_injection.suggested_pins) ? s.chaos_injection.suggested_pins : [],
                  suggested_debt: Array.isArray(s.chaos_injection.suggested_debt) ? s.chaos_injection.suggested_debt : []
              } : undefined
          } as SubversiveAnalysis;
      }
      // Check if it's an Audit
      else if (parsed.audit) {
          audit = parsed.audit as AuditFlag[];
      }
      // Check if it's a standard EngineState or Calculator update
      else if (parsed.PHASE || parsed.PROGRESSION !== undefined) {
        state = extractState(parsed);
      }
      
    } catch (e) {
      console.warn("Failed to parse JSON block - Syntax Error. Content already stripped.", e);
    }
  }

  return { state, content, thought, blueprint, subversive, audit };
};