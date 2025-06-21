import { Button } from "../ui/button";

export function LoginPrompt() {
  return (
    <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Zaloguj się aby rozpocząć naukę</h2>
      <p className="text-gray-600 mb-6">
        Utwórz konto lub zaloguj się, aby rozpocząć tworzenie fiszek i efektywną naukę z algorytmem spaced repetition.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => (window.location.href = "/auth/login")} className="bg-blue-600 hover:bg-blue-700">
          🚀 Zaloguj się
        </Button>

        <Button
          onClick={() => (window.location.href = "/auth/signup")}
          variant="outline"
          className="border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          ✨ Utwórz konto
        </Button>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>✅ Bezpłatne • ✅ Bez reklam • ✅ Twoje dane są bezpieczne</p>
      </div>
    </div>
  );
}
