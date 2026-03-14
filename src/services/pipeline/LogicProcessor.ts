import { Type, ThinkingLevel } from "@google/genai";
import { EngineState, NarrativeMode, AuditFlag, StorySegment, PhysicsPayload, DEFAULT_STATE } from '../../../types';
import { CORE_BANNED_TERMS, MODEL_PRO } from '../../../constants';
import { getComputeInstruction } from '../../../src/constants/prompts';
import { generateNextSegment } from '../../../services/gemini';
import { parseResponse } from '../../utils/parser';
import { NarrativeManifold } from '../../utils/manifold';

export class LogicProcessor {
  static getDynamicComputeSchema(physics: PhysicsPayload) {
    const physicsProps: any = {
      causal_debt: { type: Type.NUMBER },
      progression: { type: Type.NUMBER },
      pacing: { type: Type.NUMBER },
      introspection_density: { type: Type.NUMBER },
      action_intensity: { type: Type.NUMBER },
      narrative_credit: { type: Type.NUMBER },
      primary_resource: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.NUMBER },
          description: { type: Type.STRING }
        },
        required: ["label", "value", "description"]
      },
      environmental_friction: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.NUMBER },
          description: { type: Type.STRING }
        },
        required: ["label", "value", "description"]
      },
      protagonist_integrity: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.NUMBER },
          description: { type: Type.STRING }
        },
        required: ["label", "value", "description"]
      }
    };

    // Add any extra physics keys that might be present
    Object.keys(physics).forEach(key => {
      if (!physicsProps[key] && typeof physics[key] === 'number') {
        physicsProps[key] = { type: Type.NUMBER };
      }
    });

    return {
      type: Type.OBJECT,
      properties: {
        PHASE: { type: Type.STRING },
        PHASE_TICKS: { type: Type.NUMBER },
        CURRENT_GOAL: { type: Type.STRING },
        INTENSITY: { type: Type.NUMBER },
        BANNED_TERMS_VIOLATED: { type: Type.BOOLEAN },
        ACTIVE_PINS: { type: Type.ARRAY, items: { type: Type.STRING } },
        FAIL_SAFES: {
          type: Type.OBJECT,
          properties: {
            STALL_PROTECTION: { type: Type.STRING },
            MAX_PHASE_DURATION: { type: Type.NUMBER },
            LOOP_PENALTY: { type: Type.STRING },
            TRANSITION_PRIORITY: { type: Type.ARRAY, items: { type: Type.STRING } },
            OVERRIDE_CONDITION: { type: Type.STRING }
          }
        },
        GRAPH: {
          type: Type.OBJECT,
          properties: {
            nodes: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  id: { type: Type.STRING }, 
                  type: { type: Type.STRING }, 
                  description: { type: Type.STRING }, 
                  weight: { type: Type.NUMBER },
                  latent: { type: Type.BOOLEAN }
                }, 
                required: ["id", "type", "description", "weight"] 
              } 
            },
            edges: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  source: { type: Type.STRING }, 
                  target: { type: Type.STRING }, 
                  relation: { type: Type.STRING }, 
                  weight: { type: Type.NUMBER },
                  directional: { type: Type.BOOLEAN }
                }, 
                required: ["source", "target", "relation", "weight"] 
              } 
            }
          },
          required: ["nodes", "edges"]
        },
        PHYSICS: {
          type: Type.OBJECT,
          properties: physicsProps,
          required: Object.keys(physicsProps).filter(k => physicsProps[k].type !== undefined || physicsProps[k].properties !== undefined)
        }
      },
      required: ["PHASE", "CURRENT_GOAL", "INTENSITY", "BANNED_TERMS_VIOLATED", "ACTIVE_PINS", "GRAPH", "PHYSICS"]
    };
  }

  static async calculate(
    engineState: EngineState, 
    effectiveInput: string, 
    historyForCompute: any[],
    narrativeMode: NarrativeMode
  ): Promise<{ targetState: EngineState, auditFlags: AuditFlag[], deltaDebt: number }> {
    const blacklist = [...CORE_BANNED_TERMS, ...(engineState.BANNED_TERMS || [])];
    const computeSchema = this.getDynamicComputeSchema(engineState.PHYSICS);
    const physicsVars = Object.keys(computeSchema.properties.PHYSICS.properties);

    const computePrompt = `
[CONTEXT]
State: ${NarrativeManifold.translateState(engineState)}
Goal: ${engineState.CURRENT_GOAL}
Pins: ${engineState.ACTIVE_PINS.join(', ')}
Command: "${effectiveInput}"

[TASK]
Calculate target state. Refer to SCHEMA for variable definitions.
Blacklist: ${blacklist.join(', ')}
`.trim();
    
    const computeRes = await generateNextSegment(
      historyForCompute.slice(-5), 
      undefined, 
      getComputeInstruction(physicsVars, narrativeMode) + "\n" + computePrompt, 
      MODEL_PRO,
      {
        responseMimeType: "application/json",
        responseSchema: computeSchema,
        temperature: 0.1,
        thinkingLevel: ThinkingLevel.HIGH
      }
    );
    
    const parsedCompute = parseResponse(computeRes.text);
    let logicalTarget = parsedCompute.state || engineState;
    const auditFlags: AuditFlag[] = [];

    // Narrative Governor: Length-specific constraints
    const isLongStory = narrativeMode === 'Novel' || narrativeMode === 'Open Ended Web Serial';
    
    // Causal Debt Penalty (Epic/Long stories)
    if (isLongStory && (logicalTarget.PHYSICS.causal_debt || 0) > 0.4) {
      logicalTarget.PHYSICS.progression = engineState.PHYSICS.progression; // Zero progression
      logicalTarget.PHASE = "RECOVERY TICK (Debt Mitigation)";
      logicalTarget.CURRENT_GOAL = `[RECOVERY] Focus on environmental friction or internal processing to mitigate causal debt.`;
    }

    // Slow-Burn Mandate (Long stories)
    if (isLongStory) {
      const introspection = logicalTarget.PHYSICS.introspection_density || 0;
      const backgroundNodes = (logicalTarget.GRAPH?.nodes || []).filter(n => 
        n.type === 'background_context' || 
        n.id.toLowerCase().includes('background')
      );
      const backgroundWeight = backgroundNodes.length > 0 
        ? backgroundNodes.reduce((acc, n) => acc + (n.weight || 0), 0) / backgroundNodes.length 
        : 0;
      
      if (introspection < 0.5 || backgroundWeight < 0.5) {
        // Prevent progression if not enough introspection or background context
        if ((logicalTarget.PHYSICS.progression || 0) > (engineState.PHYSICS.progression || 0)) {
           logicalTarget.PHYSICS.progression = engineState.PHYSICS.progression;
           if (!logicalTarget.PHASE.includes('RECOVERY')) {
             logicalTarget.PHASE = "SLOW-BURN (Context Building)";
           }
        }
      }
    }

    // Phase Guard
    const terminalPhases = ['termination', 'resolution', 'ending', 'epilogue', 'climax', 'final'];
    const isTerminal = terminalPhases.some(p => logicalTarget.PHASE.toLowerCase().includes(p));
    const physics: PhysicsPayload = logicalTarget.PHYSICS || DEFAULT_STATE.PHYSICS;
    const progValue = typeof physics.progression === 'number' ? physics.progression : 0;
    
    if (isTerminal && progValue < 0.9 && (narrativeMode === 'Novel' || narrativeMode === 'Novella')) {
        logicalTarget.PHASE = engineState.PHASE.includes('Termination') ? "Rising Stakes" : engineState.PHASE;
        logicalTarget.CURRENT_GOAL = `(CONTINUING) ${logicalTarget.CURRENT_GOAL}`;
    }

    // Pre-clamp
    if (logicalTarget.PHYSICS) {
      Object.keys(logicalTarget.PHYSICS).forEach(key => {
        const val = logicalTarget.PHYSICS[key];
        if (typeof val === 'number') {
          if (key !== 'intensity' && key !== 'narrative_credit') {
            logicalTarget.PHYSICS[key] = Math.min(1.0, Math.max(0, val));
          }
        } else if (val && typeof val === 'object' && 'value' in val) {
          val.value = Math.min(1.0, Math.max(0, val.value));
        }
      });
    }

    const deltaDebt = NarrativeManifold.evaluateCausalDebt(engineState, logicalTarget);
    const DEBT_MAX = 10.0; 

    if (deltaDebt > DEBT_MAX) {
      logicalTarget = { ...engineState };
      auditFlags.push({
        id: crypto.randomUUID(),
        segmentId: '', // Will be filled by useCromerActions
        type: 'logic',
        message: `NARRATIVE IMPULSE OVERFLOW (${deltaDebt.toFixed(2)}). Narrative stasis enforced to prevent genre drift.`,
        severity: 'high',
        timestamp: Date.now()
      });
    }

    if (logicalTarget.BANNED_TERMS_VIOLATED) {
        auditFlags.push({
            id: crypto.randomUUID(),
            segmentId: '', // Will be filled by useCromerActions
            type: 'pattern',
            message: `BLACKLIST VIOLATION DETECTED. The engine has sanitized the state to remove forbidden terms.`,
            severity: 'high',
            timestamp: Date.now()
        });
    }

    const activeNode = engineState.ACTIVE_PINS[0] || 'plot_manifold';
    const ws = NarrativeManifold.calculateSignificanceWeight(
      activeNode, 
      engineState.SIGNIFICANCE_MAP, 
      engineState.GRAPH?.nodes?.length || 0
    );

    let targetState = NarrativeManifold.compose(engineState, logicalTarget, ws);
    
    targetState.BANNED_TERMS_VIOLATED = false;
    
    const newFreq = (engineState.SIGNIFICANCE_MAP[activeNode] || 0) + 1;
    targetState.SIGNIFICANCE_MAP = { ...engineState.SIGNIFICANCE_MAP, [activeNode]: newFreq };
    targetState.TICK = (engineState.TICK || 0) + 1;
    targetState = NarrativeManifold.normalizeGraph(targetState);

    // --- FAIL-SAFE INTEGRATION ---
    
    // 1. Tick-Cap Monitor
    if (targetState.PHASE === engineState.PHASE) {
      targetState.PHASE_TICKS = (engineState.PHASE_TICKS || 0) + 1;
    } else {
      targetState.PHASE_TICKS = 0;
    }

    const maxTicks = targetState.FAIL_SAFES?.MAX_PHASE_DURATION || 5;
    if (targetState.PHASE_TICKS > maxTicks && targetState.PHYSICS.progression < 0.2) {
      targetState.PHASE = "FORCED_PHASE_EVOLUTION (Tick-Cap Triggered)";
      targetState.CURRENT_GOAL = "STALL DETECTED: Execute a Narrative Leap (e.g., a 15-year time skip) regardless of current scene completion.";
      targetState.PHYSICS.progression = 0.5;
      targetState.PHYSICS.introspection_density = 0.1; // Kill introspection
    }

    // 2. Narrative Debt Ejection Seat
    if (targetState.PHYSICS.causal_debt < 0.2 && targetState.PHYSICS.pacing < 0.4 && targetState.TICK > 5) {
      targetState.PHASE = "CONTEXT_SHATTER (Debt Ejection Triggered)";
      targetState.CURRENT_GOAL = "LOW DEBT STALL: Terminate current character perspective and jump to the next ACTIVE_PIN on the mind map with a 'Time-Jump' header.";
      targetState.PHYSICS.pacing = 0.8;
      targetState.PHYSICS.causal_debt = 0.5; // Inject some debt to resolve
    }

    // Narrative LOD: Simulate background entities
    targetState.WORLD_ENTITIES = this.simulateWorld(targetState, deltaDebt);

    if (targetState.PHASE.includes('0 - Initialization')) {
        targetState.PHASE = "1 - Baseline (Forced)";
    }

    return { targetState, auditFlags, deltaDebt };
  }

  static simulateWorld(engineState: EngineState, deltaDebt: number): Record<string, any> {
    let entities = { ...(engineState.WORLD_ENTITIES || {}) };
    
    // Apply temporal decay first
    entities = NarrativeManifold.decayEntities(entities, engineState.TICK);

    Object.keys(entities).forEach(id => {
      const entity = entities[id];
      
      // Check if this entity was involved in the current turn
      const isInvolved = engineState.ACTIVE_PINS.some(pin => 
        pin.toLowerCase().includes(entity.name.toLowerCase()) || 
        engineState.CURRENT_GOAL.toLowerCase().includes(entity.name.toLowerCase())
      );

      if (isInvolved) {
        entity.lastInteractionTick = engineState.TICK;
      }

      // Tier 3: Manifold NPCs have autonomous state transitions
      if (entity.lod === 'Manifold') {
        // Simple heuristic: if global debt is high, bosses become more aggressive
        if (deltaDebt > 2.0) {
          entity.phase = "Aggressive/Opportunistic";
          entity.metrics.tension = Math.min(1.0, (entity.metrics.tension || 0) + 0.1);
        }
        
        // Strategy adaptation: if player uses a specific tactic (simulated by deltaDebt/Intensity)
        if (engineState.INTENSITY > 0.8) {
          entity.strategy = {
            ...(entity.strategy || {}),
            counter_measure: Math.min(1.0, (entity.strategy?.counter_measure || 0) + 0.05)
          };
        }
      }
      
      // Tier 2: Vector NPCs update salience
      if (entity.lod === 'Vector' && engineState.ACTIVE_PINS.length > 0) {
        const newMemory = [engineState.ACTIVE_PINS[0], ...(entity.memory || [])].slice(0, 5);
        entity.memory = newMemory;
      }
    });
    
    return entities;
  }
}
