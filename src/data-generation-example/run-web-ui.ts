import { startWebUiServer } from '../framework/adapters/web-ui/index.js';
import { packRegistry } from './registry/packRegistry.js';

await startWebUiServer(packRegistry, {
  cacheFile: '.datagen/store.json',
  port: 3456,
});
