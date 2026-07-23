import path from 'path';
import { fileURLToPath } from 'url';

import { config } from 'dotenv';

/**
 * Корневой `.env` монорепо (не зависит от cwd: api workspace vs root)
 * Файл лежит в `api/src/` → корень на два уровня выше
 */
const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

config({
  path: path.join(monorepoRoot, '.env'),
});
