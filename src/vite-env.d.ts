/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENTRA_CLIENT_ID?: string;
  readonly VITE_ENTRA_TENANT_ID?: string;
  readonly VITE_ENTRA_AUTHORITY?: string;
  readonly VITE_AEGISBANK_API_SCOPE?: string;
  readonly VITE_AEGISBANK_API_CLIENT_ID?: string;
  readonly VITE_USE_MOCK_AUTH?: string;
  readonly VITE_USE_MOCK_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
