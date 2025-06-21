// Global type declarations for browser environment

declare global {
  interface Window {
    logout: () => Promise<void>;
  }
}

export {};
