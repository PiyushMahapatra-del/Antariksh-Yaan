/**
 * AEGIS TRANSIT — Typed Event Bus
 * 
 * Lightweight pub/sub for decoupling simulation, render, and UI layers.
 * Type-safe event map ensures compile-time correctness.
 */

export type EventCallback<T = unknown> = (data: T) => void;

interface Subscription {
  id: number;
  callback: EventCallback<unknown>;
  once: boolean;
}

/**
 * A typed event bus. Define your event map as a type parameter:
 * 
 * ```ts
 * type Events = {
 *   'sim:tick': { dt: number; simTime: number };
 *   'fault:injected': { faultId: string };
 * };
 * const bus = new EventBus<Events>();
 * bus.on('sim:tick', (data) => console.log(data.dt));
 * ```
 */
export class EventBus<EventMap extends Record<string, unknown>> {
  private listeners = new Map<keyof EventMap, Subscription[]>();
  private nextId = 0;

  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): number {
    const id = this.nextId++;
    const subs = this.listeners.get(event) ?? [];
    subs.push({ id, callback: callback as EventCallback<unknown>, once: false });
    this.listeners.set(event, subs);
    return id;
  }

  once<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): number {
    const id = this.nextId++;
    const subs = this.listeners.get(event) ?? [];
    subs.push({ id, callback: callback as EventCallback<unknown>, once: true });
    this.listeners.set(event, subs);
    return id;
  }

  off(id: number): void {
    for (const [, subs] of this.listeners) {
      const idx = subs.findIndex(s => s.id === id);
      if (idx >= 0) {
        subs.splice(idx, 1);
        return;
      }
    }
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const subs = this.listeners.get(event);
    if (!subs) return;
    const toRemove: number[] = [];
    for (const sub of subs) {
      sub.callback(data);
      if (sub.once) toRemove.push(sub.id);
    }
    for (const id of toRemove) {
      const idx = subs.findIndex(s => s.id === id);
      if (idx >= 0) subs.splice(idx, 1);
    }
  }

  removeAll<K extends keyof EventMap>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
