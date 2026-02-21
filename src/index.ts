/**
 * @pleme/config-manager
 *
 * Runtime configuration management for browser applications
 * Supports both synchronous and asynchronous config loading patterns
 */

// Export types
export type { ConfigRecord, ConfigLoaderOptions, GetConfigOptions } from './types';

// Export synchronous config manager
export { Config } from './config';

// Export asynchronous config loader
export { ConfigLoader } from './configLoader';
