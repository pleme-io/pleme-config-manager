/**
 * Synchronous Configuration Access
 *
 * Simple synchronous configuration access when window.ENV is guaranteed to be loaded.
 * Use this when your config is loaded via <script> tag in index.html before any modules.
 */

import type { ConfigRecord } from './types';

/**
 * Synchronous Configuration Manager
 * Assumes window[configKey] is already loaded
 */
export class Config<T extends ConfigRecord = ConfigRecord> {
  private readonly configKey: string;

  constructor(configKey = 'ENV') {
    this.configKey = configKey;
  }

  /**
   * Get window[configKey] with proper typing and validation
   * Throws if window[configKey] is not available
   */
  private getEnv(): T {
    if (typeof window === 'undefined') {
      throw new Error(`Cannot access window.${this.configKey} in non-browser environment`);
    }

    const windowConfig = (window as unknown as Record<string, T>)[this.configKey];
    if (!windowConfig) {
      throw new Error(
        `window.${this.configKey} is not defined. This indicates the config file failed to load. Check:\n` +
          `1. Config file exists and is mounted correctly\n` +
          `2. Config is loaded via <script> tag before application code\n` +
          `3. No script loading errors in browser console`
      );
    }

    return windowConfig;
  }

  /**
   * Get a required configuration value
   * Throws if the value is missing or empty
   */
  getRequired<K extends keyof T>(key: K): string {
    const env = this.getEnv();
    const value = env[key];

    if (!value || value === '') {
      throw new Error(
        `Required configuration '${String(key)}' is missing or empty. ` +
          `Check that it's set in window.${this.configKey}.`
      );
    }

    return value as string;
  }

  /**
   * Get an optional configuration value
   */
  getOptional<K extends keyof T>(key: K): string | undefined {
    const env = this.getEnv();
    return (env[key] as string | undefined) || undefined;
  }

  /**
   * Get a boolean configuration value
   */
  getBoolean<K extends keyof T>(key: K, defaultValue = false): boolean {
    const value = this.getOptional(key);
    return value === 'true' || defaultValue;
  }

  /**
   * Get all configuration (for debugging)
   */
  getAll(): T {
    return this.getEnv();
  }

  /**
   * Check if config is available (should always be true if loaded properly)
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as unknown as Record<string, T>)[this.configKey];
  }
}
