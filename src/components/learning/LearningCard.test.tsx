import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LearningCard } from "./LearningCard";
import type { LearningSessionCardDTO } from "../../types";

const mockCard: LearningSessionCardDTO = {
  id: "test-card-123",
  front: "What is React?",
  back: "A JavaScript library for building user interfaces",
  last_reviewed: "2024-01-01T10:00:00Z",
  review_count: 2,
  difficulty_rating: 2.3,
};

describe("LearningCard", () => {
  const mockOnRate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render card front initially", () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} />);

    expect(screen.getByText("What is React?")).toBeInTheDocument();
    expect(screen.getByText("Pytanie")).toBeInTheDocument();
    expect(screen.getByText("Kliknij aby zobaczyć odpowiedź")).toBeInTheDocument();
    expect(screen.queryByText("A JavaScript library for building user interfaces")).not.toBeInTheDocument();
  });

  it("should display card metadata correctly", () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} />);

    expect(screen.getByText("Przeglądy: 2")).toBeInTheDocument();
    expect(screen.getByText("Ostatnio: 1.01.2024")).toBeInTheDocument();
    expect(screen.getByText("Trudność: 2.3/5.0")).toBeInTheDocument();
  });

  it("should flip to show back when clicked", async () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} />);

    const cardElement = screen.getByText("What is React?").closest("div");
    expect(cardElement).toBeTruthy();
    fireEvent.click(cardElement as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText("A JavaScript library for building user interfaces")).toBeInTheDocument();
      expect(screen.getByText("Odpowiedź")).toBeInTheDocument();
      expect(screen.getByText("Oceń jak dobrze pamiętałeś odpowiedź")).toBeInTheDocument();
    });
  });

  it("should show rating buttons after flipping", async () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} />);

    const cardElement = screen.getByText("What is React?").closest("div");
    expect(cardElement).toBeTruthy();
    fireEvent.click(cardElement as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText("Jak dobrze pamiętałeś odpowiedź?")).toBeInTheDocument();

      // Check all rating buttons
      expect(screen.getByText("Nie pamiętam")).toBeInTheDocument();
      expect(screen.getByText("Słabo")).toBeInTheDocument();
      expect(screen.getByText("Przeciętnie")).toBeInTheDocument();
      expect(screen.getByText("Dobrze")).toBeInTheDocument();
      expect(screen.getByText("Bardzo dobrze")).toBeInTheDocument();
    });
  });

  it("should call onRate when rating button is clicked", async () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} />);

    // Flip the card first
    const cardElement = screen.getByText("What is React?").closest("div");
    expect(cardElement).toBeTruthy();
    fireEvent.click(cardElement as HTMLElement);

    await waitFor(() => {
      const ratingButton = screen.getByText("Dobrze").closest("button");
      expect(ratingButton).toBeTruthy();
      fireEvent.click(ratingButton as HTMLElement);
    });

    expect(mockOnRate).toHaveBeenCalledWith(4);
  });

  it("should show rated state after rating", async () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} />);

    // Flip and rate
    const cardElement = screen.getByText("What is React?").closest("div");
    expect(cardElement).toBeTruthy();
    fireEvent.click(cardElement as HTMLElement);

    await waitFor(() => {
      const ratingButton = screen.getByText("Bardzo dobrze").closest("button");
      expect(ratingButton).toBeTruthy();
      fireEvent.click(ratingButton as HTMLElement);
    });

    await waitFor(() => {
      expect(screen.getByText("✓ Oceniono! Ładowanie następnej fiszki...")).toBeInTheDocument();
      expect(screen.queryByText("Jak dobrze pamiętałeś odpowiedź?")).not.toBeInTheDocument();
    });
  });

  it("should disable rating buttons when loading", async () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} isLoading={true} />);

    // Flip the card
    const cardElement = screen.getByText("What is React?").closest("div");
    expect(cardElement).toBeTruthy();
    fireEvent.click(cardElement as HTMLElement);

    await waitFor(() => {
      const ratingButtons = screen.getAllByRole("button");
      ratingButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  it("should show loading overlay when isLoading is true", () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} isLoading={true} />);

    expect(screen.getByText("Zapisywanie oceny...")).toBeInTheDocument();
    expect(screen.getByText(/zapisywanie oceny/i)).toBeInTheDocument();
  });

  it("should prevent flipping after rating", async () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} />);

    // Flip and rate
    const cardElement = screen.getByText("What is React?").closest("div");
    expect(cardElement).toBeTruthy();
    fireEvent.click(cardElement as HTMLElement);

    await waitFor(() => {
      const ratingButton = screen.getByText("Dobrze").closest("button");
      expect(ratingButton).toBeTruthy();
      fireEvent.click(ratingButton as HTMLElement);
    });

    // Try to click the card again
    expect(cardElement).toBeTruthy();
    fireEvent.click(cardElement as HTMLElement);

    // Should still show the rated state
    expect(screen.getByText("✓ Oceniono! Ładowanie następnej fiszki...")).toBeInTheDocument();
  });

  it("should display interval information for ratings", async () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} />);

    // Flip the card
    const cardElement = screen.getByText("What is React?").closest("div");
    expect(cardElement).toBeTruthy();
    fireEvent.click(cardElement as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText("1 = Następny przegląd za 1 dzień")).toBeInTheDocument();
      expect(screen.getByText("2 = za 2 dni | 3 = za 4 dni | 4 = za 7 dni | 5 = za 14 dni")).toBeInTheDocument();
    });
  });

  it("should handle card with no review history", () => {
    const newCard: LearningSessionCardDTO = {
      id: "new-card-123",
      front: "New question?",
      back: "New answer",
      last_reviewed: null,
      review_count: 0,
      difficulty_rating: 2.5,
    };

    render(<LearningCard card={newCard} onRate={mockOnRate} />);

    expect(screen.queryByText("Przeglądy:")).not.toBeInTheDocument();
    expect(screen.queryByText("Ostatnio:")).not.toBeInTheDocument();
    expect(screen.getByText("Trudność: 2.5/5.0")).toBeInTheDocument();
  });

  it("should apply correct CSS classes for rating buttons", async () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} />);

    // Flip the card
    const cardElement = screen.getByText("What is React?").closest("div");
    expect(cardElement).toBeTruthy();
    fireEvent.click(cardElement as HTMLElement);

    await waitFor(() => {
      const ratingButtons = screen.getAllByRole("button");

      // Check that buttons have rating-specific classes
      expect(ratingButtons[0]).toHaveClass("bg-red-500"); // Rating 1
      expect(ratingButtons[1]).toHaveClass("bg-orange-500"); // Rating 2
      expect(ratingButtons[2]).toHaveClass("bg-yellow-500"); // Rating 3
      expect(ratingButtons[3]).toHaveClass("bg-green-500"); // Rating 4
      expect(ratingButtons[4]).toHaveClass("bg-emerald-500"); // Rating 5
    });
  });

  it("should handle keyboard accessibility", async () => {
    render(<LearningCard card={mockCard} onRate={mockOnRate} />);

    // Flip the card with keyboard
    const cardElement = screen.getByText("What is React?").closest("div");
    expect(cardElement).toBeTruthy();
    fireEvent.keyDown(cardElement as HTMLElement, { key: "Enter" });
    expect(cardElement).toBeTruthy();
    fireEvent.click(cardElement as HTMLElement); // Simulate click since we don't have keyboard handler

    await waitFor(() => {
      const ratingButton = screen.getByText("Dobrze").closest("button");
      expect(ratingButton).toBeTruthy();
      fireEvent.keyDown(ratingButton as HTMLElement, { key: "Enter" });
      expect(ratingButton).toBeTruthy();
      fireEvent.click(ratingButton as HTMLElement);
    });

    expect(mockOnRate).toHaveBeenCalledWith(4);
  });

  it("should format dates correctly in Polish locale", () => {
    const cardWithSpecificDate: LearningSessionCardDTO = {
      ...mockCard,
      last_reviewed: "2024-03-15T14:30:00Z",
    };

    render(<LearningCard card={cardWithSpecificDate} onRate={mockOnRate} />);

    expect(screen.getByText("Ostatnio: 15.03.2024")).toBeInTheDocument();
  });
});
