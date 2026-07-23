/// <reference types="vite/client" />

interface ImportMetaEnvInterface {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnvInterface;
}
