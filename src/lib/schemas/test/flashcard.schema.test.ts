import { describe, it, expect } from "vitest";
import { createFlashcardSchema } from "../flashcard.schema";
import { ZodError } from "zod";

describe("createFlashcardSchema", () => {
  it("should validate valid flashcard data", () => {
    const validData = {
      front: "Question",
      back: "Answer",
    };

    const result = createFlashcardSchema.safeParse(validData);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it("should reject empty front", () => {
    const invalidData = {
      front: "",
      back: "Answer",
    };

    const result = createFlashcardSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.front?._errors).toContain("Przód fiszki jest wymagany");
    }
  });

  it("should reject front text that exceeds maximum length", () => {
    const tooLongFront = "a".repeat(201);
    const invalidData = {
      front: tooLongFront,
      back: "Answer",
    };

    const result = createFlashcardSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.front?._errors).toContain("Przód fiszki nie może przekraczać 200 znaków");
    }
  });

  it("should reject empty back", () => {
    const invalidData = {
      front: "Question",
      back: "",
    };

    const result = createFlashcardSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.back?._errors).toContain("Tył fiszki jest wymagany");
    }
  });

  it("should reject back text that exceeds maximum length", () => {
    const tooLongBack = "a".repeat(501);
    const invalidData = {
      front: "Question",
      back: tooLongBack,
    };

    const result = createFlashcardSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.back?._errors).toContain("Tył fiszki nie może przekraczać 500 znaków");
    }
  });
});
