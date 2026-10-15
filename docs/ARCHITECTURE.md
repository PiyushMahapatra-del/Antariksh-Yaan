# AEGIS TRANSIT — System Architecture

> [!WARNING]
> **SIMULATION: NOT FLIGHT SOFTWARE**  
> This software is an engineering simulation and interactive technology demonstration console. No claims of flight heritage, space qualification, or flight certification are made or implied. All orbital parameters, telemetry values, system diagnostics, and operational procedures are simulated for research, education, and interface demonstration purposes only.

---

## 1. System Overview

**AEGIS TRANSIT** is a single-page web application (SPA) that serves as a physics-driven mission console for crewed interplanetary transit between Earth and Mars. Designed with mission-control aesthetic conventions, it provides flight controllers and astronauts with real-time astrodynamics, subsystem health monitoring, delay-tolerant communications, and an autonomous AI decision-support copilot.

```
+-----------------------------------------------------------------------------------------+
|                                  AEGIS TRANSIT CONSOLE                                  |
|                                                                                         |
|  +--------------------+  +-------------------------------------+  +------------------+  |
|  |    SUBSYSTEMS      |  |         TACTICAL ORBITAL MAP        |  |   AI ASSISTANT   |  |
|  | - Thermal Loops    |  |  (Canvas 2D Heliocentric Plot)      |  | - Diagnostics    |  |
|  | - ECLSS Life Supp  |  |  (Three.js Celestial Background)    |  | - TreeSHAP Exp   |  |
|  | - EPS Solar/Batt   |  |  (Trajectory Conics & Mars SOI)     |  | - Knowledge Base |  |
|  | - GNC & Propulsion |  +-------------------------------------+  | - Medical CDSS   |  |
|  | - Radiation / Crew |  |            HUD OVERLAY              |  +------------------+  |
|  +--------------------+  +-------------------------------------+  |   SAFETY GATE    |  |
|  |    MISSION CLOCK   |  |        COMMUNICATION / DTN          |  |  (Two-Stage Arm) |  |
|  |  JD 2460000.0 (TMI)|  |  Light-time delay / Priority Spool  |  |   [EXECUTE]      |  |
|  +--------------------+  +-------------------------------------+  +------------------+  |
|  +-----------------------------------------------------------------------------------+  |
|  |                     FLIGHT RECORDER (Hash-Chained Audit Log)                      |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

### 1.1 Core Engineering Principles

1. **Deterministic Physics Simulation Core**: Every telemetry value, status indicator, and graph trace on screen derives directly from the underlying mathematical simulation state. There are no synthetic animations or hardcoded random flickers.
2. **Reproducibility via Seeded PRNG**: All stochastic phenomena (sensor noise, cold-gas thruster jitter, solar particle events, component degradations) are driven by a deterministic Mulberry32 pseudo-random number generator (`src/sim/rng.ts`). Given an initial seed, mission runs are 100% reproducible.
3. **Strict Offline Execution**: The console executes 100% locally in the browser with zero external runtime network requests (`fetch`, `XMLHttpRequest`, or WebSockets are forbidden and blocked via ESLint).
4. **Propose-Only Autonomy (Safety Gate)**: Artificial Intelligence models operate strictly in advisory mode. The AI subsystem runs in an isolated Web Worker, lacks execution privileges, and can only generate formal command proposals. Only human flight controllers or deterministic Tier 0 safety software acting through the **Safety Gate** can commit actuations to the simulated spacecraft.
5. **Clear Provenance of Synthetic Data**: All training sets, medical decision trees, reference procedures, and knowledge graphs are explicitly tagged as **`SYNTHETIC`**.
6. **No Trademarks or Flight Agency Emblems**: The console uses clean, unbranded aerospace iconography and typography.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Language** | **TypeScript 5.6+** | Strict mode enabled (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`). Ensures end-to-end type safety between simulation state, event buses, and UI views. |
| **Bundler & Tooling** | **Vite 6** | Ultra-fast HMR, optimized production tree-shaking, native ES modules, and seamless Web Worker bundling. |
| **Testing** | **Vitest 2.1+** | Unit, regression, and subsystem integration testing with native TypeScript execution and benchmark capabilities. |
| **Linting & Rules** | **ESLint 8.57+** | Custom boundary rules enforcing flight software isolation (`import/no-restricted-paths`) and zero runtime networking (`no-restricted-globals`). |
| **3D Celestial Render** | **Three.js 0.170+** | Renders the celestial sphere, background starfield, Earth, Mars, Sun, and spacecraft body with high-precision orbital transformations. |
| **Tactical 2D Display** | **HTML5 Canvas 2D** | High-performance, 60 FPS drawing of heliocentric orbital paths, patched conics, transfer trajectories, planetary spheres of influence, and communication vectors. |
| **UI Panels & HUD** | **Vanilla DOM & CSS** | Pure DOM with CSS Grid/Flexbox and custom CSS properties. Eliminates framework overhead (no React/Vue/Angular), delivering rock-solid 60 FPS performance and zero UI state lag. |
| **Concurrency** | **Web Workers** | AI diagnostics, Random Forest inference, Shapley value computations, and BM25 knowledge retrieval are offloaded to a dedicated Web Worker thread. |
| **Local Persistence** | **IndexedDB** | Non-volatile browser storage for the Deep Space Network priority bundle spool and the tamper-evident hash-chained flight recorder. |

---

## 3. Directory & Module Structure

The project codebase follows a modular aerospace architecture that strictly separates simulation physics, flight software, user interface, and autonomous decision support:

```
c:\Users\hp\Downloads\hackathon project\
├── data/                      # Offline synthetic reference data
│   ├── case-base/             # Historical synthetic mission anomalies
│   ├── formulary/             # Synthetic pharmaceutical database
│   ├── knowledge-graph/       # Subsystem dependency and failure graph
│   └── medical-trees/         # Emergency medical decision trees
├── docs/                      # Engineering and architecture documentation
│   ├── ARCHITECTURE.md        # Comprehensive system design specification
│   ├── ASSUMPTIONS.md         # Physical and operational assumptions
│   ├── FIDELITY.md            # Subsystem fidelity matrix and mathematical models
│   └── TEST_REPORT.md         # Verification & validation milestone report
├── src/
│   ├── ai/                    # AI Autonomy Stack (Runs in Web Worker)
│   │   ├── cdss/              # Clinical Decision Support System (Naive Bayes + Trees)
│   │   ├── diagnostics/       # Random Forest classifier + TreeSHAP attribution
│   │   ├── gateway/           # Worker RPC interface, message contracts, schema validation
│   │   ├── kg/                # Knowledge graph traversal and BM25 document search
│   │   └── ai.worker.ts       # AI Web Worker entry point
│   ├── core/                  # Shared Infrastructure
│   │   ├── event-bus.ts       # Typed pub/sub event bus
│   │   ├── store.ts           # Reactive store and RingBuffer circular telemetry
│   │   └── types/             # Common domain types, packet formats, telemetry schema
│   ├── dtn/                   # Delay-Tolerant Networking Engine
│   │   ├── bundle.ts          # RFC 5050/9171-inspired bundle protocol parser/builder
│   │   ├── cfdp.ts            # Simplified CCSDS File Delivery Protocol
│   │   ├── link.ts            # RF link budget, geometric delay, and blackout model
│   │   └── spool.ts           # IndexedDB persistent bundle priority spool
│   ├── fsw/                   # Tier 0 Deterministic Flight Software
│   │   ├── fdir/              # Fault Detection, Isolation, and Recovery logic
│   │   ├── logger/            # SHA-256 hash-chained immutable flight recorder
│   │   ├── phase/             # Mission phase manager (TMI, Cruise, MOI, EDL, etc.)
│   │   ├── safety/            # Actuator Safety Gate and interlock validator
│   │   └── watchdog/          # Deterministic software health and timing monitor
│   ├── render/                # Visualization Engine
│   │   ├── hud/               # Flight trajectory overlays, reticles, vector indicators
│   │   ├── sky/               # Three.js 3D celestial skybox and planetary meshes
│   │   └── tactical/          # Canvas 2D heliocentric orbital tactical map
│   ├── sim/                   # Physics Simulation Core
│   │   ├── clock.ts           # Master mission clock, time-warp, and Julian Date
│   │   ├── constants.ts       # Physical constants, planetary elements (Standish 1992)
│   │   ├── ephemeris.ts       # Keplerian planetary position calculations
│   │   ├── faults/            # Fault injection engine for anomalous scenarios
│   │   ├── mechanics/         # Kepler solver, Lambert targeter, orbital propagation
│   │   ├── rng.ts             # Mulberry32 seeded pseudo-random number generator
│   │   ├── sensors/           # Sensor models, noise injection, quantization, bias
│   │   └── subsystems/        # Thermal, ECLSS, Power, GNC, Radiation, Crew, Compute
│   ├── ui/                    # Presentation Layer (Vanilla DOM & CSS)
│   │   ├── components/        # Telemetry cards, sparklines, annunciator lights
│   │   ├── panels/            # Subsystem panels, DTN console, CDSS, AI terminal
│   │   └── styles/            # Mission console styles, CSS grid, color variables
│   └── main.ts                # Application bootstrapper and lifecycle manager
├── index.html                 # Single-page console host HTML
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript strict configuration
└── vite.config.ts             # Vite configuration
```

### 3.1 Module Descriptions

* **`src/sim` (Physics Simulation Core)**: The single source of truth for the physical world. Integrates ordinary differential equations (ODEs) for thermal loops, computes partial gas pressures in ECLSS, models solar flux and battery state-of-charge, solves two-body Kepler and Lambert orbital mechanics, calculates radiation dosage from GCR and SPEs, and models crew metabolic consumption. Raw state is passed through sensor models that add noise, quantization, and potential sensor failures before reaching the console.
* **`src/render` (Visual System)**: Dual-layer visual rendering. A Three.js WebGL canvas provides high-fidelity 3D spacecraft attitude and celestial viewpoints. A dedicated Canvas 2D engine renders the top-down heliocentric tactical map with planetary orbits, the transfer ellipse, communication vectors, and the Mars Sphere of Influence (SOI).
* **`src/fsw` (Tier 0 Flight Software)**: Deterministic, safety-critical software. Implements classical limit checking, automated emergency safe-mode sequences, phase state transitions, the command safety gate, and the SHA-256 hash-chained event logger. **This module is strictly isolated and can never import from `src/ai`.**
* **`src/ai` (AI Autonomy Stack)**: Operates inside a background Web Worker. Analyzes telemetry snapshots, computes feature importance via TreeSHAP, classifies thermal system anomalies using an embedded Random Forest, queries synthetic flight manuals via BM25, and provides first-aid clinical decision support. AI outputs are advisory proposals only.
* **`src/dtn` (Deep-Space Data Transfer Network)**: Models delay-tolerant communication between Earth and the transit spacecraft. Calculates dynamic geometric light-time delay ($\Delta t = r/c$), detects solar conjunction blackout zones ($\theta < 2^\circ$), enforces distance-based link attenuation ($1/r^2$), and manages persistent bundle priority queues in IndexedDB.
* **`src/ui` (UI Panels and HUD)**: High-density mission console constructed using clean, semantic DOM elements and CSS Grid. Organized into Top Bar (mission clock, master caution/warning, warp controls), Left Panel (subsystem telemetry, sensor readings, sparklines), Center View (tactical orbital map and 3D celestial sky), Right Panel (AI assistant terminal, diagnostic explanations, safety gate execution), and Bottom Panel (DTN link status, comm log, flight recorder).
* **`src/core` (Shared Infrastructure)**: Contains the type-safe pub/sub event bus (`event-bus.ts`), the reactive state store (`store.ts`), and common TypeScript interfaces.
* **`data/` (Synthetic Knowledge & Clinical Assets)**: Offline synthetic repositories including decision trees, system failure modes, flight rules, and emergency medical protocols.

---

## 4. Safety Architecture

AEGIS TRANSIT enforces safety through strict functional partitioning, deterministic validation gates, and compile-time import boundaries.

```
+-----------------------------------------------------------------------------------------+
|                                    SAFETY ARCHITECTURE                                  |
|                                                                                         |
|   +---------------------------------------+       +---------------------------------+   |
|   |          TIER 1 & TIER 2 AI           |       |      HUMAN FLIGHT CONTROLLER    |   |
|   |         (Isolated Web Worker)         |       |         (Mission Console)       |   |
|   |                                       |       |                                 |   |
|   |  - Random Forest Diagnostics          |       |  - Evaluates situation          |   |
|   |  - TreeSHAP Feature Attributions      |       |  - Reviews AI proposal          |   |
|   |  - BM25 Flight Manual Search          |       |  - Reviews predicted impacts    |   |
|   |  - Medical CDSS Differential          |       |                                 |   |
|   +---------------------------------------+       +---------------------------------+   |
|                       |                                            |                    |
|             Proposes Action (JSON)                         Operator Authorizes          |
|                       v                                            v                    |
|   +---------------------------------------------------------------------------------+   |
|   |                        TIER 0 SAFETY GATE (src/fsw/safety)                      |   |
|   |                                                                                 |   |
|   |  [Schema Validation] -> [Flight Rule Invariants] -> [Interlock Verification]   |   |
|   |                                                                                 |   |
|   |  * PASS: Forward command to Actuator Controller                                 |   |
|   |  * FAIL: Reject command, alert crew, log violation to R1 Hash Chain            |   |
|   +---------------------------------------------------------------------------------+   |
|                                            |                                            |
|                                    Authorized Commands                                  |
|                                            v                                            |
|   +---------------------------------------------------------------------------------+   |
|   |                 SIMULATED HARDWARE ACTUATORS (src/sim/subsystems)               |   |
|   |                                                                                 |   |
|   |  - Coolant Loop Bypass Valves        - RCS Thruster Firings                     |   |
|   |  - ECLSS O2/N2 Injection Valves      - Main Propulsion Burns                    |   |
|   |  - Electrical Bus Relays             - Storm Shelter Shield Deployment          |   |
|   +---------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------+
```

### 4.1 The Three-Tier Autonomy Model

1. **Tier 0: Deterministic Flight Software (FSW)**
   * **Domain**: Real-time safety loops, FDIR, limit violations, safe-mode commanding, actuator execution.
   * **Characteristics**: Deterministic, zero machine-learning dependencies, 100% test branch coverage, fixed execution time.
   * **Authority**: Has direct write access to actuators and simulation controls. Executes autonomously for time-critical survival actions (e.g., automated battery load shedding or overpressure venting).
2. **Tier 1: Diagnostic AI**
   * **Domain**: Subsystem anomaly detection, sensor drift isolation, predictive failure modeling, explainability.
   * **Characteristics**: Supervised Random Forest running in a Web Worker, exact TreeSHAP attribution.
   * **Authority**: **Advisory only**. Cannot modify system state. Produces structured anomaly reports and candidate recovery procedures.
3. **Tier 2: Assistant AI**
   * **Domain**: Flight manual retrieval (BM25), procedure step-by-step guidance, medical clinical decision support (CDSS), communication schedule planning.
   * **Characteristics**: Semantic knowledge graphs, naive Bayes differential diagnosis, natural language synthesis.
   * **Authority**: **Advisory only**. Presents recommendations and guidance checklists to human operators.

### 4.2 Web Worker AI Isolation & Gateway API

The AI subsystem operates in a sandboxed Web Worker thread (`src/ai/ai.worker.ts`), completely decoupled from the main UI and simulation threads:
* **No DOM Access**: The worker cannot access the document, window, or UI elements.
* **No Direct Store Access**: The worker cannot mutate the simulation store. It receives immutable telemetry snapshots via structured clone messages.
* **Gateway API Protocol**: All inter-thread communication passes through a strongly typed RPC gateway (`src/ai/gateway/`).
* **Runtime Schema Validation**: Every proposal emitted by the AI is validated against rigid schemas. Proposals violating field constraints, type definitions, or range boundaries are discarded immediately.

### 4.3 The Safety Gate: The Sole Path to Actuators

The **Safety Gate** (`src/fsw/safety/safety-gate.ts`) is the mandatory checkpoint for all non-autonomous system modifications:
* **Dual-Action Requirement (Arm & Execute)**: Critical commands (engine burns, valve reconfigurations, bus isolation) require a two-stage manual confirmation by the human operator.
* **Invariant Checking**: The Safety Gate evaluates proposed commands against physical safety invariants (e.g., *never close both coolant loops simultaneously*, *never fire RCS thrusters during main engine burn*, *never depressurize cabin below 55 kPa*).
* **Tamper-Evident Rejection**: If an AI proposal or operator command violates an invariant, the Safety Gate blocks execution, raises a Master Caution warning, and writes a cryptographic record to the flight log.

### 4.4 Architectural Enforcement via ESLint

To prevent architectural drift and guarantee that Tier 0 FSW never relies on AI code, strict import boundary rules are enforced at compile time via ESLint (`.eslintrc.json`):

```json
"import/no-restricted-paths": [
  "error",
  {
    "zones": [
      {
        "target": "./src/fsw/**",
        "from": "./src/ai/**",
        "message": "SAFETY: Tier 0 flight software (src/fsw) must NEVER import from AI module (src/ai). AI can only propose through the safety gate."
      },
      {
        "target": "./src/sim/**",
        "from": "./src/ai/**",
        "message": "SAFETY: Simulation core (src/sim) must not import from AI module (src/ai)."
      }
    ]
  }
]
```

Any attempt to import from `src/ai` inside `src/fsw` or `src/sim` immediately fails the build.

---

## 5. Memory Hierarchy

AEGIS TRANSIT implements a partitioned, multi-level memory hierarchy designed to mimic high-reliability aerospace avionics architectures:

```
+-----------------------------------------------------------------------------------------+
|                                    MEMORY HIERARCHY                                     |
|                                                                                         |
|  +--------------------+---------------------------------------------------------------+ |
|  | Region             | Description & Access Constraints                              | |
|  +--------------------+---------------------------------------------------------------+ |
|  | R0 (Golden ROM)    | Immutable constants, physical invariants, planetary orbital   | |
|  |                    | elements, hardcoded safety gate limits, cryptographic keys.   | |
|  |                    | -> Read-only at all times. Hardcoded in TypeScript.           | |
|  +--------------------+---------------------------------------------------------------+ |
|  | R1 (Audit Storage) | Cryptographic hash-chained mission log, historical telemetry, | |
|  |                    | command audit trail, safety gate verdicts.                    | |
|  |                    | -> Append-only. Backed by persistent browser IndexedDB.       | |
|  +--------------------+---------------------------------------------------------------+ |
|  | LIB (Signed Lib)   | Pre-trained Random Forest model weights, synthetic flight    | |
|  |                    | rules, medical triage trees, knowledge graph nodes.           | |
|  |                    | -> Read-only at runtime. Verified against SHA-256 checksums.  | |
|  +--------------------+---------------------------------------------------------------+ |
|  | R2 (Working Set)   | Phase-specific working memory (Ping-Pong A/B buffers). Active | |
|  |                    | burn trajectory solutions, Lambert vectors, CDSS differential.| |
|  |                    | -> Read/Write. Swapped cleanly between mission phases.        | |
|  +--------------------+---------------------------------------------------------------+ |
|  | R3 (Scratchpad)    | High-frequency circular buffers (RingBuffer), telemetry       | |
|  |                    | sparklines, transient canvas render frames, worker buffers.   | |
|  |                    | -> Ephemeral. Bounded capacity, zero GC pressure.             | |
|  +--------------------+---------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------+
```

1. **R0 (Golden Read-Only Memory)**: Contains unalterable system constants: universal gravitational constants, Earth/Mars planetary elements from Standish (1992), minimum physiological life limits ($pO_2 > 16.0\text{ kPa}$), and actuator physical limits. R0 cannot be modified by any subsystem, operator command, or software update.
2. **R1 (Persistent Append-Only Log)**: Every significant state transition, fault injection, operator action, AI proposal, and safety gate decision is logged into an immutable SHA-256 hash-chained block sequence. This audit trail is saved to IndexedDB to survive page reloads and browser restarts.
3. **LIB (Signed Reference Library)**: Houses synthetic documentation, emergency procedure manuals, the pharmaceutical formulary, and the Random Forest model weight matrices. Each library asset has an associated SHA-256 integrity hash that is verified at application boot.
4. **R2 (Phase Working Set A/B)**: Implements dual-buffered working memory. When the spacecraft transitions phases (e.g., from Cruise to Mars Orbit Insertion), the inactive buffer (B) is loaded with phase-specific guidance targets, sensor thresholds, and state models, and atomically swapped into active status (A) upon confirmation.
5. **R3 (Scratch Memory)**: Fixed-size circular ring buffers (`RingBuffer<T>` in `src/core/store.ts`) that store the latest 120–300 data points for UI sparklines and real-time telemetry gauges. Old values are overwritten in $O(1)$ time without memory allocations, eliminating browser garbage-collection stutter.

---

## 6. Deep-Space Communications & DTN

Interplanetary distances between Earth and Mars vary from ~55 million kilometers (0.37 AU) to over 400 million kilometers (2.67 AU), resulting in one-way light-time delays ranging from 3.1 to 22.2 minutes (round-trip delays of 6.2 to 44.4 minutes).

```
                      ONE-WAY LIGHT TIME: 3.1 min to 22.2 min
EARTH MISSION                                                        MARS TRANSIT
   CONTROL                                                             SPACECRAFT
+-----------+       +-------------------+       +-------------------+  +-----------+
| Earth DTN | <---> | Delay / RF Model  | <---> | Priority Spool    |  | FSW & UI  |
| Terminal  |       | - 1/r^2 Path Loss |       | - Critical (Q0)   |  | Console   |
+-----------+       | - Solar Blackout  |       | - Telemetry (Q1)  |  +-----------+
                    |   (theta < 2 deg) |       | - Science (Q2)    |
                    +-------------------+       | - Bulk (Q3)       |
                                                +-------------------+
```

### 6.1 DTN Protocol Architecture

AEGIS TRANSIT incorporates a delay-tolerant networking architecture based on CCSDS and RFC 5050 / RFC 9171 standards:
* **Bundle Protocol**: Data is packaged into self-contained "bundles" comprising header metadata (bundle ID, source, destination, priority, creation timestamp, time-to-live) and payload blocks.
* **Persistent Priority Spool (`src/dtn/spool.ts`)**: When the communication link is degraded, saturated, or severed by solar conjunction, bundles are stored in an IndexedDB backing queue prioritized across four queues:
  * **Queue 0 (Critical)**: Emergency distress beacons, FDIR critical safe-mode notices, life-support alarms.
  * **Queue 1 (Telemetry)**: Routine subsystem health metrics, attitude state vectors, power logs.
  * **Queue 2 (Science)**: Radiation spectrometer logs, solar flux surveys, imaging payloads.
  * **Queue 3 (Bulk)**: Flight manual updates, crew personal messages, non-urgent data transfers.
* **CFDP-Lite (`src/dtn/cfdp.ts`)**: A simplified implementation of the CCSDS File Delivery Protocol supporting Class 1 (unacknowledged) and Class 2 (reliable acknowledged with Negative Acknowledgment [NAK] retransmission) transfers over long light-time delays.
* **RF Link & Conjunction Blackout (`src/dtn/link.ts`)**:
  * Downlink bandwidth scales with the inverse square of distance:
    $$\text{Rate}(r) = \text{Rate}_{1\text{AU}} \times \left(\frac{1.0\text{ AU}}{r}\right)^2$$
    Nominal values: 500 kbps downlink and 100 kbps uplink at 1.0 AU.
  * **Solar Conjunction Blackout**: When the angular separation $\theta$ between the Earth-spacecraft vector and Earth-Sun vector falls below $2.0^\circ$, high solar coronal plasma noise causes a complete RF blackout. All transmission halts and data spools automatically to persistent storage.

---

## 7. End-to-End Data Flow

The runtime data pipeline executes deterministically every frame, maintaining a clean unidirectional flow:

```
[Master Clock] 
      │ ticks dt (e.g. 10 Hz)
      ▼
[Physics Simulation (src/sim)]
  ├── Kepler/Lambert Astrodynamics
  ├── Subsystem ODEs (Thermal, ECLSS, Power, GNC, Rad, Crew)
  └── Fault Injection Engine
      │
      ▼
[Sensor Simulation (src/sim/sensors)]
  ├── Noise (Box-Muller Gaussian via Seeded PRNG)
  ├── Quantization & Sensor Faults (Bias, Drift, Stuck)
      │
      ▼
[Reactive State Store (src/core/store)]
  ├── Current Telemetry State
  └── RingBuffers (Telemetry Sparklines)
      │
      ├───────────────────────────────┬───────────────────────────────┐
      ▼                               ▼                               ▼
[UI Panels (src/ui)]        [Renderer (src/render)]         [AI Gateway Bridge]
  ├── Gauges & Readings       ├── Three.js Celestial Sky      (Serialized Snapshot)
  ├── Warning Annunciators    └── Canvas 2D Tactical Map              │
  └── Sparkline Canvases                                              ▼
                                                            [AI Web Worker (src/ai)]
                                                              ├── Random Forest Infe
                                                              ├── TreeSHAP Attributi
                                                              ├── BM25 Manual Search
                                                              └── Medical CDSS
                                                                      │
                                                                      ▼
                                                            [Action Proposal]
                                                                      │
                                                                      ▼
                                                            [Safety Gate (src/fsw)]
                                                              ├── Schema Validation
                                                              ├── Invariant Checks
                                                              └── Operator Arm/Exec
                                                                      │
                                                                      ▼
                                                            [Sim Actuator State]
```

### 7.1 Data Flow Sequence

1. **Clock Tick**: The master clock advances simulation time $t_{sim}$ by $\Delta t \times \text{warp}$.
2. **Physics Integration**: Planetary positions are updated using Standish (1992) ephemerides. Spacecraft orbital coordinates are propagated. Subsystem models integrate state ODEs (temperatures, gas concentrations, electrical voltages, radiation dosages).
3. **Sensor Processing**: Raw physical parameters are mapped through sensor models that add Gaussian noise (mulberry32 seeded), quantization step limits, and injected failure modes (drifts or biases).
4. **Store Update**: The reactive store (`Store`) receives sensor outputs and updates its internal records. Sparkline ring buffers (`RingBuffer`) record telemetry history.
5. **UI & Canvas Rendering**: Subscribed UI components update DOM nodes directly. The Canvas 2D engine renders spacecraft position, orbital conics, and communication geometry. The Three.js engine renders celestial orientation.
6. **AI Snapshot Dispatch**: At scheduled intervals (or upon fault detection), an immutable telemetry snapshot is serialized across the Web Worker boundary via `postMessage`.
7. **AI Analysis & Proposal**: The worker runs the Random Forest model and calculates exact TreeSHAP attribution values. If an anomaly is identified, an advisory recovery proposal is emitted.
8. **Safety Gate Verification**: The proposal arrives at the FSW Safety Gate. If valid and authorized by human flight controllers, the command is dispatched to the simulated spacecraft actuators, closing the control loop.

---

## 8. Summary

The AEGIS TRANSIT architecture provides an authentic, high-reliability aerospace console environment. By strictly enforcing functional separation, seeded PRNG reproducibility, Web Worker AI isolation, and a deterministic Tier 0 Safety Gate, it exemplifies rigorous systems engineering for deep-space mission simulation.
