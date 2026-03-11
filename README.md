# Cromer Narrative Engine (Pantomime Protocol v1.1)

The Cromer Narrative Engine is a high-density, state-managed narrative generator designed for interactive fiction, RPG mechanics, and NPC logic. It treats narrative as a dynamic system governed by mathematical constraints, implementing the Pantomime Protocol to ensure causal consistency, consequence, and thematic depth over long context windows.

## 1. Tiered Physics Architecture

The narrative physics system utilizes Dynamic Initialization, eliminating hardcoded cartridges in favor of a genre-aware, AI-driven schema.

### Tier 1 (Core Constants)
Immutable narrative drivers that govern fundamental story flow across all genres:
* `causal_debt`: Logical debt from improbable actions.
* `progression`: Overall story progress (0.0 to 1.0).
* `pacing`: Speed of narrative delivery.
* `introspection_density`: Ratio of internal thought to external action.
* `action_intensity`: Kinetic energy of the current scene.

### Tier 2 (Translatable Variables)
Abstract categories mapped to genre-specific labels via a Semantic Facade (e.g., `primary_resource` dynamically maps to "Mana" in Fantasy or "Credits" in Cyberpunk):
* `primary_resource`: The main consumable or metric of power.
* `environmental_friction`: The resistance the world exerts on the protagonist.
* `protagonist_integrity`: The physical or mental state of the main character.

## 2. The Narrative Manifold (Mathematical Operators)

The engine relies on the Narrative Manifold to process state changes and enforce logic.

### Causal Debt Evaluation ($D_c$)
Calculates the logical "cost" of every action. Improbable actions spike the Euclidean distance ($I$) and generate debt, which must be amortized ($A$) through narrative consequences (e.g., structural destruction, physical injury).

**Impulse Calculation:**
$$I = \sqrt{ \left(\frac{Int_{target} - Int_{current}}{10}\right)^2 + \sum_{k \notin L} (P_{target}[k] - P_{current}[k])^2 }$$
*(Where $L$ represents ledger terms exempt from stasis calculations)*

**Base Debt:**
$$D_{base} = \max(0, I - 0.05\eta\gamma - 2Ex)$$
*(Where $\eta$ is viscosity, $\gamma$ is narrative momentum, and $Ex$ is the exogenous source term)*

**Final Causal Debt:**
$$D_c = \max(0, D_{base} - A)$$

### The Composition Operator ($\oplus$)
Merges "Delta States" (AI suggestions) into the "Engine State" using weighted variance ($v = 1 + 0.5\chi$), ensuring smooth transitions in world physics.

**Intensity Update:**
$$Int_{t+1} = Int_t + (Int_{\Delta} - Int_t) \cdot w \cdot v$$

**Physics Parameter Update:**
$$P_{t+1} = P_t + (P_{\Delta} - P_t) \cdot \sqrt{w} \cdot v$$
*(Where $w$ is the significance weight based on node reuse frequency)*

## 3. Game Mechanics: Narrative Credit System

Narrative Credit ($C$) is capped at 10 and increases when debts are resolved or progression milestones are reached.

**Milestone Calculation:**
$$M = \lfloor P / 0.2 \rfloor$$

**Credit Update Function:**
$$C_{t+1} = \min(10, C_t + \Delta C_{debt} + \Delta C_{prog})$$
*(Where $\Delta C_{debt} = 1$ if total active debts decrease, and $\Delta C_{prog} = 1$ if $M_{t+1} > M_t$)*

## 4. Semantic Translation Layer

Translates raw numeric data from the physics state into Semantic Directives for the LLM. Values are normalized against a defined maximum (1.0).

| Normalized Range | Semantic Tier |
| :--- | :--- |
| < 0.3 | **DORMANT** |
| 0.3 to < 0.6 | **RISING** |
| 0.6 to < 0.9 | **ACUTE** |
| 0.9 to 1.0 | **CRITICAL** |