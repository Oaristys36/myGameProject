/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_MODE: string;
    // ajoute ici d'autres variables d'env avec VITE_
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }