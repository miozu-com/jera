/**
 * @miozu/jera TypeScript Definitions
 */

import type { Component, Snippet } from 'svelte';

// ============================================
// UTILITIES
// ============================================

/** Concatenate class names, filtering falsy values */
export function cn(...args: (string | boolean | null | undefined | string[])[]): string;

/** Alias for cn - use inside $derived for reactivity */
export const rcn: typeof cn;

/** Class Variants - type-safe variant composition */
export function cv<V extends Record<string, Record<string, string>>>(config: {
  base?: string | string[];
  variants?: V;
  compounds?: Array<{ condition: Partial<{ [K in keyof V]: keyof V[K] }>; class: string }>;
  defaults?: Partial<{ [K in keyof V]: keyof V[K] }>;
}): (props?: Partial<{ [K in keyof V]: keyof V[K] }> & { class?: string }) => string;

/** Merge component classes with user classes */
export function mergeClasses(componentClass: string, userClass?: string): string;

/** Conditional class helper */
export function when(condition: boolean, trueClass: string, falseClass?: string): string;

/** Switch class helper */
export function match<T extends string | number>(value: T, cases: Record<string, string>, fallback?: string): string;

// ============================================
// REACTIVE STATE
// ============================================

export interface ReactiveValue<T> {
  value: T;
  set(value: T): void;
  update(fn: (value: T) => T): void;
}

export function createReactive<T>(initial: T): ReactiveValue<T>;

export interface DerivedValue<T> {
  readonly value: T;
}

export function createDerived<T>(fn: () => T): DerivedValue<T>;

export class ThemeState {
  current: 'light' | 'dark' | 'system';
  readonly resolved: 'light' | 'dark';
  constructor(initial?: 'light' | 'dark' | 'system');
  init(): void;
  set(theme: 'light' | 'dark' | 'system'): void;
  toggle(): void;
}

export function createThemeContext(initial?: 'light' | 'dark' | 'system'): ThemeState;
export function getThemeContext(): ThemeState;

export function createComponentState<T extends object>(
  initialState: T,
  derivedFn?: (state: T) => Record<string, any>
): {
  state: T;
  derived: Record<string, any>;
  patch(patch: Partial<T>): void;
  reset(): void;
};

export function createIdGenerator(prefix?: string): () => string;
export const generateId: () => string;

// ============================================
// ACTIONS
// ============================================

export interface ActionReturn<P = void> {
  update?: (params: P) => void;
  destroy?: () => void;
}

export function clickOutside(node: HTMLElement, callback: () => void): ActionReturn<() => void>;

export function focusTrap(
  node: HTMLElement,
  options?: { enabled?: boolean; initialFocus?: string }
): ActionReturn<{ enabled?: boolean; initialFocus?: string }>;

export function autoFocus(
  node: HTMLElement,
  options?: { delay?: number; select?: boolean }
): ActionReturn;

export function longPress(
  node: HTMLElement,
  options: { duration?: number; onLongPress: () => void }
): ActionReturn<{ duration?: number; onLongPress: () => void }>;

export function escapeKey(node: HTMLElement, callback: () => void): ActionReturn<() => void>;

export function portal(
  node: HTMLElement,
  target?: string | HTMLElement
): ActionReturn<string | HTMLElement>;

export function intersect(
  node: HTMLElement,
  config: {
    onIntersect: (entry: IntersectionObserverEntry) => void;
    options?: IntersectionObserverInit;
  }
): ActionReturn<{ onIntersect: (entry: IntersectionObserverEntry) => void }>;

export function resize(
  node: HTMLElement,
  callback: (entry: ResizeObserverEntry) => void
): ActionReturn<(entry: ResizeObserverEntry) => void>;

export function copy(
  node: HTMLElement,
  options?: {
    value?: string;
    onCopy?: () => void;
    onError?: (err: Error) => void;
  }
): ActionReturn<{ value?: string; onCopy?: () => void; onError?: (err: Error) => void }>;

// ============================================
// COMPONENTS
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps {
  children?: Snippet;
  iconLeft?: Snippet;
  iconRight?: Snippet;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  class?: string;
  onclick?: (event: MouseEvent) => void;
}

export const Button: Component<ButtonProps>;
export const buttonStyles: ReturnType<typeof cv>;

export interface SelectOption {
  [key: string]: any;
}

export interface SelectProps {
  options: SelectOption[];
  value?: any;
  placeholder?: string;
  labelKey?: string;
  valueKey?: string;
  disabled?: boolean;
  error?: boolean;
  class?: string;
  onchange?: (option: SelectOption | null) => void;
}

export const Select: Component<SelectProps>;

export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  createdAt: number;
  pausedAt?: number;
}

export class ToastController {
  toasts: ToastItem[];
  position: ToastPosition;
  defaultDuration: number;
  maxToasts: number;
  show(options: Partial<ToastItem> & { message: string }): string;
  dismiss(id: string): void;
  dismissAll(): void;
  pause(id: string): void;
  resume(id: string): void;
  info(message: string, options?: Partial<ToastItem>): string;
  success(message: string, options?: Partial<ToastItem>): string;
  warning(message: string, options?: Partial<ToastItem>): string;
  error(message: string, options?: Partial<ToastItem>): string;
}

export function createToastContext(): ToastController;
export function getToastContext(): ToastController;

export const Toast: Component<{}>;
export const toastStyles: ReturnType<typeof cv>;
export const positionStyles: Record<ToastPosition, string>;
