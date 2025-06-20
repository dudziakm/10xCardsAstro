import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlashcardForm } from "./FlashcardForm";
import type { FlashcardDTO } from "../../types";

const mockFlashcard: FlashcardDTO = {
  id: "test-flashcard-123",
  front: "What is React?",
  back: "A JavaScript library for building user interfaces",
  user_id: "user-123",
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z",
};

// Mock fetch
global.fetch = vi.fn();

describe("FlashcardForm", () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  describe("Create Mode", () => {
    it("should render empty form in create mode", () => {
      render(<FlashcardForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText("Przód fiszki *")).toHaveValue("");
      expect(screen.getByLabelText("Tył fiszki *")).toHaveValue("");
      expect(screen.getByRole("button", { name: /utwórz fiszkę/i })).toBeInTheDocument();
    });

    it("should submit new flashcard successfully", async () => {
      const user = userEvent.setup();
      const mockResponse = { ...mockFlashcard, id: "new-flashcard-123" };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      await user.type(screen.getByLabelText("Przód fiszki *"), "New question?");
      await user.type(screen.getByLabelText("Tył fiszki *"), "New answer");

      fireEvent.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            front: "New question?",
            back: "New answer",
          }),
        });
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(mockResponse);
      });
    });
  });

  describe("Edit Mode", () => {
    it("should render form with existing flashcard data", () => {
      render(<FlashcardForm mode="edit" flashcard={mockFlashcard} onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByDisplayValue("What is React?")).toBeInTheDocument();
      expect(screen.getByDisplayValue("A JavaScript library for building user interfaces")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /zaktualizuj fiszkę/i })).toBeInTheDocument();
    });

    it("should submit updated flashcard successfully", async () => {
      const user = userEvent.setup();
      const updatedFlashcard = { ...mockFlashcard, front: "Updated question?" };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedFlashcard),
      });

      render(<FlashcardForm mode="edit" flashcard={mockFlashcard} onSave={mockOnSave} />);

      const frontInput = screen.getByDisplayValue("What is React?");
      await user.clear(frontInput);
      await user.type(frontInput, "Updated question?");

      fireEvent.click(screen.getByRole("button", { name: /zaktualizuj fiszkę/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/flashcards/${mockFlashcard.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            front: "Updated question?",
            back: "A JavaScript library for building user interfaces",
          }),
        });
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(updatedFlashcard);
      });
    });

    it("should load flashcard data when not provided initially", async () => {
      // Mock DOM element with flashcard ID
      const mockElement = document.createElement("div");
      mockElement.setAttribute("data-flashcard-id", "test-flashcard-123");
      vi.spyOn(document, "querySelector").mockReturnValue(mockElement);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFlashcard),
      });

      render(<FlashcardForm mode="edit" onSave={mockOnSave} />);

      expect(screen.getByText("Ładowanie fiszki...")).toBeInTheDocument();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/flashcards/test-flashcard-123");
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue("What is React?")).toBeInTheDocument();
      });
    });
  });

  describe("Validation", () => {
    it("should show error when front field is empty", async () => {
      const user = userEvent.setup();

      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      await user.type(screen.getByLabelText("Tył fiszki *"), "Answer only");
      fireEvent.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

      await waitFor(() => {
        expect(screen.getByText("Proszę wypełnić oba pola")).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should show error when back field is empty", async () => {
      const user = userEvent.setup();

      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      await user.type(screen.getByLabelText("Przód fiszki *"), "Question only");
      fireEvent.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

      await waitFor(() => {
        expect(screen.getByText("Proszę wypełnić oba pola")).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should disable submit button when fields are empty", () => {
      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      const submitButton = screen.getByRole("button", { name: /utwórz fiszkę/i });
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when both fields are filled", async () => {
      const user = userEvent.setup();

      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      await user.type(screen.getByLabelText("Przód fiszki *"), "Question");
      await user.type(screen.getByLabelText("Tył fiszki *"), "Answer");

      const submitButton = screen.getByRole("button", { name: /utwórz fiszkę/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors during submission", async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Validation failed" }),
      });

      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      await user.type(screen.getByLabelText("Przód fiszki *"), "Question");
      await user.type(screen.getByLabelText("Tył fiszki *"), "Answer");

      fireEvent.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

      await waitFor(() => {
        expect(screen.getByText("Błąd: Validation failed")).toBeInTheDocument();
      });
    });

    it("should handle network errors", async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      await user.type(screen.getByLabelText("Przód fiszki *"), "Question");
      await user.type(screen.getByLabelText("Tył fiszki *"), "Answer");

      fireEvent.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

      await waitFor(() => {
        expect(screen.getByText("Błąd: Network error")).toBeInTheDocument();
      });
    });

    it("should handle 404 error when loading flashcard", async () => {
      const mockElement = document.createElement("div");
      mockElement.setAttribute("data-flashcard-id", "nonexistent-id");
      vi.spyOn(document, "querySelector").mockReturnValue(mockElement);

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<FlashcardForm mode="edit" onSave={mockOnSave} />);

      await waitFor(() => {
        expect(screen.getByText("Błąd: Fiszka nie została znaleziona")).toBeInTheDocument();
        expect(screen.getByText("Powrót do listy")).toBeInTheDocument();
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading spinner during submission", async () => {
      const user = userEvent.setup();

      // Mock a delayed response
      (global.fetch as any).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockFlashcard),
                }),
              100
            )
          )
      );

      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      await user.type(screen.getByLabelText("Przód fiszki *"), "Question");
      await user.type(screen.getByLabelText("Tył fiszki *"), "Answer");

      fireEvent.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

      expect(screen.getByText("Zapisywanie...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /zapisywanie/i })).toBeDisabled();
    });

    it("should disable form fields during submission", async () => {
      const user = userEvent.setup();

      (global.fetch as any).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockFlashcard),
                }),
              100
            )
          )
      );

      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      await user.type(screen.getByLabelText("Przód fiszki *"), "Question");
      await user.type(screen.getByLabelText("Tył fiszki *"), "Answer");

      fireEvent.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

      expect(screen.getByLabelText("Przód fiszki *")).toBeDisabled();
      expect(screen.getByLabelText("Tył fiszki *")).toBeDisabled();
      expect(screen.getByRole("button", { name: /anuluj/i })).toBeDisabled();
    });
  });

  describe("Cancel Functionality", () => {
    it("should call onCancel when cancel button is clicked", () => {
      render(<FlashcardForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByRole("button", { name: /anuluj/i }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("should redirect to flashcards page when no onCancel provided", () => {
      // Mock window.location
      delete (window as any).location;
      window.location = { href: "" } as any;

      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      fireEvent.click(screen.getByRole("button", { name: /anuluj/i }));

      expect(window.location.href).toBe("/flashcards");
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels and required attributes", () => {
      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      const frontInput = screen.getByLabelText("Przód fiszki *");
      const backInput = screen.getByLabelText("Tył fiszki *");

      expect(frontInput).toHaveAttribute("required");
      expect(backInput).toHaveAttribute("required");
      expect(frontInput).toHaveAttribute("id", "front");
      expect(backInput).toHaveAttribute("id", "back");
    });

    it("should have proper ARIA attributes for error states", async () => {
      const user = userEvent.setup();

      render(<FlashcardForm mode="create" onSave={mockOnSave} />);

      fireEvent.click(screen.getByRole("button", { name: /utwórz fiszkę/i }));

      await waitFor(() => {
        const errorElement = screen.getByText(/proszę wypełnić oba pola/i);
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
});
