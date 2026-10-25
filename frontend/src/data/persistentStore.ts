import { useMemo, useSyncExternalStore } from "react";

/**
 * A tiny external store persisted to localStorage (DEMO storage).
 * - Versioned: data saved by another version of the app is ignored, not misread.
 * - Validated: anything that fails `validate` is thrown away and the initial value is used, so a corrupt or
 *   hand-edited value can never crash the app.
 * - Safe: every storage access is wrapped, so private mode or a full disk only means "not persisted".
 * It is NOT secure storage: anyone can edit it in dev tools, and it is not shared between browsers or users.
 */
export type Validate<T> = (raw: unknown) => T | null;

export interface StoreSpec<T> {
  /** short unique name, e.g. "cart" */
  name: string;
  version: number;
  initial: T;
  validate: Validate<T>;
  /** Called before writing, to keep lists bounded. */
  trim?: (value: T) => T;
}

export interface Store<T> {
  readonly key: string;
  get(): T;
  set(next: T | ((previous: T) => T)): void;
  subscribe(listener: () => void): () => void;
  /** Re-read from storage (used when another tab changes it). */
  reload(): void;
}

const PREFIX = "ignition";
const registry = new Map<string, Store<unknown>>();

export const storageKey = (name: string, scope?: string | number): string =>
  scope === undefined ? `${PREFIX}.${name}` : `${PREFIX}.${name}.${scope}`;

function read<T>(key: string, spec: StoreSpec<T>): T {
  try {
    const text = localStorage.getItem(key);
    if (text === null) return spec.initial;
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || (parsed as { v?: unknown }).v !== spec.version) return spec.initial;
    return spec.validate((parsed as { data?: unknown }).data) ?? spec.initial;
  } catch {
    return spec.initial;
  }
}

function write<T>(key: string, spec: StoreSpec<T>, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ v: spec.version, data: value }));
  } catch {
    /* storage unavailable: keep working in memory */
  }
}

export function getStore<T>(spec: StoreSpec<T>, scope?: string | number): Store<T> {
  const key = storageKey(spec.name, scope);
  const existing = registry.get(key);
  if (existing) return existing as Store<T>;

  let state = read(key, spec);
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  const store: Store<T> = {
    key,
    get: () => state,
    set(next) {
      const resolved = typeof next === "function" ? (next as (previous: T) => T)(state) : next;
      state = spec.trim ? spec.trim(resolved) : resolved;
      write(key, spec, state);
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reload() {
      state = read(key, spec);
      emit();
    },
  };
  registry.set(key, store as Store<unknown>);
  return store;
}

// Another tab changed saved data: re-read every store so both tabs agree.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === null) registry.forEach((store) => store.reload());
    else registry.get(event.key)?.reload();
  });
}

/** React binding. `scope` (usually the signed-in user id) keeps each person's data separate. */
export function useStore<T>(spec: StoreSpec<T>, scope?: string | number): [T, Store<T>["set"]] {
  const store = useMemo(() => getStore(spec, scope), [spec, scope]);
  const value = useSyncExternalStore(store.subscribe, store.get, store.get);
  return [value, store.set];
}

/** Test helper: forget cached stores so each test starts from empty storage. */
export function resetStoresForTests(): void {
  registry.clear();
}

/** Like `useStore`, but also hands back the store itself, so actions can read the latest value synchronously. */
export function useStoreHandle<T>(spec: StoreSpec<T>, scope?: string | number): { value: T; store: Store<T> } {
  const store = useMemo(() => getStore(spec, scope), [spec, scope]);
  const value = useSyncExternalStore(store.subscribe, store.get, store.get);
  return { value, store };
}
