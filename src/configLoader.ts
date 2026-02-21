/**
 * Asynchronous Configuration Loader
 *
 * Provides race-condition-free access to runtime configuration from window.ENV.
 * Waits for configuration to be loaded before resolving requests.
 */

import type { ConfigLoaderOptions, ConfigRecord, GetConfigOptions } from './types';

/**
 * Configuration Loader Class
 * Generic loader that works with any config shape
 */
export class ConfigLoader<T extends ConfigRecord = ConfigRecord> {
  private config: T | null = null;
  private loadingPromise: Promise<T> | null = null;
  private readonly maxWaitMs: number;
  private readonly pollIntervalMs: number;
  private readonly configKey: string;

  constructor(options: ConfigLoaderOptions = {}) {
    this.maxWaitMs = options.maxWaitMs ?? 10000; // 10 seconds default
    this.pollIntervalMs = options.pollIntervalMs ?? 50; // 50ms default
    this.configKey = options.configKey ?? 'ENV';
  }

  /**
   * Wait for window[configKey] to be loaded and return it
   */
  private async loadConfig(): Promise<T> {
    // Return cached config if already loaded
    if (this.config) {
      return this.config;
    }

    // Return existing loading promise if already in progress
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Create new loading promise
    this.loadingPromise = new Promise<T>((resolve, reject) => {
      const startTime = Date.now();

      const checkConfig = (): void => {
        // Check if window[configKey] is defined
        const windowConfig = (window as unknown as Record<string, T>)[this.configKey];
        if (windowConfig) {
          console.log(`[ConfigLoader] Configuration loaded successfully from window.${this.configKey}`);
          this.config = windowConfig;
          this.loadingPromise = null;
          resolve(windowConfig);
          return;
        }

        // Check timeout
        const elapsed = Date.now() - startTime;
        if (elapsed >= this.maxWaitMs) {
          console.error('[ConfigLoader] Timeout waiting for configuration');
          this.loadingPromise = null;
          reject(
            new Error(
              `Configuration failed to load after ${this.maxWaitMs}ms. ` +
                `Ensure window.${this.configKey} is set before application starts.`
            )
          );
          return;
        }

        // Continue polling
        setTimeout(checkConfig, this.pollIntervalMs);
      };

      // Start polling
      checkConfig();
    });

    return this.loadingPromise;
  }

  /**
   * Get a configuration value with validation
   */
  async get<K extends keyof T>(
    key: K,
    options?: GetConfigOptions<T[K]>
  ): Promise<T[K] | undefined> {
    const config = await this.loadConfig();
    const value = config[key];

    // Check if required value is missing
    if (options?.required && (value === undefined || value === '')) {
      throw new Error(
        `Required configuration '${String(key)}' is missing. ` +
          `Check that it's set in window.${this.configKey}.`
      );
    }

    // Return value or default
    return value !== undefined ? value : options?.defaultValue;
  }

  /**
   * Get the entire configuration object (for debugging)
   */
  async getAll(): Promise<T> {
    return await this.loadConfig();
  }

  /**
   * Check if configuration is already loaded (synchronous check)
   */
  isLoaded(): boolean {
    return this.config !== null;
  }

  /**
   * Force reload configuration (useful for testing)
   */
  reload(): void {
    this.config = null;
    this.loadingPromise = null;
  }
}
