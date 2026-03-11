import { Type } from "@google/genai";

export const PHYSICS_CARTRIDGES: Record<string, any> = {
  "Noir": {
    causal_debt: { type: Type.NUMBER, description: "Logical debt from improbable actions.", default: 0 },
    viscosity: { type: Type.NUMBER, description: "Narrative thickness/pacing resistance.", default: 0.5 },
    progression: { type: Type.NUMBER, description: "Overall story progress (0.0 to 1.0).", default: 0.0 }
  },
  "System": {
    system_integration: { type: Type.NUMBER, description: "World's alignment with the new system (scaling upward).", default: 0 },
    mana_density: { type: Type.NUMBER, description: "Ambient magical energy levels.", default: 0.1 },
    accumulated_biomass: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of biological materials harvested.", default: [] },
    system_anomaly: { type: Type.NUMBER, description: "Glitches or deviations in system logic.", default: 0 }
  },
  "Cyberpunk": {
    chrome_stability: { type: Type.NUMBER, description: "Mental stability vs cybernetic load (0.0 to 1.0).", default: 1.0 },
    network_intrusion: { type: Type.NUMBER, description: "Level of active digital compromise.", default: 0 },
    corporate_heat: { type: Type.NUMBER, description: "Attention from megacorporations.", default: 0 },
    street_cred: { type: Type.NUMBER, description: "Reputation in the underworld.", default: 0.1 }
  },
  "Fantasy": {
    mana_tide: { type: Type.NUMBER, description: "Ambient magical pressure.", default: 0.5 },
    oath_binding: { type: Type.NUMBER, description: "Strength of active magical contracts.", default: 0 },
    corruption_blight: { type: Type.NUMBER, description: "Spread of dark influence.", default: 0 }
  },
  "Space": {
    hull_integrity: { type: Type.NUMBER, description: "Physical state of the vessel.", default: 1.0 },
    fuel_reserves: { type: Type.NUMBER, description: "Available reaction mass.", default: 1.0 },
    sector_tension: { type: Type.NUMBER, description: "Geopolitical instability in the current quadrant.", default: 0.2 }
  }
};

/**
 * Scans a genre string for keywords and returns a merged physics schema.
 * If axioms are provided, it uses them to build a custom schema.
 */
export const getSchemaForGenre = (genreString: string, axioms?: any) => {
  if (axioms) {
    const customSchema: any = {
      progression: { type: Type.NUMBER, description: "Overall story progress (0.0 to 1.0)." }
    };
    
    // Add custom axiom roles
    if (axioms.currency) {
      const key = axioms.currency.toLowerCase().replace(/\s+/g, '_');
      customSchema[key] = { type: Type.NUMBER, description: `The primary resource: ${axioms.currency}.` };
    }
    if (axioms.secondaryCurrency) {
      const key = axioms.secondaryCurrency.toLowerCase().replace(/\s+/g, '_');
      customSchema[key] = { type: Type.NUMBER, description: `The secondary resource: ${axioms.secondaryCurrency}.` };
    }
    if (axioms.friction) {
      const key = axioms.friction.toLowerCase().replace(/\s+/g, '_');
      customSchema[key] = { type: Type.NUMBER, description: `The world friction: ${axioms.friction}.` };
    }
    if (axioms.penalty) {
      const key = axioms.penalty.toLowerCase().replace(/\s+/g, '_');
      customSchema[key] = { type: Type.NUMBER, description: `The failure penalty: ${axioms.penalty}.` };
    }
    
    return customSchema;
  }

  let schema: any = {};
  const keywords = Object.keys(PHYSICS_CARTRIDGES);
  
  let found = false;
  keywords.forEach(key => {
    if (genreString.toLowerCase().includes(key.toLowerCase())) {
      const { ...props } = PHYSICS_CARTRIDGES[key];
      // Strip the 'default' key from the schema sent to Gemini
      const cleanProps: any = {};
      Object.keys(props).forEach(p => {
        const { default: _, ...rest } = props[p];
        cleanProps[p] = rest;
      });
      schema = { ...schema, ...cleanProps };
      found = true;
    }
  });

  if (!found) {
    // Default to Noir if no keywords match
    const noir = PHYSICS_CARTRIDGES["Noir"];
    Object.keys(noir).forEach(p => {
      const { default: _, ...rest } = noir[p];
      schema[p] = rest;
    });
  }

  return schema;
};

/**
 * Scans a genre string for keywords and returns initial values for the physics engine.
 */
export const getInitialPhysicsForGenre = (genreString: string, axioms?: any) => {
  if (axioms) {
    const physics: any = { progression: 0 };
    if (axioms.currency) {
      const key = axioms.currency.toLowerCase().replace(/\s+/g, '_');
      physics[key] = 0.1; // Start with some resource
    }
    if (axioms.secondaryCurrency) {
      const key = axioms.secondaryCurrency.toLowerCase().replace(/\s+/g, '_');
      physics[key] = 0.5; // Start with half secondary resource
    }
    if (axioms.friction) {
      const key = axioms.friction.toLowerCase().replace(/\s+/g, '_');
      physics[key] = 0.5; // Neutral friction
    }
    if (axioms.penalty) {
      const key = axioms.penalty.toLowerCase().replace(/\s+/g, '_');
      physics[key] = 0; // No penalty initially
    }
    return physics;
  }

  let physics: any = {};
  const keywords = Object.keys(PHYSICS_CARTRIDGES);
  
  let found = false;
  keywords.forEach(key => {
    if (genreString.toLowerCase().includes(key.toLowerCase())) {
      Object.keys(PHYSICS_CARTRIDGES[key]).forEach(prop => {
        physics[prop] = PHYSICS_CARTRIDGES[key][prop].default;
      });
      found = true;
    }
  });

  if (!found) {
    // Default to Noir values
    Object.keys(PHYSICS_CARTRIDGES["Noir"]).forEach(prop => {
      physics[prop] = PHYSICS_CARTRIDGES["Noir"][prop].default;
    });
  }

  return physics;
};
