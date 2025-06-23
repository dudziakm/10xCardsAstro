import { z } from 'zod';

async function callOpenRouterAI(inputText, count = 5) {
  const apiKey = "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";
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
        "X-Title": "my10xCards AI Flashcard Generator"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku:beta",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2e3,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from AI model");
    }
    const content = data.choices[0].message.content;
    try {
      const parsedContent = JSON.parse(content);
      if (!parsedContent.flashcards || !Array.isArray(parsedContent.flashcards)) {
        throw new Error("Invalid AI response format - missing flashcards array");
      }
      const candidates = parsedContent.flashcards.filter((card) => card.front && card.back).map((card) => ({
        front: String(card.front).substring(0, 200).trim(),
        back: String(card.back).substring(0, 500).trim()
      })).filter((card) => card.front.length > 0 && card.back.length > 0);
      if (candidates.length === 0) {
        throw new Error("No valid flashcards generated from AI response");
      }
      return {
        candidates,
        model: data.model,
        usage: data.usage
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

class GenerationService {
  constructor(supabase) {
    this.supabase = supabase;
  }
  async generateCandidates(userId, prompt, count = 5) {
    let generationId = null;
    try {
      const generationCmd = {
        user_id: userId,
        input_text: prompt.substring(0, 500),
        // Store preview of prompt
        cards_generated: 0,
        successful: false,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { data: generationData, error: generationError } = await this.supabase.from("generations").insert(generationCmd).select("id").single();
      if (generationError || !generationData) {
        throw new Error(`Failed to create generation log: ${generationError?.message || "No ID returned"}`);
      }
      generationId = generationData.id;
      const aiResponse = await callOpenRouterAI(prompt, count);
      const candidates = aiResponse.candidates;
      const generatedCount = candidates.length;
      const { error: updateError } = await this.supabase.from("generations").update({
        successful: true,
        cards_generated: generatedCount,
        model_used: aiResponse.model || "unknown"
      }).eq("id", generationId);
      if (updateError) {
      }
      if (!generationId) {
        throw new Error("Generation ID not available");
      }
      return { candidates, generationId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown generation error";
      const errorCode = error instanceof Error && "code" in error ? error.code : "GENERATION_FAILED";
      if (generationId) {
        const errorCmd = {
          generation_id: generationId,
          error_message: errorMessage,
          error_code: errorCode,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        try {
          await this.supabase.from("generation_error_logs").insert(errorCmd);
          await this.supabase.from("generations").update({ successful: false }).eq("id", generationId);
        } catch {
        }
      }
      throw new Error(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async acceptCandidates(userId, data) {
    const { generation_id, accepted_candidates } = data;
    try {
      const { data: generation, error: genError } = await this.supabase.from("generations").select("id, user_id, successful").eq("id", generation_id).eq("user_id", userId).single();
      if (genError || !generation) {
        throw new Error("Generacja nie została znaleziona lub nie należy do użytkownika");
      }
      if (!generation.successful) {
        throw new Error("Nie można zaakceptować kandydatów z nieudanej generacji");
      }
      const flashcardCommands = accepted_candidates.map((candidate) => ({
        user_id: userId,
        front: candidate.front,
        back: candidate.back,
        source: "ai",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      const { data: insertedFlashcards, error: insertError } = await this.supabase.from("flashcards").insert(flashcardCommands).select();
      if (insertError || !insertedFlashcards) {
        throw new Error(`Nie udało się zapisać fiszek: ${insertError?.message || "Brak danych"}`);
      }
      const { error: updateError } = await this.supabase.from("generations").update({
        cards_accepted: accepted_candidates.length,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", generation_id);
      if (updateError) {
      }
      const flashcardDTOs = insertedFlashcards.map((flashcard) => ({
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        created_at: flashcard.created_at,
        updated_at: flashcard.updated_at
      }));
      return {
        accepted_count: accepted_candidates.length,
        flashcards: flashcardDTOs
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd podczas akceptowania kandydatów";
      throw new Error(errorMessage);
    }
  }
}

const generateFlashcardsSchema = z.object({
  prompt: z.string().min(10, "Prompt musi mieć co najmniej 10 znaków").max(5e3, "Prompt nie może przekraczać 5000 znaków"),
  count: z.number().int().min(1, "Minimalna liczba fiszek to 1").max(20, "Maksymalna liczba fiszek to 20").default(5).optional()
});
const acceptCandidatesSchema = z.object({
  generation_id: z.string().uuid("Nieprawidłowy ID generacji"),
  accepted_candidates: z.array(
    z.object({
      front: z.string().min(1, "Przód fiszki nie może być pusty"),
      back: z.string().min(1, "Tył fiszki nie może być pusty"),
      difficulty: z.number().int().min(1).max(5).default(3).optional()
    })
  ).min(1, "Musisz wybrać co najmniej jedną fiszkę")
});

export { GenerationService as G, acceptCandidatesSchema as a, generateFlashcardsSchema as g };
