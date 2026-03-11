# Cromer Narrative Engine and Pantomime Protocol v1.1

**A Technical Whitepaper and Intellectual Property Disclosure**

## Abstract

The Cromer Narrative Engine represents a high-density, state-managed narrative generator explicitly designed to resolve the limitations of traditional, chat-based interactive fiction and NPC logic systems. Historically, state-managed narrative systems have struggled to maintain causal consistency and thematic depth over long context windows. To solve this, the engine implements the Pantomime Protocol v1.1, which treats narrative progression as a dynamic system governed by rigorous mathematical constraints. By calculating the logical debt of probabilistic narrative events, the engine enforces causality, ensuring that improbable actions carry structural consequences, thereby elevating the standard of state-managed interactive mechanics.

## Tiered Physics Architecture

The engine's narrative physics system utilizes "Dynamic Initialization" to move beyond the rigid limitations of traditional, hardcoded schema cartridges. This transition empowers a genre-aware, AI-driven structure known as the Semantic Facade, which separates variables into two distinct tiers:

**Tier 1 (Core Constants):** These are immutable narrative drivers that govern fundamental story flow across all genres. The Tier 1 payload includes:

* `causal_debt`: The logical debt accrued from improbable actions.
* `progression`: The overall story progress, normalized from $0.0$ to $1.0$.
* `pacing`: The speed of narrative delivery.
* `introspection_density`: The ratio of a character's internal thought to external action.
* `action_intensity`: The kinetic energy present within the current scene.

**Tier 2 (Translatable Variables):** These are abstract variables mapped dynamically via the Semantic Facade to fit the specific genre of the narrative. For instance, the abstract `primary_resource` variable (representing a main consumable metric of power) can dynamically map to "Mana" in a Fantasy setting or "Credits" in a Cyberpunk setting. Additional variables in this tier include `environmental_friction` (the resistance the world exerts on the protagonist) and `protagonist_integrity` (the protagonist's physical or mental state). Raw numeric data from this physics state is subsequently processed through a Semantic Translation Layer, converting numbers normalized against a maximum of $1.0$ into semantic directives for the LLM (ranging from DORMANT at $<0.3$ to CRITICAL at $0.9$ to $1.0$).

## Mathematical Framework

The core of the Pantomime Protocol v1.1 relies on the Narrative Manifold, a robust set of mathematical operators that process state changes and enforce logic.

**Causal Debt Evaluation ($D_c$):** The engine calculates the logical "cost" of every action. Improbable actions spike the Euclidean distance ($I$) and generate debt, which must be systematically amortized ($A$) through narrative consequences. The framework applies the following equations:

*Impulse Calculation:*


$$I = \sqrt{ \left(\frac{Int_{target} - Int_{current}}{10}\right)^2 + \sum_{k \notin L} (P_{target}[k] - P_{current}[k])^2 }$$


*(Where $L$ represents ledger terms exempt from stasis calculations)*

*Base Debt:*


$$D_{base} = \max(0, I - 0.05\eta\gamma - 2Ex)$$


*(Where $\eta$ is viscosity, $\gamma$ is narrative momentum, and $Ex$ is the exogenous source term)*

*Final Causal Debt:*


$$D_c = \max(0, D_{base} - A)$$

**The Composition Operator ($\oplus$):** This operator merges "Delta States" (AI-generated suggestions) into the main "Engine State" using a weighted variance ($v = 1 + 0.5\chi$) to guarantee smooth transitions in world physics.

*Intensity Update:*


$$Int_{t+1} = Int_t + (Int_{\Delta} - Int_t) \cdot w \cdot v$$

*Physics Parameter Update:*


$$P_{t+1} = P_t + (P_{\Delta} - P_t) \cdot \sqrt{w} \cdot v$$


*(Where $w$ is the significance weight based on node reuse frequency)*

## Runtime Telemetry Case Study: The Causal Roast

To empirically validate the amortization of debt and narrative credit scaling, we reference the runtime telemetry log designated "The Causal Roast". This case study demonstrates the engine resolving a live generation sequence:

* **Debt Inception:** The protagonist executes a mathematically improbable action by surviving a four-meter fall to evade a mutated scrub turkey. The system detects lethal probability, initiates a Causal Override, and spikes `causal_debt` from $0$ to $1200.0828$ while `progression` reaches $0.0625$.
* **Biomass Harvest & Debt Mitigation:** The protagonist harvests high-density silica-laced banksia cones for exogenous energy. `causal_debt` amortizes slightly to $1195.5718$, `progression` increases to $0.1959$, and mana hits $0.9696$ (CRITICAL tier).
* **Severe Debt Amortization via Structural Destruction:** The protagonist roasts the mutated flora in a Giesen W6. The localized anomaly ruptures the exhaust flue and cracks the foundation. The engine uses this physical consequence to drastically amortize `causal_debt` from $1195.5718$ down to $995.5953$, and finally to $5.6596$. `progression` advances to $0.2916$.
* **Narrative Credit Assignment:** Game logic strictly dictates Narrative Credit ($C$), capped at $10$, utilizing milestone calculations:

$$M = \lfloor P / 0.2 \rfloor$$



and update function:

$$C_{t+1} = \min(10, C_t + \Delta C_{debt} + \Delta C_{prog})$$



Because the progression crossed the $0.2$ ($20\%$) threshold, the system outputted a milestone log, incrementing the `narrative_credit` to $1$.

## Alternative Embodiments

To establish comprehensive prior art and protect the intellectual property surrounding the Pantomime Protocol, the engine is mathematically agnostic regarding how Causal Debt is calculated. The following schemas are explicitly claimed as valid alternative embodiments:

* **Information Theory (Bayesian) Embodiment:** State changes are modeled using probability and "Surprisal" (Self-Information) rather than Euclidean distance. Debt is incurred logarithmically relative to the improbability of the event, and the Composition Operator uses Bayesian updating to calculate the posterior state.
* **Control Theory (Kalman) Embodiment:** Narrative acts as a continuous signal with the AI as a noisy sensor. The Composition Operator uses dynamic Kalman Gain to reject predictive anomalies, and Causal Debt is measured as the integral of the control effort required to maintain trajectory.
* **Thermodynamic Embodiment:** Narrative tension represents entropy. The Second Law of Thermodynamics is enforced, demanding external energy (Exogenous Source Terms) to reverse structural decay. Causal Debt is the accumulated entropy, requiring venting through destructive narrative events to avoid narrative stasis (thermal death).

## Licensing & Commercialization

The Cromer Narrative Engine and Pantomime Protocol v1.1 operate strictly under a Dual License structure to balance open-source propagation with commercial IP defense:

* **Option 1: GNU General Public License v3 (GPLv3):** The software is available for non-commercial or open-source projects, mandating that the integrating project is wholly released publicly under the GPLv3 terms.
* **Option 2: Commercial License:** Entities integrating the architecture into proprietary, closed-source products (such as commercial video games) must purchase this license. It waives the open-source requirements of the GPLv3, allowing developers to utilize the engine's state-management mechanics securely as proprietary middleware for interactive fiction and NPC logic.

---