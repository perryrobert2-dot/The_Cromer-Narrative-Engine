# Cromer Narrative Engine and Pantomime Protocol v1.1

**A Technical Whitepaper and Intellectual Property Disclosure**
**Author:** Robert Perry
**Date:** March 2026

## Abstract
The Cromer Narrative Engine represents a high-density, state-managed narrative generator explicitly designed to resolve the limitations of traditional chat-based interactive fiction and NPC logic systems. Historically, state-managed narrative systems have struggled to maintain causal consistency and thematic depth over long context windows. To solve this, the engine implements the **Pantomime Protocol v1.1**, which treats narrative progression as a dynamic system governed by rigorous mathematical constraints. By calculating the logical debt of probabilistic narrative events, the engine enforces causality, ensuring that improbable actions carry structural consequences.

## Tiered Physics Architecture
The engine's narrative physics system utilizes "Dynamic Initialization" to move beyond the rigid limitations of traditional, hardcoded schema cartridges. This transition empowers a genre-aware, AI-driven structure known as the **Semantic Facade**, which separates variables into two distinct tiers:

### Tier 1 (Core Constants)
These are immutable narrative drivers that govern fundamental story flow across all genres:
* **Causal Debt ($D_c$):** The logical debt accrued from improbable actions.
* **Progression:** The overall story progress, normalized from $0.0$ to $1.0$.
* **Pacing:** The speed of narrative delivery.
* **Introspection Density:** The ratio of a character's internal thought to external action.
* **Action Intensity:** The kinetic energy present within the current scene.

### Tier 2 (Translatable Variables)
These variables are mapped dynamically via the Semantic Facade to fit the specific genre. In the v1.1 baseline, the mapping is as follows:
* **Primary Resource (Reputation):** Social currency in a city of predators; once spent, it cannot be regained (Value: $0.6878$).
* **Environmental Friction (Viscosity):** The stifling atmosphere that slows escape and investigation (Value: $0.888$).
* **Protagonist Integrity (Moral Resolve):** Structural soundness of the protagonist's conscience against predatory pressure (Value: $0.6929$).

## Mathematical Framework
The core of the Pantomime Protocol v1.1 relies on the **Narrative Manifold**, a set of mathematical operators that process state changes and enforce logic.

### Causal Debt Evaluation ($D_c$)
The engine calculates the logical "cost" of every action. Improbable actions spike the Euclidean distance ($I$) and generate debt, which must be systematically amortized ($A$) through narrative consequences:

*Impulse Calculation:*
$$I = \sqrt{ \left(\frac{Int_{target} - Int_{current}}{10}\right)^2 + \sum_{k \notin L} (P_{target}[k] - P_{current}[k])^2 }$$

*Base Debt:*
$$D_{base} = \max(0, I - 0.05\eta\gamma - 2Ex)$$

*Final Causal Debt:*
$$D_c = \max(0, D_{base} - A)$$

### The Composition Operator ($\oplus$)
This operator merges "Delta States" (AI-generated suggestions) into the main "Engine State" using a weighted variance ($v = 1 + 0.5\chi$) to guarantee smooth transitions in world physics:

$$Int_{t+1} = Int_t + (Int_{\Delta} - Int_t) \cdot w \cdot v$$

## Runtime Telemetry Case Study: The Sieve and the Kiln
To empirically validate the v1.1 protocol, we reference the telemetry log **"The Sieve and the Kiln"**. This case study demonstrates the engine resolving a survival horror sequence with the following parameters:

* **Phase/Genre:** Climax / Survival Horror.
* **Intensity Management:** The engine maintained a system intensity of **9.0714** during the final assault on the Fired-Clay Redoubt.
* **Debt Amortization:** The system documented a stable **Causal Debt ($D_c$)** of **0.1691**, amortized from earlier breaches of grass and timber structures.
* **Narrative Credit:** Progression reached $0.3999$, triggering the update function $C_{t+1} = \min(10, C_t + \Delta C_{debt} + \Delta C_{prog})$, resulting in a credit balance of **1.5213**.
* **Constraint Compliance:** Observational voice density was maintained at **0.85**, successfully filtering banned fairytale tropes through the narrative state controller.



## Alternative Embodiments
To establish comprehensive prior art and protect the intellectual property surrounding the Pantomime Protocol, the engine is mathematically agnostic regarding $D_c$ calculation. The following schemas are explicitly claimed as valid alternative embodiments:

* **Information Theory (Bayesian) Embodiment:** State changes are modeled using "Surprisal." Debt is incurred logarithmically relative to event improbability.
* **Control Theory (Kalman) Embodiment:** Narrative acts as a continuous signal with the AI as a noisy sensor. Causal Debt is measured as the integral of the control effort required to maintain trajectory.
* **Thermodynamic Embodiment:** Narrative tension represents entropy. Causal Debt is the accumulated entropy, requiring venting through destructive narrative events.

## Licensing & Commercialization
The engine operates under a **Dual License** structure to balance open-source propagation with commercial IP defense:

* **Option 1 (GPLv3):** Available for non-commercial or open-source projects; mandates that the integrating project is released publicly under the GPLv3.
* **Option 2 (Commercial License):** Entities integrating the architecture into proprietary products must purchase this license. It waives the open-source requirements of the GPLv3, allowing for proprietary middleware integration.

---