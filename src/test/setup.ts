import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
// Mock environment variables properly for Astro imports
Object.defineProperty(import.meta, "env", {
  value: {
    OPENROUTER_API_KEY: "test-api-key",
    SUPABASE_URL: "https://test.supabase.co",
    SUPABASE_ANON_KEY: "test-anon-key",
  },
  writable: true,
});

vi.mock("../db/supabase.client.ts", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn((query?: string, options?: any) => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({ limit: vi.fn() })),
          limit: vi.fn(),
          gt: vi.fn(() => ({ data: null, count: 0 })),
        })),
        insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn() })) })),
        update: vi.fn(() => ({ eq: vi.fn() })),
        upsert: vi.fn(),
        count: options?.count || undefined,
        head: options?.head || undefined,
      })),
    })),
  },
}));

// Mock global fetch for API calls
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
vi.spyOn(console, "log").mockImplementation(() => {
  /* Mock console.log */
});
vi.spyOn(console, "error").mockImplementation(() => {
  /* Mock console.error */
});
