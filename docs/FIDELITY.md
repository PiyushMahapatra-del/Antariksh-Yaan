# AEGIS TRANSIT — Subsystem Fidelity Specification

> [!WARNING]
> **SIMULATION: NOT FLIGHT SOFTWARE**  
> This document details the technical fidelity classification of every subsystem modeled within the AEGIS TRANSIT mission console. No claims of flight heritage, space qualification, or flight certification are made or implied. All models, calculations, and diagnostic routines are intended for engineering simulation, research, and interactive console demonstration.

---

## 1. Fidelity Tier Definitions

In aerospace systems engineering, simulation fidelity represents the degree of realism, physical precision, and mathematical rigor with which an operational environment or vehicle subsystem is replicated.

AEGIS TRANSIT categorizes all simulated models into three distinct fidelity tiers:

```
+-----------------------------------------------------------------------------------------+
|                                    FIDELITY TIERS                                       |
|                                                                                         |
|  +--------------------+---------------------------------------------------------------+ |
|  | Tier               | Operational Definition & Verification Standard                | |
|  +--------------------+---------------------------------------------------------------+ |
|  | HIGH               | Analytic mathematical physics or rigorous numerical solvers.  | |
|  | (Badge: GREEN)     | Strict conservation laws (energy, momentum, mass). Closed-    | |
|  |                    | form solutions or iterative convergence with bounded residual | |
|  |                    | error (< 1e-10). Explainable machine learning with exact      | |
|  |                    | axiomatic attribution (TreeSHAP).                             | |
|  +--------------------+---------------------------------------------------------------+ |
|  | MEDIUM             | Lumped-parameter engineering models and first-order ordinary  | |
|  | (Badge: AMBER)     | differential equations (ODEs). Dynamic state-space balance    | |
|  |                    | (temperatures, gas partial pressures, battery state of charge,| |
|  |                    | sensor noise). Captures physical trends and multi-subsystem   | |
|  |                    | coupling without 3D finite-element or CFD computational lag.  | |
|  +--------------------+---------------------------------------------------------------+ |
|  | SCRIPTED           | Deterministic finite state machines (FSM) and sequenced       | |
|  | (Badge: GRAY)      | procedural timelines. Visual and telemetry progression driven | |
|  |                    | by state transitions and pre-computed curves rather than      | |
|  |                    | real-time aerodynamic, terrain, or hydrodynamic solvers.      | |
|  +--------------------+---------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------+
```

### 1.1 High Fidelity (`HIGH`)
* **Characteristics**: Solves fundamental physics equations directly. Operates using exact vector mathematics, conic sections, or iterative solvers with strict convergence criteria. 
* **Validation**: Solvers are verified against published NASA/JPL trajectory benchmarks and analytic orbital mechanics solutions.
* **UI Representation**: Marked with a green `.fidelity-high` badge in telemetry headers and system cards.

### 1.2 Medium Fidelity (`MEDIUM`)
* **Characteristics**: Replaces continuous three-dimensional partial differential equations (PDEs) with lumped-parameter nodal approximations, discrete-time differential equations, and empirical lookup curves.
* **Validation**: Verified to accurately replicate dynamic time constants, thermal latencies, battery charging hysteresis, and physiological stress responses.
* **UI Representation**: Marked with an amber `.fidelity-medium` badge.

### 1.3 Scripted Fidelity (`SCRIPTED`)
* **Characteristics**: Operates as a deterministic state machine following published mission timelines. Provides accurate operational sequencing and realistic telemetry curves, but does not integrate real-time aerodynamic or surface interaction forces.
* **Validation**: Verified against reference mission profiles (such as Mars 2020 EDL timeline and Apollo lunar ascent sequences).
* **UI Representation**: Marked with a neutral gray `.fidelity-scripted` badge.

---

## 2. Subsystem Fidelity Matrix

The table below catalogs every modeled subsystem, its assigned fidelity tier, and the underlying mathematical implementation:

| Subsystem | Fidelity | Notes |
|---|:---:|---|
| **Orbital Mechanics (Kepler)** | `HIGH` | Analytic Kepler orbits with Newton-Raphson solver for eccentric anomaly. |
| **Trajectory (Lambert)** | `HIGH` | Universal-variable Lambert solver for interplanetary orbital transfers. |
| **Ship Propagation** | `HIGH` | Universal-variable Keplerian state vector propagation ($\mathbf{r}_0, \mathbf{v}_0 \rightarrow \mathbf{r}, \mathbf{v}$). |
| **Comm Geometry** | `HIGH` | Geometric light-time calculation, Earth-Sun-Probe angle $\theta$, and solar conjunction blackout. |
| **Thermal (Coolant Loops)** | `MEDIUM` | First-order lumped ODEs, dual coolant loops, Stefan-Boltzmann radiative cooling. |
| **ECLSS (Life Support)** | `MEDIUM` | Dalton's law mass-balance partial pressures ($pO_2, pCO_2, pN_2$), automated scrubbers/bleed valves. |
| **Power (Solar Array)** | `MEDIUM` | Inverse-square solar irradiance ($1/r^2$), dual solar wings, simplified battery equivalent circuit. |
| **GNC & Propulsion** | `MEDIUM` | Attitude kinematics via unit quaternions, RCS thruster pulse jitter, Tsiolkovsky rocket equation. |
| **Radiation** | `MEDIUM` | Baseline empirical dosage lookup (MSL RAD data), storm shelter shielding factors, injectable SPE. |
| **Crew Physiology** | `MEDIUM` | Sigmoid oxygen-hemoglobin saturation curve ($SpO_2$), compensatory heart rate response. |
| **Compute Model** | `MEDIUM` | Dynamic electrical power draw and thermal cold-plate coupling for avionics and AI accelerator. |
| **EDL Sequence** | `SCRIPTED` | Deterministic finite state machine animation and telemetry profile; no aerodynamic/hypersonic model. |
| **Surface Ops** | `SCRIPTED` | Scripted surface mission timeline and science checklists; no topographic terrain model. |
| **Ascent** | `SCRIPTED` | State-machine ascent profile and orbital rendezvous staging animation. |
| **AI Thermal Diagnostics** | `HIGH` | Pre-trained Random Forest classifier on synthetic fault matrix with exact TreeSHAP attribution. |
| **Knowledge Graph / BM25** | `MEDIUM` | Hand-authored subsystem dependency graph, TF-IDF / BM25 lexical search over flight procedures. |
| **Medical CDSS** | `MEDIUM` | Immutable R0 emergency decision trees paired with naive Bayes probabilistic symptom differential. |
| **DTN Link Model** | `MEDIUM` | Illustrative link budget ($500/100\text{ kbps}$ @ 1 AU), RFC 5050 bundle spool, CFDP-lite retransmission. |

---

## 3. Subsystem Technical Breakdown & Mathematical Formulations

### 3.1 Orbital Mechanics (Kepler) — `HIGH FIDELITY`
* **Governing Equations**:
  Kepler's Equation relates mean anomaly $M$ to eccentric anomaly $E$:
  $$M = E - e \sin E$$
  For hyperbolic orbits ($e > 1$):
  $$M_h = e \sinh F - F$$
* **Numerical Method**:
  Newton-Raphson iteration with initial guess:
  $$E_0 = M + \frac{e \sin M}{1 - \sin(M + e) + \sin M}$$
  Iterated until convergence error $|\Delta E| < 10^{-12}$:
  $$E_{k+1} = E_k - \frac{E_k - e \sin E_k - M}{1 - e \cos E_k}$$
* **Heliocentric State Vector**:
  True anomaly $\nu = 2 \arctan \left(\sqrt{\frac{1+e}{1-e}} \tan \frac{E}{2}\right)$, radius $r = \frac{a(1-e^2)}{1 + e \cos \nu}$.
* **Fidelity Justification**: Yields exact planetary and spacecraft positions in the ecliptic plane, matching analytic celestial mechanics without cumulative drift.

---

### 3.2 Trajectory (Lambert Targeter) — `HIGH FIDELITY`
* **Governing Equations**:
  Solves Gauss's problem: finding the unique Keplerian transfer orbit connecting position vectors $\mathbf{r}_1$ and $\mathbf{r}_2$ across flight time $\Delta t$. Formulated using Bate-Mueller-White universal variables:
  $$\Delta t = \frac{x^3 c_3(z) + A \sqrt{y(z)}}{\sqrt{\mu}}$$
  where $z = \alpha x^2$, and $c_2(z), c_3(z)$ are universal Stumpff functions.
* **Numerical Method**:
  Secant method iteration on universal variable $z$ converging to $|\Delta t_{calc} - \Delta t_{target}| < 10^{-6}\text{ s}$.
* **Output**:
  Initial burn velocity $\mathbf{v}_1$, arrival burn velocity $\mathbf{v}_2$, and required maneuver impulsive $\Delta v = |\mathbf{v}_1 - \mathbf{v}_{ship}|$.
* **Fidelity Justification**: Enables high-precision trajectory correction maneuvers (TCM) and realistic fuel budgeting.

---

### 3.3 Spacecraft Propagation — `HIGH FIDELITY`
* **Governing Equations**:
  Universal-variable Keplerian state propagation using Stumpff functions $c_0, c_1, c_2, c_3$.
* **Implementation**:
  Propagates Cartesian state $[\mathbf{r}_0, \mathbf{v}_0] \rightarrow [\mathbf{r}(t), \mathbf{v}(t)]$ across arbitrary time steps $\Delta t$ without step-size accumulation errors or energy drift characteristic of Euler or standard Runge-Kutta integrators.
* **Fidelity Justification**: Essential for smooth, glitch-free time warp from 1x up to 604,800x (7 days/second).

---

### 3.4 Communication Geometry — `HIGH FIDELITY`
* **Governing Equations**:
  * One-way distance: $r_{comm} = \|\mathbf{r}_{spacecraft} - \mathbf{r}_{earth}\|$
  * Geometric light-time: $\tau = \frac{r_{comm}}{c}$
  * Earth-Sun-Probe angle $\theta$:
    $$\cos \theta = \frac{(\mathbf{r}_{spacecraft} - \mathbf{r}_{earth}) \cdot (-\mathbf{r}_{earth})}{\|\mathbf{r}_{spacecraft} - \mathbf{r}_{earth}\| \|\mathbf{r}_{earth}\|}$$
* **Blackout Threshold**:
  Blackout condition active if $\theta < \text{BLACKOUT\_THETA\_DEG}$ ($2.0^\circ$).
* **Fidelity Justification**: Directly computed from true instantaneous geometric vectors. Accurately drives DTN bundle queuing and latency displays.

---

### 3.5 Thermal Subsystem (Coolant Loops) — `MEDIUM FIDELITY`
* **Governing Equations**:
  First-order lumped thermal capacitance nodes:
  $$C_{cabin} \frac{dT_{cabin}}{dt} = Q_{crew} + Q_{avionics} - \dot{m} c_p (T_{cabin} - T_{coolant,in})$$
  $$C_{radiator} \frac{dT_{rad}}{dt} = \dot{m} c_p (T_{coolant,out} - T_{rad}) + \alpha A S(r) - \epsilon \sigma A T_{rad}^4$$
* **Simplifications**:
  * Dual redundant loops (Loop A, Loop B) with shared radiator bypass valve.
  * Constant fluid specific heat $c_p$; incompressible coolant flow.
  * No 3D spatial temperature gradients or fluid turbulence modeled.
* **Fidelity Justification**: Captures thermal inertia, pump failures, valve sticking, radiator shadow cooling, and overtemperature alarms while allowing fast ODE integration.

---

### 3.6 ECLSS (Environmental Control & Life Support) — `MEDIUM FIDELITY`
* **Governing Equations**:
  Partial pressure mass-balance based on Dalton's Law of Partial Pressures ($P_{total} = pO_2 + pCO_2 + pN_2 + pH_2O$):
  $$\frac{d(pO_2)}{dt} = \frac{R T}{V_{cabin}} \left( \dot{m}_{O2,inject} - \dot{m}_{O2,crew} \right)$$
  $$\frac{d(pCO_2)}{dt} = \frac{R T}{V_{cabin}} \left( \dot{m}_{CO2,crew} - \dot{m}_{CO2,scrubbed} \right)$$
* **Simplifications**:
  * Isothermal cabin gas mixture ($T_{cabin} \approx 294.15\text{ K}$).
  * Scrubber efficiency modeled as first-order reaction rate kinetics.
  * Sabatier reactor and water reclamation cycles modeled via mass conservation transfer efficiencies.
* **Fidelity Justification**: Provides realistic life-support dynamics (hypoxia, hypercapnia, rapid depressurization) without full CFD atmospheric modeling.

---

### 3.7 Electrical Power Subsystem (EPS) — `MEDIUM FIDELITY`
* **Governing Equations**:
  * Solar Array Generation:
    $$P_{solar}(r) = P_0 \times \left(\frac{1.0\text{ AU}}{r}\right)^2 \times \max(0, \mathbf{n}_{panel} \cdot \mathbf{s}_{sun})$$
  * Battery State-of-Charge (SoC):
    $$\frac{d(SoC)}{dt} = \frac{P_{solar} - P_{load}}{V_{bus} \cdot Q_{battery}}$$
* **Simplifications**:
  * Continuous Sun-pointing tracking assumed for nominal cruise.
  * Battery equivalent series resistance (ESR) modeled as linear function of temperature and DoD.
* **Fidelity Justification**: Faithfully demonstrates power margin degradation during Mars cruise ($1.0 \rightarrow 1.524\text{ AU}$).

---

### 3.8 GNC & Propulsion Subsystem — `MEDIUM FIDELITY`
* **Governing Equations**:
  * Attitude Kinematics: Unit quaternion derivative:
    $$\mathbf{\dot{q}} = \frac{1}{2} \mathbf{q} \otimes \boldsymbol{\omega}$$
  * Rocket Equation:
    $$\Delta v = I_{sp} g_0 \ln\left(\frac{m_{initial}}{m_{final}}\right)$$
  * Thruster Pulse Jitter: Cold-gas reaction control system (RCS) thruster pulses include Gaussian timing jitter and force fluctuations ($\sigma = 2\%$).
* **Simplifications**:
  * Rigid-body spacecraft dynamics; flexible solar array structural modes neglected.
  * Reaction wheel desaturation handled as discrete torque dumps.
* **Fidelity Justification**: Enables attitude maneuvering, orientation locking (Sun, Earth, Mars, Velocity vector), and burn execution while maintaining deterministic performance.

---

### 3.9 Radiation Subsystem — `MEDIUM FIDELITY`
* **Governing Model**:
  * Background Galactic Cosmic Rays (GCR): Empirical baseline rates ($1.8\text{ mSv/day}$ cruise, $0.64\text{ mSv/day}$ surface) derived from MSL RAD.
  * Solar Particle Events (SPE): Stochastic Coronal Mass Ejection proton flux injections ($50\text{--}500\text{ mSv/hr}$).
  * Storm Shelter Attenuation: Dedicated polyethylene/water-wall shelter provides a $90\%$ dose reduction factor ($F_{shield} = 0.10$).
* **Simplifications**:
  * Integrated ionizing dose and linear energy transfer (LET) spectrum simplified to equivalent Sievert dosage.
* **Fidelity Justification**: Delivers authentic operational decision-making during solar storms without nuclear particle transport codes (such as GEANT4/FLUKA).

---

### 3.10 Crew Physiology — `MEDIUM FIDELITY`
* **Governing Equations**:
  * Blood Oxygen Saturation ($SpO_2$): Hill equation sigmoid curve:
    $$SpO_2(pO_2) = \frac{(pO_2)^n}{(pO_2)^n + (P_{50})^n}$$
  * Compensatory Heart Rate ($HR$):
    $$HR = HR_{rest} \times \left(1 + \beta \max(0, 0.95 - SpO_2)\right)$$
* **Simplifications**:
  * 4 standardized crew members with uniform baseline metabolic parameters.
  * Neurological, renal, and gastrointestinal systems simplified to qualitative symptom flags.
* **Fidelity Justification**: Direct physiological coupling to ECLSS air quality and radiation exposure, giving flight controllers clear physiological stakes.

---

### 3.11 Compute Architecture Model — `MEDIUM FIDELITY`
* **Governing Equations**:
  * Power Consumption: $P_{compute} = P_{base} + \alpha_{AI} P_{AI}$ where $P_{AI} = 25\text{ W}$ active, $1\text{ W}$ gated.
  * Thermal Heat Coupling: $Q_{avionics} = \eta_{elec} P_{compute}$ injected directly into the avionics cold plate.
* **Fidelity Justification**: Enforces operational trade-offs between autonomous diagnostic capability and power/thermal constraints.

---

### 3.12 Scripted Phases: EDL, Surface, Ascent — `SCRIPTED`
* **Implementation**:
  * Finite State Machine driven by predefined mission milestone clocks.
  * Mars EDL Sequence:
    1. Atmospheric Entry Interface ($E-0$, altitude $125\text{ km}$, velocity $5.8\text{ km/s}$).
    2. Peak Heating & Deceleration ($E+80\text{ s}$, max g-force $8.5\text{ g}$).
    3. Parachute Mortar Deploy ($E+240\text{ s}$, Mach 1.8).
    4. Heat Shield Jettison ($E+260\text{ s}$).
    5. Terminal Descent Propulsion Ignition ($E+310\text{ s}$).
    6. Touchdown ($E+360\text{ s}$).
* **Fidelity Justification**: High-speed atmospheric entry requires multi-physics aerothermodynamic and hypersonic shockwave codes outside the scope of an interplanetary transit console. Scripted timelines maintain immersion and protocol accuracy.

---

### 3.13 AI Thermal Diagnostics — `HIGH FIDELITY`
* **Algorithm**:
  Supervised ensemble Random Forest classifier trained on 10,000 synthetic physics simulation fault runs (nominal, pump failure, coolant leak, radiator valve blockage, sensor drift).
* **Exact TreeSHAP Attribution**:
  Computes exact Shapley values across every tree leaf:
  $$\phi_i(x) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f(S \cup \{i\}) - f(S) \right]$$
  Guarantees efficiency property: $\sum_{i=1}^M \phi_i(x) = f(x) - E[f(x)]$.
* **Fidelity Justification**: Yields 100% mathematically verified, explainable attributions for every diagnostic classification without black-box neural network uncertainty.

---

### 3.14 Knowledge Graph & BM25 Search — `MEDIUM FIDELITY`
* **Implementation**:
  * Directed graph of subsystem components, failure propagation modes, and operational flight rules.
  * BM25 / TF-IDF inverted index for full-text lexical ranking over synthetic procedure manuals and emergency checklists.
* **Fidelity Justification**: Fast, offline retrieval of operational procedures without cloud dependencies or hallucinations.

---

### 3.15 Medical CDSS — `MEDIUM FIDELITY`
* **Implementation**:
  * R0 immutable clinical decision trees for emergency first-aid triage.
  * Naive Bayes classifier computing posterior symptom-disease probabilities ($P(D_k | S_1, \dots, S_n)$) over synthetic medical case histories.
* **Fidelity Justification**: Provides structured, probabilistic triage assistance for non-physician crew members during transit delays.

---

### 3.16 DTN Link Model & Priority Spool — `MEDIUM FIDELITY`
* **Implementation**:
  * RFC 5050 / RFC 9171 bundle framing with 4-tier priority queues.
  * CFDP-lite transaction engine with simulated packet error rate ($PER$) and negative acknowledgment (NAK) retransmission timers tuned to light-time latency.
* **Fidelity Justification**: Demonstrates authentic store-and-forward behavior during deep-space signal latencies and conjunction blackouts.

---

## 4. UI Representation & Fidelity Transparency

To ensure complete transparency during mission operations, all telemetry panels and status cards in AEGIS TRANSIT display their respective fidelity level:

* `[HIGH]`: Rendered in high-contrast emerald green (`--green: #00e676`).
* `[MEDIUM]`: Rendered in caution amber (`--amber: #ffab00`).
* `[SCRIPTED]`: Rendered in muted steel gray (`--text-secondary: #8899aa`).

By maintaining this visual transparency, operators are always informed regarding the exact mathematical precision behind every metric on screen.
