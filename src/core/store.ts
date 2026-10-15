/**
 * AEGIS TRANSIT — Reactive Store
 * 
 * A minimal reactive state store with typed subscriptions.
 * Used for simulation state that UI panels observe.
 */

export type StoreListener<T> = (newVal: T, oldVal: T) => void;

/**
 * A reactive value container. Set a value, get notified on change.
 */
export class ReactiveValue<T> {
  private _value: T;
  private _listeners: Set<StoreListener<T>> = new Set();

  constructor(initial: T) {
    this._value = initial;
  }

  get value(): T { return this._value; }

  set(newVal: T): void {
    const old = this._value;
    this._value = newVal;
    for (const fn of this._listeners) {
      fn(newVal, old);
    }
  }

  subscribe(fn: StoreListener<T>): () => void {
    this._listeners.add(fn);
    return () => { this._listeners.delete(fn); };
  }
}

/**
 * Ring buffer for telemetry sparklines.
 * Fixed capacity, O(1) push, iterable oldest→newest.
 */
export class RingBuffer<T> {
  private _buf: (T | undefined)[];
  private _head = 0;
  private _count = 0;
  public readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this._buf = new Array(capacity);
  }

  push(val: T): void {
    this._buf[this._head] = val;
    this._head = (this._head + 1) % this.capacity;
    if (this._count < this.capacity) this._count++;
  }

  get length(): number { return this._count; }

  /** Iterate oldest → newest */
  *[Symbol.iterator](): Iterator<T> {
    const start = this._count < this.capacity ? 0 : this._head;
    for (let i = 0; i < this._count; i++) {
      yield this._buf[(start + i) % this.capacity] as T;
    }
  }

  toArray(): T[] {
    return [...this];
  }

  last(): T | undefined {
    if (this._count === 0) return undefined;
    return this._buf[(this._head - 1 + this.capacity) % this.capacity];
  }

  clear(): void {
    this._head = 0;
    this._count = 0;
  }
}

/**
 * Typed store — a record of reactive values.
 */
export class Store<S extends Record<string, unknown>> {
  private values = new Map<keyof S, ReactiveValue<unknown>>();

  constructor(initial: S) {
    for (const [key, val] of Object.entries(initial)) {
      this.values.set(key as keyof S, new ReactiveValue(val));
    }
  }

  get<K extends keyof S>(key: K): S[K] {
    return (this.values.get(key) as ReactiveValue<S[K]>).value;
  }

  set<K extends keyof S>(key: K, val: S[K]): void {
    const rv = this.values.get(key) as ReactiveValue<S[K]>;
    if (rv) rv.set(val);
  }

  subscribe<K extends keyof S>(key: K, fn: StoreListener<S[K]>): () => void {
    const rv = this.values.get(key) as ReactiveValue<S[K]>;
    if (!rv) throw new Error(`Store: unknown key "${String(key)}"`);
    return rv.subscribe(fn);
  }

  snapshot(): S {
    const obj: Partial<S> = {};
    for (const [key, rv] of this.values) {
      (obj as Record<string, unknown>)[key as string] = rv.value;
    }
    return obj as S;
  }
}
