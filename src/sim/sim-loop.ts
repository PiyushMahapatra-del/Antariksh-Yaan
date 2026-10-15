/**
 * AEGIS TRANSIT — Main Simulation Loop
 * 
 * SIMULATION: NOT FLIGHT SOFTWARE
 * Coordinates simulation clock, celestial ephemerides, trajectory propagation,
 * communication link state, physical subsystems integration (Thermal, ECLSS, Power,
 * GNC, Radiation, Crew, Compute), and event bus broadcasts at 60 Hz via requestAnimationFrame.
 */

import { SimClock } from './clock.js';
import { earthPosition, marsPosition } from './ephemeris.js';
import { TrajectoryManager } from './trajectory.js';
import { CommsStateManager } from './comms-state.js';
import { SubsystemManager } from './subsystems/index.js';
import { type FaultType } from './faults.js';
import { AU_KM, SECONDS_PER_DAY } from './constants.js';
import type { EventBus } from '../core/event-bus.js';
import type { AegisEventMap, AlertLevel } from '../core/types.js';

const requestFrame = typeof requestAnimationFrame !== 'undefined'
  ? requestAnimationFrame
  : (cb: (ts: number) => void) => setTimeout(() => cb(performance.now()), 16) as unknown as number;

const cancelFrame = typeof cancelAnimationFrame !== 'undefined'
  ? cancelAnimationFrame
  : (id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>);

/**
 * Central simulation coordinator driving real-time astrodynamic integration.
 */
export class SimLoop {
  /** Simulation time and warp clock */
  public clock: SimClock;

  /** Spacecraft trajectory manager and Lambert solver */
  public trajectory: TrajectoryManager;

  /** Deep space communication state tracker */
  public comms: CommsStateManager;

  /** Subsystems manager and telemetry coordinator */
  public subsystems: SubsystemManager;

  /** Typed global event bus */
  public bus: EventBus<AegisEventMap>;

  /** Whether the simulation loop is currently active */
  public running: boolean = false;

  /** Current Earth heliocentric position [x, y] in AU */
  public earthPos: [number, number];

  /** Current Mars heliocentric position [x, y] in AU */
  public marsPos: [number, number];

  /** Current Earth ephemeris state { x, y, r, nu } */
  public earthState: { x: number; y: number; r: number; nu: number };

  /** Current Mars ephemeris state { x, y, r, nu } */
  public marsState: { x: number; y: number; r: number; nu: number };

  private activeAlerts: Map<string, AlertLevel> = new Map();
  private lastTimestamp: number = 0;
  private animFrameId: number | null = null;

  /**
   * Initializes the simulation loop, binds ephemerides and trajectory, and attaches event listeners.
   *
   * @param bus EventBus instance for event publishing and subscription
   */
  constructor(bus: EventBus<AegisEventMap>) {
    this.bus = bus;
    this.trajectory = new TrajectoryManager();
    this.clock = new SimClock(this.trajectory.departureJD);
    this.comms = new CommsStateManager();
    this.subsystems = new SubsystemManager();
    this.subsystems.faultInjector.setBus(this.bus);
    this.running = false;

    // Initialize initial planetary positions and spacecraft state
    this.earthState = earthPosition(this.clock.simTimeJD);
    this.marsState = marsPosition(this.clock.simTimeJD);
    this.earthPos = [this.earthState.x, this.earthState.y];
    this.marsPos = [this.marsState.x, this.marsState.y];

    this.trajectory.update(this.clock.simTimeJD);
    this.comms.update(this.trajectory.shipState.pos, this.earthPos);

    // Wire up warp change listeners
    this.bus.on('sim:warpChanged', ({ warp, paused }) => {
      if (paused) {
        this.clock.pause();
      } else {
        this.clock.resume();
      }
      this.clock.setWarp(warp);
    });

    // Wire up auto-drop to 1x on CAUTION/WARNING/CRITICAL alerts
    this.bus.on('alert:raised', ({ level }) => {
      if (level === 'CAUTION' || level === 'WARNING' || level === 'CRITICAL') {
        this.clock.dropTo1x();
        this.bus.emit('sim:warpChanged', {
          warp: this.clock.warp,
          paused: this.clock.paused,
        });
      }
    });

    // Wire up fault injection event synchronization
    this.bus.on('fault:injected', ({ faultId, params }) => {
      if (!this.subsystems.faultInjector.isActive(faultId as FaultType)) {
        this.subsystems.faultInjector.inject(faultId as FaultType, params, this.clock.simTimeJD);
      }
    });

    this.bus.on('fault:cleared', ({ faultId }) => {
      if (this.subsystems.faultInjector.isActive(faultId as FaultType)) {
        this.subsystems.faultInjector.clear(faultId as FaultType);
      }
    });
  }

  /**
   * Starts the simulation loop using requestAnimationFrame.
   */
  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      if (!this.running) {
        return;
      }
      const elapsedSec = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      // Cap wallDt at 100ms to prevent spiral of death on tab unfocus/stutter
      const wallDtSec = Math.min(Math.max(0, elapsedSec), 0.1);

      this.tick(wallDtSec);
      this.animFrameId = requestFrame(loop);
    };

    this.animFrameId = requestFrame(loop);
  }

  /**
   * Stops the active simulation loop.
   */
  stop(): void {
    this.running = false;
    if (this.animFrameId !== null) {
      cancelFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Advances the simulation state by wallDtSec seconds.
   *
   * @param wallDtSec Wall-clock delta time in seconds
   */
  public tick(wallDtSec: number): void {
    // 1. Advance clock
    const simDtSec = this.clock.tick(wallDtSec);

    // 2. Compute planet positions
    this.earthState = earthPosition(this.clock.simTimeJD);
    this.marsState = marsPosition(this.clock.simTimeJD);
    this.earthPos = [this.earthState.x, this.earthState.y];
    this.marsPos = [this.marsState.x, this.marsState.y];

    // 3. Update ship trajectory
    const prevPhase = this.trajectory.shipState.phase;
    this.trajectory.update(this.clock.simTimeJD);
    const newPhase = this.trajectory.shipState.phase;
    if (prevPhase !== newPhase) {
      this.bus.emit('sim:phaseChanged', { from: prevPhase, to: newPhase });
    }

    // 4. Update comm state
    const prevLinkState = this.comms.state.linkState;
    this.comms.update(this.trajectory.shipState.pos, this.earthPos);
    this.bus.emit('comm:stateChanged', this.comms.state);

    if (prevLinkState !== 'BLACKOUT' && this.comms.state.linkState === 'BLACKOUT') {
      this.bus.emit('dtn:blackoutStart', { thetaDeg: this.comms.state.thetaDeg });
    } else if (prevLinkState === 'BLACKOUT' && this.comms.state.linkState !== 'BLACKOUT') {
      this.bus.emit('dtn:blackoutEnd', { thetaDeg: this.comms.state.thetaDeg });
    }

    // 5. Update navigation telemetry derived strictly from orbital kinematics
    const ship = this.trajectory.shipState;
    const distSun = Math.hypot(ship.pos[0], ship.pos[1]);
    const distEarth = Math.hypot(ship.pos[0] - this.earthPos[0], ship.pos[1] - this.earthPos[1]);
    const distMars = this.trajectory.distanceToMars(this.marsPos);
    const speedAuDay = Math.hypot(ship.vel[0], ship.vel[1]);
    const speedKmS = (speedAuDay * AU_KM) / SECONDS_PER_DAY;
    const etaDays = Math.max(0, this.trajectory.arrivalJD - this.clock.simTimeJD);

    this.subsystems.updateNavigation({
      distSun,
      distEarth,
      distMars,
      speedKmS,
      etaDays,
    });

    // 6. Subsystem simulation integration (active if warp <= 600x)
    if (this.clock.subsystemsActive && !this.clock.paused && simDtSec > 0) {
      // Step subsystems at 10 Hz sim time
      const subStepSec = 0.1;
      let remainingDt = simDtSec;
      const maxSubSteps = 20;
      let steps = 0;
      while (remainingDt >= subStepSec && steps < maxSubSteps) {
        this.subsystems.step(subStepSec, distSun, ship.phase, this.clock.simTimeJD);
        remainingDt -= subStepSec;
        steps++;
      }
      if (remainingDt > 0) {
        this.subsystems.step(remainingDt, distSun, ship.phase, this.clock.simTimeJD);
      }
    }

    // 7. Process alerts and telemetry dispatches
    const telemetry = this.subsystems.getTelemetry();
    const alerts = this.subsystems.getAlerts();

    const currentAlertChannels = new Set<string>();
    for (const alert of alerts) {
      currentAlertChannels.add(alert.channel);
      const prevLevel = this.activeAlerts.get(alert.channel);
      if (prevLevel !== alert.level) {
        this.activeAlerts.set(alert.channel, alert.level);
        this.bus.emit('alert:raised', {
          subsystem: alert.subsystem,
          channel: alert.channel,
          level: alert.level,
          value: alert.value,
          limit: alert.limit,
        });
      }
    }

    for (const [ch] of this.activeAlerts.entries()) {
      if (!currentAlertChannels.has(ch)) {
        this.activeAlerts.delete(ch);
        const def = this.subsystems.channelDefs.get(ch);
        this.bus.emit('alert:cleared', {
          subsystem: def?.section ?? 'Subsystem',
          channel: ch,
        });
      }
    }

    // 8. Emit telemetry update event
    this.bus.emit('telemetry:update', {
      telemetry,
      alerts,
    });

    // 9. Emit 'sim:tick' event
    this.bus.emit('sim:tick', {
      dt: simDtSec,
      simTimeJD: this.clock.simTimeJD,
      warp: this.clock.paused ? 0 : this.clock.warp,
    });

    this.bus.emit('render:frame', {
      fps: wallDtSec > 0 ? 1 / wallDtSec : 60,
    });
  }
}
