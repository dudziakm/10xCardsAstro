import { jsx, jsxs } from 'react/jsx-runtime';
import React, { useState } from 'react';
import { B as Button } from './button_tbmfKED-.mjs';
import { L as LoadingSpinner } from './LoadingSpinner_Bmtnd6YC.mjs';

function FlashcardForm({ flashcard, onSave, onCancel, mode = "create" }) {
  const [loadedFlashcard, setLoadedFlashcard] = useState(flashcard || null);
  const [initialLoading, setInitialLoading] = useState(mode === "edit" && !flashcard);
  const [formData, setFormData] = useState({
    front: (flashcard || loadedFlashcard)?.front || "",
    back: (flashcard || loadedFlashcard)?.back || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  React.useEffect(() => {
    if (mode === "edit" && !flashcard && !loadedFlashcard) {
      const flashcardId = document.querySelector("[data-flashcard-id]")?.getAttribute("data-flashcard-id");
      if (flashcardId) {
        loadFlashcard(flashcardId);
      }
    }
  }, [mode, flashcard, loadedFlashcard]);
  const loadFlashcard = async (id) => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/flashcards/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Fiszka nie została znaleziona");
          return;
        }
        throw new Error("Failed to load flashcard");
      }
      const flashcardData = await response.json();
      setLoadedFlashcard(flashcardData);
      setFormData({
        front: flashcardData.front,
        back: flashcardData.back
      });
    } catch {
      setError("Nie udało się załadować fiszki");
    } finally {
      setInitialLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.front.trim() || !formData.back.trim()) {
      setError("Proszę wypełnić oba pola");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let response;
      if (mode === "edit" && (flashcard || loadedFlashcard)) {
        const currentFlashcard = flashcard || loadedFlashcard;
        if (!currentFlashcard) {
          throw new Error("No flashcard data available");
        }
        response = await fetch(`/api/flashcards/${currentFlashcard.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch("/api/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się zapisać fiszki");
      }
      const savedFlashcard = await response.json();
      if (onSave) {
        onSave(savedFlashcard);
      } else {
        window.location.href = "/flashcards";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania");
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = "/flashcards";
    }
  };
  if (initialLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center p-8", children: /* @__PURE__ */ jsx(LoadingSpinner, { text: "Ładowanie fiszki..." }) });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
    error && /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-red-800", children: [
        /* @__PURE__ */ jsx("strong", { children: "Błąd:" }),
        " ",
        error
      ] }),
      error === "Fiszka nie została znaleziona" && /* @__PURE__ */ jsx(
        "a",
        {
          href: "/flashcards",
          className: "mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded",
          children: "Powrót do listy"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4", children: /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
      "Błąd: ",
      error
    ] }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "front", className: "block text-sm font-medium text-gray-700 mb-2", "data-testid": "front-label", children: "Przód fiszki *" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "front",
          "data-testid": "front-textarea",
          value: formData.front,
          onChange: (e) => setFormData((prev) => ({ ...prev, front: e.target.value })),
          placeholder: "Wprowadź pytanie lub pojęcie...",
          required: true,
          className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y",
          disabled: loading
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "back", className: "block text-sm font-medium text-gray-700 mb-2", "data-testid": "back-label", children: "Tył fiszki *" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "back",
          "data-testid": "back-textarea",
          value: formData.back,
          onChange: (e) => setFormData((prev) => ({ ...prev, back: e.target.value })),
          placeholder: "Wprowadź odpowiedź lub wyjaśnienie...",
          required: true,
          className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y",
          disabled: loading
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex space-x-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          "data-testid": "submit-button",
          disabled: loading || !formData.front.trim() || !formData.back.trim(),
          className: "flex-1 sm:flex-none",
          children: loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(LoadingSpinner, { size: "sm", color: "white" }),
            /* @__PURE__ */ jsx("span", { children: "Zapisywanie..." })
          ] }) : mode === "edit" ? "Zaktualizuj fiszkę" : "Utwórz fiszkę"
        }
      ),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: handleCancel, disabled: loading, "data-testid": "cancel-button", children: "Anuluj" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "* Pola wymagane" })
  ] });
}

export { FlashcardForm as F };
