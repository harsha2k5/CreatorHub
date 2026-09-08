/**
 * CreatorHub - Root Entry Point
 * Dispatches to Node server if executed in a Node environment.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

require('./server/index.cjs');
