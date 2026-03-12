import { Type } from "@google/genai";

/**
 * Tier 1: Core Constants
 * These variables are immutable and govern the fundamental flow of the text.
 */
export const CORE_PHYSICS = {
  causal_debt: { type: Type.NUMBER, description: "Logical debt from improbable actions.", default: 0 },
  progression: { type: Type.NUMBER, description: "Overall story progress (0.0 to 1.0).", default: 0.0 },
  pacing: { type: Type.NUMBER, description: "The speed and rhythm of narrative events.", default: 0.5 },
  introspection_density: { type: Type.NUMBER, description: "The frequency and depth of internal character monologue.", default: 0.3 },
  action_intensity: { type: Type.NUMBER, description: "The kinetic energy and stakes of physical scenes.", default: 0.2 }
};

/**
 * Tier 2: Translatable Variables
 * These are abstract categories that the AI maps to specific genre labels.
 */
export const TRANSLATABLE_PHYSICS = {
  primary_resource: { type: Type.NUMBER, description: "The fuel for actions (e.g., Mana, Credits, Sanity).", default: 0.1 },
  environmental_friction: { type: Type.NUMBER, description: "What makes progress difficult (e.g., System Anomaly, Corporate Heat).", default: 0.5 },
  protagonist_integrity: { type: Type.NUMBER, description: "The physical or mental state of the lead (e.g., Health, Chrome Stability).", default: 1.0 }
};

/**
 * Returns the full physics schema for a story.
 * If dynamicLabels is provided, it overwrites the Tier 2 descriptions.
 */
export const getPhysicsSchema = (dynamicLabels?: Record<string, { label: string, description: string }>) => {
  const schema: any = {};
  
  // Add Tier 1
  Object.keys(CORE_PHYSICS).forEach(key => {
    const { default: _, ...rest } = (CORE_PHYSICS as any)[key];
    schema[key] = rest;
  });

  // Add Tier 2
  Object.keys(TRANSLATABLE_PHYSICS).forEach(key => {
    const { default: _, ...rest } = (TRANSLATABLE_PHYSICS as any)[key];
    const dynamic = dynamicLabels?.[key];
    
    schema[key] = {
      ...rest,
      description: dynamic ? `${dynamic.label}: ${dynamic.description}` : rest.description
    };
  });

  return schema;
};

/**
 * Returns the initial physics values.
 */
export const getInitialPhysics = () => {
  return {
    causal_debt: 0,
    progression: 0,
    pacing: 0.5,
    introspection_density: 0.3,
    action_intensity: 0.2,
    primary_resource: { label: "Resource", value: 0.5, description: "Primary narrative fuel" },
    environmental_friction: { label: "Friction", value: 0.5, description: "Resistance to progress" },
    protagonist_integrity: { label: "Integrity", value: 1.0, description: "Character stability" }
  };
};
