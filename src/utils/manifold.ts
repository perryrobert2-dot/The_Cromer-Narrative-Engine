import { EngineState, EntityState, PhysicsPayload } from '../../types';

/**
 * The Narrative Manifold handles the "Hard Math" of the Cromer Engine.
 * Implements Pantomime Protocol v1.1 (Cromer-mHC).
 */
export class NarrativeManifold {
  private static readonly EPSILON = 1e-6;
  private static readonly PHI_MAX = 0.85;
  private static readonly DEBT_MAX = 5.0;

  /**
   * Significance Weighting (Ws)
   * Ws(n) = 1 / (1 + f(n) * log(1 + N))
   * Ensures weight is in [0, 1] range and decays as node is reused.
   */
  static calculateSignificanceWeight(nodeId: string, frequencies: Record<string, number>, totalNodes: number): number {
    const f_n = frequencies[nodeId] || 0;
    const N = Math.max(1, totalNodes);
    return 1 / (1 + f_n * Math.log(1 + N));
  }

  /**
   * Causal Debt Evaluation (Dc)
   * Patch 1.2: Exogenous Source Term (Ex) can pay down debt.
   * Patch 1.3: Automated Debt Amortization & Reserve Capacity.
   */
  static evaluateCausalDebt(current: EngineState, target: EngineState): number {
    const eta = current.PHYSICS.viscosity || 0.5;
    const gamma = 1.2; // Narrative momentum constant
    const Ex = current.PHYSICS.exogenous_source || 0;
    
    // Calculate "Impulse" as the Euclidean distance between key state vectors
    // Intensity is normalized to [0, 1] for the distance calculation
    let physicsImpulseSq = 0;
    const allPhysicsKeys = new Set([...Object.keys(current.PHYSICS), ...Object.keys(target.PHYSICS)]);
    
    // Patch 1.3.2: Exclude "Ledger" variables (Currency, Penalty, Credit) from the Impulse calculation.
    // These are meant to change significantly as part of the game logic and shouldn't trigger stasis.
    const ledgerTerms = [
      'causal_debt_ledger', 'narrative_credit', 'audit_error', 'manifold_tension',
      ...(current.AXIOMS ? [
        current.AXIOMS.currency.toLowerCase().replace(/\s+/g, '_'),
        current.AXIOMS.secondaryCurrency?.toLowerCase().replace(/\s+/g, '_'),
        current.AXIOMS.penalty.toLowerCase().replace(/\s+/g, '_')
      ] : [])
    ].filter(Boolean) as string[];

    allPhysicsKeys.forEach(key => {
      if (ledgerTerms.includes(key)) return; // Skip ledgers
      
      const cur = current.PHYSICS[key as keyof PhysicsPayload];
      const tar = target.PHYSICS[key as keyof PhysicsPayload];

      const curVal = typeof cur === 'number' ? cur : (cur && typeof cur === 'object' ? (cur as any).value : 0);
      const tarVal = typeof tar === 'number' ? tar : (tar && typeof tar === 'object' ? (tar as any).value : 0);
      
      physicsImpulseSq += Math.pow(tarVal - curVal, 2);
    });

    const impulse = Math.sqrt(
      Math.pow((target.INTENSITY - current.INTENSITY) / 10, 2) +
      physicsImpulseSq
    );

    const minDelta = 0.05;
    
    // --- AMORTIZATION LOGIC ---
    let amortization = 0;
    
    // 1. Physical Injury (-1.5)
    const currentInjuries = (current.GRAPH?.nodes || []).filter(n => n.type === 'psychological' && n.description.toLowerCase().includes('injury')).length;
    const targetInjuries = (target.GRAPH?.nodes || []).filter(n => n.type === 'psychological' && n.description.toLowerCase().includes('injury')).length;
    if (targetInjuries > currentInjuries) amortization += 1.5;

    // 2. Structural Destruction (-2.0)
    const currentLocs = (current.GRAPH?.nodes || []).filter(n => n.type === 'location').length;
    const targetLocs = (target.GRAPH?.nodes || []).filter(n => n.type === 'location').length;
    if (targetLocs < currentLocs) amortization += 2.0;

    // 3. Procedural Detail (-0.5)
    if ((target.PHYSICS.viscosity || 0) > (current.PHYSICS.viscosity || 0)) amortization += 0.5;

    // 4. Thematic Resonance (-1.0)
    if ((target.PHYSICS.resonance || 0) > 0.7) amortization += 1.0;

    // Exogenous Source Term (Ex) acts as a debt-reduction force
    const baseDebt = Math.max(0, impulse - (eta * gamma * minDelta) - (Ex * 2.0));
    const finalDebt = Math.max(0, baseDebt - amortization);
    
    return Number(finalDebt.toFixed(4));
  }

  /**
   * Composition Operator (⊕)
   * Patch 1.2.1: Correctly merges structural changes (Graph, Phase, Pins) 
   * while applying weighted manifold physics to numeric fields.
   * Patch 1.3: Added STAKES, AGENCY, ENTROPY, INFORMATION_GAP, RESONANCE.
   */
  static compose(current: EngineState, delta: Partial<EngineState>, weight: number): EngineState {
    // Start with a merge of structural fields that don't require manifold weighting
    const newState: EngineState = { 
      ...current,
      PHASE: delta.PHASE || current.PHASE,
      ACTIVE_PINS: delta.ACTIVE_PINS || current.ACTIVE_PINS,
      CURRENT_GOAL: delta.CURRENT_GOAL || current.CURRENT_GOAL,
      GRAPH: delta.GRAPH || current.GRAPH,
      NARRATIVE_DEBT: delta.NARRATIVE_DEBT || current.NARRATIVE_DEBT,
      PILLARS: delta.PILLARS || current.PILLARS,
      INTENT: delta.INTENT || current.INTENT,
      AESTHETICS: delta.AESTHETICS ? {
        STYLE: delta.AESTHETICS.STYLE || current.AESTHETICS.STYLE,
        VOICE: { ...current.AESTHETICS.VOICE, ...(delta.AESTHETICS.VOICE || {}) }
      } : current.AESTHETICS,
      PHYSICS: { ...current.PHYSICS, ...(delta.PHYSICS || {}) }
    };

    const chi = current.PHYSICS.theatrical_variance || 0.5;
    
    // Apply weighted changes to INTENSITY
    if (typeof delta.INTENSITY === 'number') {
      const diff = delta.INTENSITY - current.INTENSITY;
      const variance = 1 + (chi * 0.5);
      newState.INTENSITY = Number((current.INTENSITY + (diff * weight * variance)).toFixed(4));
    }

    // Apply weighted changes to all numeric fields in PHYSICS
    const allPhysicsKeys = Object.keys(newState.PHYSICS);
    allPhysicsKeys.forEach(key => {
      const cur = current.PHYSICS[key as keyof PhysicsPayload];
      const del = delta.PHYSICS?.[key as keyof PhysicsPayload];
      
      if (typeof cur === 'number' && typeof del === 'number') {
        const diff = del - cur;
        const variance = 1 + (chi * 0.5);
        const physicsWeight = Math.sqrt(weight); 
        (newState.PHYSICS as any)[key] = Number((cur + (diff * physicsWeight * variance)).toFixed(4));
        
        if (key !== 'causal_debt' && key !== 'narrative_credit' && key !== 'intensity' && key !== 'causal_debt_ledger') {
          (newState.PHYSICS as any)[key] = Math.min(1.0, Math.max(0, (newState.PHYSICS as any)[key]));
        }
      } else if (cur && typeof cur === 'object' && del && typeof del === 'object') {
        // Handle Tier 2 variables
        const curVal = (cur as any).value;
        const delVal = (del as any).value;
        if (typeof curVal === 'number' && typeof delVal === 'number') {
          const diff = delVal - curVal;
          const variance = 1 + (chi * 0.5);
          const physicsWeight = Math.sqrt(weight);
          const newVal = Number((curVal + (diff * physicsWeight * variance)).toFixed(4));
          (newState.PHYSICS as any)[key] = {
            ...(cur as any),
            value: Math.min(1.0, Math.max(0, newVal))
          };
        }
      }
    });

    // Final clamping
    newState.INTENSITY = Math.min(10, Math.max(0, newState.INTENSITY));
    if (typeof newState.PHYSICS.narrative_credit === 'number') {
      newState.PHYSICS.narrative_credit = Math.min(10, Math.max(0, newState.PHYSICS.narrative_credit));
    }

    return newState;
  }

  /**
   * Semantic Translation Layer (Patch 1.3)
   * Maps numeric ranges to named tiers for LLM processing.
   */
  static getTier(value: number, max: number = 1.0): string {
    const normalized = value / max;
    if (normalized < 0.3) return "DORMANT";
    if (normalized < 0.6) return "RISING";
    if (normalized < 0.9) return "ACUTE";
    return "CRITICAL";
  }

  /**
   * Translates the EngineState into a Semantic Directive block.
   */
  static translateState(state: EngineState): string {
    const physicsLines = Object.entries(state.PHYSICS)
      .map(([k, v]) => {
        if (typeof v === 'number') return `${k.toUpperCase()}: ${v}`;
        if (v && typeof v === 'object' && 'label' in v) return `${(v as any).label.toUpperCase()}: ${(v as any).value}`;
        return null;
      })
      .filter(Boolean)
      .join(', ');

    return `STATE: INTENSITY: ${state.INTENSITY}/10, ${physicsLines}`;
  }

  /**
   * Decomposition Operator (⊖)
   * Used for the Painting Axiom Audit to reverse state changes.
   */
  static decompose(current: EngineState, delta: Partial<EngineState>, weight: number): Partial<EngineState> {
    const reversedDelta: any = { PHYSICS: {} };
    
    if (typeof delta.INTENSITY === 'number' && typeof current.INTENSITY === 'number') {
      const diff = delta.INTENSITY - current.INTENSITY;
      reversedDelta.INTENSITY = Number((current.INTENSITY - (diff * weight * 0.1)).toFixed(4));
    }

    if (delta.PHYSICS) {
      Object.keys(delta.PHYSICS).forEach(key => {
        const curVal = current.PHYSICS[key];
        const delVal = delta.PHYSICS?.[key];
        if (typeof curVal === 'number' && typeof delVal === 'number') {
          const diff = delVal - curVal;
          reversedDelta.PHYSICS[key] = Number((curVal - (diff * weight * 0.1)).toFixed(4));
        }
      });
    }

    return reversedDelta;
  }

  /**
   * Painting Axiom Audit
   * Patch 1.2: Phi_max expansion with Ex.
   */
  static audit(current: EngineState, geneticAnchor: EngineState): number {
    if (!geneticAnchor) return 0;

    const Ex = current.PHYSICS.exogenous_source || 0;
    const phiMax = this.PHI_MAX + Ex;

    // Simplified reconstruction error check
    const error = Math.sqrt(
      Math.pow(current.INTENSITY - geneticAnchor.INTENSITY, 2) +
      Math.pow((current.PHYSICS.progression || 0) - (geneticAnchor.PHYSICS.progression || 0), 2)
    );

    // If error exceeds expanded Phi_max, we flag it
    return Number(error.toFixed(6));
  }

  /**
   * Normalizes the Tapestry Graph weights.
   */
  static normalizeGraph(state: EngineState): EngineState {
    if (!state.GRAPH || !state.GRAPH.nodes || !state.GRAPH.nodes.length) return state;

    const totalWeight = state.GRAPH.nodes.reduce((acc, n) => acc + (n.weight || 0), 0);
    if (totalWeight === 0) return state;

    const normalizedNodes = state.GRAPH.nodes.map(node => ({
      ...node,
      weight: Number(((node.weight || 0) / totalWeight).toFixed(3))
    }));

    return {
      ...state,
      GRAPH: {
        ...state.GRAPH,
        nodes: normalizedNodes
      }
    };
  }

  /**
   * Memory Decay Operator (Reverse Sigmoid)
   * f(t) = 1 / (1 + exp(k * (t - tau)))
   * @param t Time since last interaction (ticks)
   * @param k Decay rate (steepness) - higher is faster
   * @param tau Threshold (plateau) - higher is longer retention
   */
  static calculateMemoryDecay(t: number, k: number = 0.5, tau: number = 10): number {
    // Reverse Sigmoid: stays high, then drops sharply, then levels off
    const decay = 1 / (1 + Math.exp(k * (t - tau)));
    return Number(decay.toFixed(4));
  }

  /**
   * Applies temporal decay to all world entities.
   */
  static decayEntities(entities: Record<string, EntityState>, currentTick: number): Record<string, EntityState> {
    const decayed: Record<string, EntityState> = {};

    Object.entries(entities).forEach(([id, entity]) => {
      const t = currentTick - entity.lastInteractionTick;
      
      // Default parameters for different LODs
      let k = 0.3; // Decay rate
      let tau = 5; // Plateau
      
      if (entity.lod === 'Manifold') {
        k = 0.1; // Slower decay
        tau = 20; // Longer plateau
      } else if (entity.lod === 'Vector') {
        k = 0.4;
        tau = 8;
      }

      const strength = this.calculateMemoryDecay(t, k, tau);
      
      // Update memory weights
      const memoryWeights: Record<string, number> = {};
      if (entity.memory) {
        entity.memory.forEach(mid => {
          memoryWeights[mid] = strength;
        });
      }

      decayed[id] = {
        ...entity,
        memoryWeights
      };
    });

    return decayed;
  }
}
