interface OpenRouterResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface FlashcardCandidate {
  front: string;
  back: string;
}

interface AIResponseFlashcard {
  front?: unknown;
  back?: unknown;
}

interface AIGenerationResult {
  candidates: FlashcardCandidate[];
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callOpenRouterAI(inputText: string, count = 5): Promise<AIGenerationResult> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const prompt = `Jesteś ekspertem w tworzeniu fiszek edukacyjnych. Na podstawie podanego tekstu stwórz ${count} fiszek do nauki.

ZASADY:
- Każda fiszka powinna mieć krótkie, konkretne pytanie na przodzie (front)
- Odpowiedź na tyle (back) powinna być jasna i zwięzła
- Fiszki powinny pokrywać najważniejsze pojęcia z tekstu
- Unikaj zbyt długich tekstów - maksymalnie 200 znaków na przód, 500 na tył
- Fiszki powinny być różnorodne (definicje, przykłady, porównania)

TEKST DO ANALIZY:
${inputText}

Odpowiedz TYLKO w formacie JSON bez dodatkowych komentarzy:
{
  "flashcards": [
    {
      "front": "Pytanie lub pojęcie",
      "back": "Odpowiedź lub wyjaśnienie"
    }
  ]
}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://my10xcards.local",
        "X-Title": "my10xCards AI Flashcard Generator",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku:beta",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from AI model");
    }

    const content = data.choices[0].message.content;

    try {
      const parsedContent = JSON.parse(content);

      if (!parsedContent.flashcards || !Array.isArray(parsedContent.flashcards)) {
        throw new Error("Invalid AI response format - missing flashcards array");
      }

      const candidates: FlashcardCandidate[] = parsedContent.flashcards
        .filter((card: AIResponseFlashcard) => card.front && card.back)
        .map((card: AIResponseFlashcard) => ({
          front: String(card.front).substring(0, 200).trim(),
          back: String(card.back).substring(0, 500).trim(),
        }))
        .filter((card: FlashcardCandidate) => card.front.length > 0 && card.back.length > 0);

      if (candidates.length === 0) {
        throw new Error("No valid flashcards generated from AI response");
      }

      return {
        candidates,
        model: data.model,
        usage: data.usage,
      };
    } catch (parseError) {
      throw new Error(
        `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : "Invalid JSON"}`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unknown error occurred while calling OpenRouter AI");
  }
}
