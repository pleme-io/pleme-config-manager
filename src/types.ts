/**
 * Configuration Types
 */

/**
 * Generic configuration record type
 * Extend this interface with your specific config shape
 */
export type ConfigRecord = Record<string, string | undefined>;

/**
 * Configuration loader options
 */
export interface ConfigLoaderOptions {
  /** Maximum time to wait for config to load (milliseconds) */
  maxWaitMs?: number;
  /** Polling interval for checking if config is loaded (milliseconds) */
  pollIntervalMs?: number;
  /** Custom config key on window object (default: 'ENV') */
  configKey?: string;
}

/**
 * Configuration getter options
 */
export interface GetConfigOptions<T> {
  /** Whether this config value is required (throws if missing) */
  required?: boolean;
  /** Default value if not found */
  defaultValue?: T;
}
