# AEGIS TRANSIT — Engineering Assumptions & Modeling Boundaries

> [!WARNING]
> **SIMULATION: NOT FLIGHT SOFTWARE**  
> This document catalogs all simplifying engineering assumptions, celestial mechanics approximations, and model idealizations utilized in AEGIS TRANSIT. No claims of flight heritage, space qualification, or flight certification are made or implied.

---

## 1. Introduction

Physics simulation in an interactive browser-based console requires a deliberate balance between computational fidelity, mathematical realism, real-time 60 FPS performance, and cognitive clarity for flight operations.

This document explicitly defines the boundaries, approximations, and design assumptions implemented across AEGIS TRANSIT. By making these assumptions transparent, operators and evaluators can clearly distinguish between modeled dynamics and out-of-scope physical phenomena.

---

## 2. Astrodynamics & Orbital Mechanics Assumptions

### 2.1 Coplanar Keplerian Orbits
* **Assumption**: Earth, Mars, and the interplanetary spacecraft are modeled in a shared two-dimensional ecliptic orbital plane ($i = 0^\circ$).
* **Rationale**: Eliminates non-planar out-of-ecliptic coordinate transformations without compromising fundamental orbital transfer principles (Hohmann transfer, Lambert targeting, synodic cycles, orbital phasing).
* **Impact**: Orbital inclination changes ($\Delta v$ plane-change maneuvers) are not modeled. Tactical orbital maps can be projected directly onto a 2D Cartesian plane ($X, Y$) aligned with the J2000 heliocentric ecliptic.

### 2.2 Standish (1992) Keplerian Elements
* **Assumption**: Planetary positions are computed from approximate mean Keplerian orbital elements referenced to the J2000.0 epoch, derived from E.M. Standish (1992) / JPL *Approximate Positions of the Planets*.
* **Rationale**: Standish equations provide closed-form planetary positions accurate to within a fraction of a percent over several centuries, without requiring multi-gigabyte numerical ephemeris lookup tables (such as JPL DE440/441).
* **Impact**: Position errors relative to real-world high-precision JPL DE440 ephemerides are $< 0.05\%$ over the simulated mission duration, which is imperceptible on tactical mission displays.

### 2.3 Patched Conics Trajectory Model
* **Assumption**: Spacecraft trajectory propagation uses the patched conics approximation rather than continuous N-body numerical integration (e.g., Runge-Kutta 8th order).
* **Rationale**: During heliocentric cruise, the Sun's gravity dominates overwhelmingly. Near Mars, the gravity of Mars dominates. Patched conics divides the transit into distinct two-body Keplerian segments (heliocentric cruise $\rightarrow$ hyperbolic Mars arrival), enabling closed-form universal-variable Kepler and Lambert solvers to run instantaneously at arbitrary simulation warp factors.
* **Impact**: Third-body perturbations (e.g., lunar perturbations during departure, Jovian resonance perturbations during cruise, and solar radiation pressure drift) are omitted.

### 2.4 Mars Sphere of Influence (SOI)
* **Assumption**: The Mars Sphere of Influence radius is modeled as a fixed boundary at $r_{SOI} \approx 5.7724 \times 10^8\text{ m}$ ($577,240\text{ km}$ or $\sim 0.00386\text{ AU}$).
* **Rationale**: Calculated using the standard Laplace criterion:
  $$r_{SOI} \approx a_{Mars} \left(\frac{M_{Mars}}{M_{Sun}}\right)^{2/5}$$
  where $a_{Mars} \approx 1.5237\text{ AU}$, $M_{Mars} \approx 6.4171 \times 10^{23}\text{ kg}$, and $M_{Sun} \approx 1.9885 \times 10^{30}\text{ kg}$.
* **Impact**: At the moment the spacecraft's relative distance to Mars falls below $r_{SOI}$, the FSW phase manager transitions the mission state from Cruise to Mars Orbit Insertion (MOI) prep, switching gravitational primary from the Sun to Mars.

### 2.5 Time Representation: Julian Date (JD)
* **Assumption**: The primary internal time standard is the continuous Julian Date (TDB-compatible day count relative to the J2000.0 epoch $JD = 2,451,545.0$), rather than UTC with leap seconds.
* **Rationale**: Astrodynamic equations, mean anomaly progressions, and Keplerian orbital solutions require a continuous, monotonic time scale free of discontinuous leap second step adjustments.
* **Impact**: A dedicated conversion utility formats the continuous Julian Date into user-facing Mission Elapsed Time (MET) and ISO-like UTC display strings for display panels.

### 2.6 Omission of Relativistic Corrections
* **Assumption**: General and Special Relativistic effects (time dilation, gravitational redshift, Shapiro delay, Schwarzschild perihelion precession) are not modeled.
* **Rationale**: Spacecraft transit velocities peak at approximately $30\text{--}40\text{ km/s}$ ($\beta = v/c \approx 10^{-4}$). Relativistic corrections introduce negligible variance ($\sim 10^{-8}$) over a 200-day transit.
* **Impact**: Newtonian mechanics and classical Maxwellian propagation of light in a vacuum ($c = 299,792,458\text{ m/s}$) govern all motions and communications.

### 2.7 Euclidean Distance Non-Negativity & Telemetry Quantization Bounding
* **Assumption**: Celestial and vehicle relative distances are Euclidean norms ($\|\vec{r}_1 - \vec{r}_2\| \ge 0$). Stochastic sensor noise and quantization models for range channels cannot produce negative distance reports.
* **Rationale**: Negative physical distance is physically non-realizable. Near-departure coordinates ($\sim 266\text{ km} \approx 1.7 \times 10^{-6}\text{ AU}$) with Gaussian sensor noise ($\sigma = 0.0005\text{ AU}$) would otherwise produce negative samples without physical bounding.
* **Impact**: Sensor outputs for distance channels are strictly clamped to $\ge 0$, and user-facing formatting follows a unified threshold ($< 0.01\text{ AU}$ displayed in kilometers, otherwise AU with 3 decimals).

---

## 3. Communications & Deep Space Networking Assumptions

### 3.1 Geometric Light-Time Delay
* **Assumption**: One-way light-time (OWLT) delay is calculated purely geometrically:
  $$\tau = \frac{|\mathbf{r}_{spacecraft} - \mathbf{r}_{earth}|}{c}$$
* **Rationale**: Provides exact physical latency for electromagnetic signal propagation across deep space without the overhead of ray-tracing through interplanetary plasma medium variations.
* **Impact**: Delay varies dynamically between approximately 3.1 minutes (at closest approach, 0.37 AU) and 22.2 minutes (at superior conjunction, 2.67 AU). Round-trip communication times (RTT) vary from 6.2 to 44.4 minutes.

### 3.2 Solar Exclusion Blackout Cone
* **Assumption**: A communication blackout occurs whenever the Earth-Sun-Probe angle $\theta$ (the angular separation between the spacecraft and the center of the Sun as viewed from Earth) drops below $2.0^\circ$. This threshold is configurable in simulation constants (`BLACKOUT_THETA_DEG = 2.0`).
* **Rationale**: During solar conjunction, the radio signal path passes directly through the dense solar corona. Intense coronal plasma scintillations, Faraday rotation, and thermal solar noise degrade the signal-to-noise ratio below receiver lock thresholds across S-band, X-band, and Ka-band frequencies.
* **Impact**: When $\theta \le 2.0^\circ$, all real-time communication terminates. Telemetry and science data are automatically rerouted to the DTN persistent priority spool until the geometric blackout clears.

### 3.3 Illustrative RF Link Budget
* **Assumption**: The communication link budget is parameterized as an illustrative baseline:
  * Downlink bit rate: $500\text{ kbps}$ at $1.0\text{ AU}$
  * Uplink bit rate: $100\text{ kbps}$ at $1.0\text{ AU}$
  * Distance attenuation: bit rate scales as $1/r^2$, where $r$ is the Earth-spacecraft distance in AU.
* **Rationale**: Reflects realistic deep-space telemetry throughput capabilities (e.g., Deep Space Network 34m/70m beamforming with a $3\text{m}$ spacecraft high-gain parabolic antenna) without requiring full RF antenna temperature, atmospheric rain fade, or polarization loss modeling.
* **Impact**: At maximum transit separation ($2.5\text{ AU}$), downlink bandwidth gracefully degrades to $\sim 80\text{ kbps}$, demonstrating the necessity of DTN priority queuing.

### 3.4 IndexedDB Persistent Spool
* **Assumption**: Browser-native IndexedDB is used to emulate non-volatile radiation-hardened NAND flash memory for the spacecraft's DTN bundle spool and the immutable flight recorder.
* **Rationale**: IndexedDB offers asynchronous, transactional, high-capacity client-side persistence that persists across browser sessions, page reloads, and crash recoveries without network storage.
* **Impact**: DTN bundles and audit log records remain intact if the user refreshes or reopens the mission console.

---

## 4. Subsystem & Environmental Assumptions

### 4.1 Radiation Environment Based on MSL RAD Empirical Data
* **Assumption**: Radiation dose rates are parameterized directly from published NASA Mars Science Laboratory (MSL) Radiation Assessment Detector (RAD) measurements:
  * Baseline Cruise GCR (Galactic Cosmic Ray) dose rate: $1.8\text{ mSv/day}$
  * Surface Mars dose rate: $0.64\text{ mSv/day}$
* **Rationale**: Provides grounded empirical benchmarks derived from actual transit measurements taken by MSL/Curiosity during its 2011–2012 interplanetary cruise.
* **Impact**: Solar Particle Events (SPE) can be injected as acute stochastic spikes ($50\text{--}500\text{ mSv/hr}$). The spacecraft storm shelter models a protective attenuation factor ($90\%$ reduction in acute proton dose).

### 4.2 Crew Physiology & Metabolic Demands
* **Assumption**: The simulated transit crew consists of 4 adult astronauts with standardized metabolic profiles:
  * $O_2$ consumption: $0.84\text{ kg/day}$ per person ($3.36\text{ kg/day}$ total)
  * $CO_2$ production: $1.00\text{ kg/day}$ per person ($4.00\text{ kg/day}$ total)
  * Simplified physiological response: Blood oxygen saturation ($SpO_2$) follows a standard Hill-equation sigmoid curve as a function of cabin oxygen partial pressure ($pO_2$). Heart rate increases compensatorily as $SpO_2$ degrades.
* **Rationale**: Standard NASA human spaceflight metabolic design baselines (NASA-STD-3001) allow accurate mass-balance tracking in the ECLSS subsystem without modeling individual renal, circulatory, or endocrine micro-states.
* **Impact**: If cabin $pO_2$ drops below $16.0\text{ kPa}$, crew hypoxia alarms trigger, and physiological telemetry shows acute distress.

### 4.3 Thermal Architecture: First-Order Lumped ODEs
* **Assumption**: Thermal nodes (internal cabin, avionics cold plates, external radiators) are modeled as lumped thermal masses governed by first-order ordinary differential equations:
  $$C \frac{dT}{dt} = Q_{gen} + Q_{sun} - Q_{rad}$$
  Radiative dissipation follows the Stefan-Boltzmann law ($Q_{rad} = \epsilon \sigma A T^4$).
* **Rationale**: Preserves core thermodynamic behaviors (thermal inertia, equilibrium temperatures, radiator bypass cooling) while remaining computationally lightweight enough to integrate at high simulation warp speeds (up to 600x).
* **Impact**: Fluid hydrodynamic Navier-Stokes equations and turbulent flow convective modeling inside the coolant loops are omitted; coolant loops are modeled via mass-flow rate heat transport.

### 4.4 Electrical Power Subsystem (EPS)
* **Assumption**: Solar array power generation scales strictly with the inverse square of the heliocentric distance ($1/r_{sun}^2$) assuming continuous Sun-tracking gimbal orientation:
  $$P_{solar} = P_0 \times \eta \times A \times \frac{1361\text{ W/m}^2}{r^2}$$
* **Rationale**: Reflects solar flux dilution as the spacecraft moves from Earth ($1.0\text{ AU}$, $\sim 1361\text{ W/m}^2$) to Mars ($1.524\text{ AU}$, $\sim 586\text{ W/m}^2$).
* **Impact**: Demonstrates significant power degradation during cruise, forcing power budgeting and prioritizing life-critical systems over auxiliary compute loads.

### 4.5 Compute Architecture Coupling
* **Assumption**: The Tier 2 AI accelerator hardware is modeled as an avionics subsystem node with two distinct operational power/thermal states:
  * Active compute: $25\text{ W}$ continuous electrical draw and equivalent thermal heat injection.
  * Gated / idle compute: $1\text{ W}$ standby draw.
* **Rationale**: Captures the operational trade-offs of running autonomous AI models during power-constrained or thermally degraded contingency states.
* **Impact**: If avionics cooling fails or battery depth-of-discharge exceeds limits, Tier 0 FDIR can power-gate Tier 2 compute to protect vehicle survival.

### 4.6 Single-Fault Tolerance (SFT) Redundancy
* **Assumption**: All safety-critical subsystems (coolant pumps, cabin circulation fans, GNC attitude sensors, power distribution channels) are assumed to have dual-redundant (Channel A / Channel B) architecture.
* **Rationale**: Conforms to standard NASA human-rating safety requirements (NPR 8705.2) ensuring that a single component failure does not cause loss of crew or mission.
* **Impact**: Fault injection triggers automatic FDIR channel cross-strapping and switches redundant hardware without catastrophic loss.

---

## 5. Mission Phases & Execution Fidelity

### 5.1 Scripted Operational Phases (EDL, Surface, Ascent)
* **Assumption**: High-dynamic atmospheric and surface phases (Mars Entry, Descent, and Landing [EDL], Surface Operations, and Mars Ascent) are driven by deterministic, state-machine scripted timelines rather than real-time physical CFD or terrain models.
* **Rationale**: AEGIS TRANSIT is an interplanetary transit console. Modeling supersonic retro-propulsion, turbulent atmospheric entry hypersonics, Martian dust storm dynamics, and 3D terrain hazard avoidance would require dedicated external simulation clusters that exceed browser scope.
* **Impact**: During EDL, the console displays an accurate timeline sequence (atmospheric entry interface, parachute mortar fire, heat shield jettison, radar altimeter lock, sky-crane/terminal descent) with pre-computed telemetry curves and milestone status indicators.

---

## 6. AI, Autonomy & Clinical Assumptions

### 6.1 Explainable Random Forest for Diagnostics
* **Assumption**: Thermal and subsystem diagnostics utilize an ensemble Random Forest classifier paired with exact TreeSHAP (Shapley Additive exPlanations) attribution, rather than deep neural networks (DNNs) or Large Language Models (LLMs).
* **Rationale**:
  * **Zero Hallucination**: Random Forest decision boundaries are deterministic and auditable.
  * **Explainability**: TreeSHAP computes the exact mathematical contribution of every sensor feature to the diagnostic conclusion in milliseconds.
  * **Offline Execution**: Fully contained in a tiny pre-trained weight matrix loaded into the Web Worker, requiring no cloud API tokens or external runtime dependencies.
* **Impact**: When the AI flags an anomalous coolant loop leak, it displays the exact sensor features (e.g., *Pressure Loop 1 drop: +42% attribution; Flow Rate drop: +38% attribution*) that led to the classification.

### 6.2 All Medical Content is SYNTHETIC
* **Assumption**: All clinical guidelines, diagnostic differential trees, pharmaceutical dosages, and medical procedures in the Clinical Decision Support System (CDSS) are labeled **`SYNTHETIC`** and represent simplified expeditionary first-aid protocols.
* **Rationale**: To prevent any confusion with actual clinical medical guidelines or real-world emergency care.
* **Impact**: Provides realistic interface interactions for crew medical contingencies (e.g., decompression sickness, radiation sickness, acute trauma) while maintaining a strict disclaimer boundary.

### 6.3 Self-Generated Synthetic Training Data
* **Assumption**: All training data for the diagnostic AI models is generated by running the physics simulation core across an exhaustive matrix of seeded nominal and faulted state injections.
* **Rationale**: Real-world flight telemetry for crewed Mars transit does not exist. Using the physics engine itself to generate synthetic training datasets guarantees 100% domain alignment and verified ground truth labels.
* **Impact**: The diagnostic models are purpose-built to recognize the specific mechanical, thermal, and sensor fault signatures modeled by the simulator.

### 6.4 Standardized 6-Feature Thermal Vector & Exact TreeSHAP Coalition Evaluation
* **Assumption**: The thermal subsystem state is parameterized by 6 physical telemetry features: coolant mass flow rate ($kg/s$), pump differential pressure ($kPa$), pump rotation speed ($RPM$), radiator outlet temperature ($K$), radiator inlet temperature ($K$), and fluid accumulator level fraction ($[0, 1]$).
* **Rationale**: Restricting the diagnostic vector to 6 physically observable state variables allows exact Shapley coalition evaluation across all $2^6 = 64$ sub-coalitions, guaranteeing $O(1)$ sub-millisecond TreeSHAP computation without Monte Carlo sampling approximations.
* **Impact**: The Shapley additivity efficiency identity ($\sum_{i=1}^M \phi_i = f(x) - \mathbb{E}[f(x)]$) holds with floating-point precision error $< 10^{-15}$ (strictly below the $10^{-6}$ verification threshold). During nominal cruise, the console suppresses attribution bars to prevent telemetry clutter, showing a monitoring card with an explicit operator override ("Explain current state").

---

## 7. User Interface & Hardware Assumptions

### 7.1 Display Resolution & Responsive Breakpoint
* **Assumption**: The mission console is designed primarily for a target desktop workspace resolution of **1440x900 pixels**, with graceful responsive degradation down to **1100px width**.
* **Rationale**: Matches standard aerospace mission workstation displays and modern widescreen laptops.
* **Impact**: Below 1100px width, secondary side panels collapse into toggleable drawers to maintain high visual clarity on the tactical orbital plot and primary telemetry cards.

### 7.2 Demonstration Cryptographic Keys
* **Assumption**: Cryptographic signatures for commands and the SHA-256 hash-chained flight recorder utilize ephemeral ECDSA / HMAC key pairs generated locally in the browser upon initialization.
* **Rationale**: Demonstrates tamper-evident audit logging, cryptographic command signing, and authorization gates without requiring external hardware security modules (HSM) or corporate Public Key Infrastructure (PKI).
* **Impact**: All audit logs are cryptographically verifiable within the running session, proving that the flight recorder cannot be silently altered.

---

## 8. Summary Matrix of Assumptions

| Domain | Key Assumption | Real-World Delta |
|---|---|---|
| **Orbits** | Coplanar ($i=0^\circ$) Keplerian 2-body | Out-of-plane plane-change $\Delta v$ not modeled |
| **Ephemeris** | Standish (1992) mean elements | $<0.05\%$ deviation from JPL DE440 |
| **Trajectory** | Patched conics with universal variables | Omits 3rd-body gravity and solar radiation pressure |
| **Mars SOI** | Fixed boundary at $5.7724 \times 10^8\text{ m}$ | Neglects non-spherical gravitational harmonics |
| **Blackout** | Solar exclusion angle $\theta \le 2.0^\circ$ | Fixed angle threshold vs. dynamic frequency SNR curves |
| **Link Budget** | $500\text{ kbps} / 100\text{ kbps}$ @ 1 AU ($1/r^2$) | Omits atmospheric weather and antenna pointing jitter |
| **Radiation** | Baseline $1.8\text{ mSv/day}$ (MSL RAD) | Constant background rate vs. solar cycle modulation |
| **ECLSS** | 4-crew Dalton partial pressure balance | Standardized metabolic rates vs. individualized metabolic variance |
| **Thermal** | First-order lumped ODEs | Omits Navier-Stokes 3D convective flow fields |
| **EDL / Surface** | Scripted deterministic FSM | Omits hypersonic aerodynamics and landing radar terrain scatter |
| **AI Diagnostics** | Random Forest with TreeSHAP | Interpretable tabular ML vs. black-box neural networks |
| **Medical CDSS** | Synthetic first-aid triage trees | Educational/demonstration triage vs. certified clinical protocols |
| **Security** | In-browser ephemeral ECDSA keys | Ephemeral session keys vs. hardware security modules (HSM) |
