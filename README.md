# Cromer Narrative Engine (CNE): Pantomime Protocol v1.1

The Cromer Narrative Engine is a mathematically grounded framework for managing
narrative consistency and state persistence in long-context AI environments.
It treats storytelling as a **Physical Manifold**, where every narrative choice
incurs a measurable "cost" known as **Causal Debt**.

## Core Mathematical Framework

The engine enforces coherence by evaluating the divergence between the current
narrative state and the proposed delta.

### 1. Causal Debt Evaluation \(D_c\)

Before a state transition is finalized, the engine calculates the **Impulse**
\(I\), representing the Euclidean distance between states:

\[
I = \sqrt{\left(\frac{Int_{target} - Int_{current}}{10}\right)^2 +
\sum_{k \notin L} (P_{target}[k] - P_{current}[k])^2}
\]

From this, we derive the **Base Debt** \(D_{base}\), which accounts for
narrative viscosity \(\eta\), momentum \(\gamma\), and exogenous source terms
\(Ex\):

\[
D_{base} = \max(0, I - 0.05\eta\gamma - 2Ex)
\]

The final **Causal Debt** \(D_c\) is resolved through narrative amortization
\(A\), ensuring that every deviation from the established logic has a
proportional consequence:

\[
D_c = \max(0, D_{base} - A)
\]

### 2. State Composition Operator \(\oplus\)

Updates to the Engine State \(P\) are processed via a weighted variance \(v\) to
maintain physical and behavioral stability:

- Weighted variance: \(v = 1 + 0.5\chi\)
- Intensity update: \(Int_{t+1} = Int_t + (Int_\Delta - Int_t) \cdot w \cdot v\)
- Parameter update: \(P_{t+1} = P_t + (P_\Delta - P_t) \cdot \sqrt{w} \cdot v\)

\(w\) is the significance weight determined by node reuse frequency within the
CNE graph.

### 3. Narrative Credit System \(C\)

Coherence is rewarded through a credit system capped at 10, facilitating future
high-impulse transitions as debts are successfully resolved:

\[
C_{t+1} = \min(10, C_t + \Delta C_{debt} + \Delta C_{prog})
\]

## Implementation Philosophy

- **Zero-hallucination threshold**: By enforcing \(D_c\) limits, the CNE
  prevents "character drift" in long-context windows (tested up to 146k
  tokens).
- **Thermodynamic narrative**: The use of viscosity and momentum ensures that
  the narrative has "weight," preventing abrupt, illogical character pivots.

## Licensing

This project is licensed under a **dual-license model**:

- GPLv3: For open-source, non-commercial use.
- Commercial license: For enterprise integration and closed-source
  applications. Contact the maintainer for terms.

## Attribution for Published Works

If you use the Cromer Narrative Engine (CNE) or any implementation of the
Pantomime Protocol to create works that are publicly distributed
(e.g. books, games, interactive fiction, or commercial narrative
experiences), you must provide reasonable attribution in the
accompanying credits, colophon, or documentation.

A suitable attribution is:

“Powered by the Cromer Narrative Engine (Pantomime Protocol v1.1)”

or a substantially similar phrase that mentions both “Cromer Narrative
Engine” and “Pantomime Protocol v1.1”.

This attribution requirement does **not** grant any rights over the
content of your work; it applies only to the use of the engine itself.

The demo app includes “optional provenance watermarking”
---

## Demo PWA and AI Studio App

<div align="center">
  <img width="1200" height="475" alt="GHBanner"
       src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

This repository also contains everything you need to run the demo app locally.

View the app in AI Studio:
https://ai.studio/apps/75acf0cb-171e-430c-842e-ead67bed8179

### Run locally

**Prerequisite:** Node.js

1. Install dependencies:

   ```bash
   npm install
