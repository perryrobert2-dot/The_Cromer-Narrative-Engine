# **Cromer Narrative Engine (CNE): Pantomime Protocol v1.1**

The **Cromer Narrative Engine** is a mathematically grounded framework for managing narrative consistency and state persistence in long-context AI environments. It treats storytelling as a **Physical Manifold**, where every narrative choice incurs a measurable "cost" known as **Causal Debt**.

## **Core Mathematical Framework**

The engine enforces coherence by evaluating the divergence between the current narrative state and the proposed delta.

### **1. Causal Debt Evaluation ($D_c$)**

Before a state transition is finalized, the engine calculates the **Impulse ($I$)**, representing the Euclidean distance between states:

$$I = \sqrt{\left(\frac{Int_{target} - Int_{current}}{10}\right)^2 + \sum_{k \notin L} (P_{target}[k] - P_{current}[k])^2}$$

From this, we derive the **Base Debt ($D_{base}$)**, which accounts for narrative viscosity ($\eta$), momentum ($\gamma$), and exogenous source terms ($Ex$):

$$D_{base} = \max(0, I - 0.05\eta\gamma - 2Ex)$$

The final **Causal Debt ($D_c$)** is resolved through narrative amortization ($A$), ensuring that every deviation from the established logic has a proportional consequence:

$$D_c = \max(0, D_{base} - A)$$

### **2. State Composition Operator ($\oplus$)**

Updates to the Engine State ($P$) are processed via a weighted variance ($v$) to maintain physical and behavioral stability:

* **Weighted Variance:** $v = 1 + 0.5\chi$
* **Intensity Update:** $Int_{t+1} = Int_t + (Int_\Delta - Int_t) \cdot w \cdot v$
* **Parameter Update:** $P_{t+1} = P_t + (P_\Delta - P_t) \cdot \sqrt{w} \cdot v$

*(Note: $w$ is the significance weight determined by node reuse frequency within the CNE graph.)*

### **3. Narrative Credit System ($C$)**

Coherence is rewarded through a credit system capped at 10, facilitating future high-impulse transitions as debts are successfully resolved:

$$C_{t+1} = \min(10, C_t + \Delta C_{debt} + \Delta C_{prog})$$

---

## **Implementation Philosophy**

* **Zero-Hallucination Threshold:** By enforcing $D_c$ limits, the CNE prevents "character drift" in long-context windows (tested up to 146k tokens).
* **Thermodynamic Narrative:** The use of viscosity and momentum ensures that the narrative has "weight," preventing abrupt, illogical character pivots.

## **Licensing**

This project is licensed under a **Dual-License Model**:

1. **GPLv3:** For open-source, non-commercial use.
2. **Commercial License:** For enterprise integration and closed-source applications. Contact the maintainer for terms.

---
