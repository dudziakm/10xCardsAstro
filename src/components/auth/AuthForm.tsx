import { useState } from "react";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface AuthFormProps {
  mode: "login" | "signup";
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd");
      }

      if (mode === "login") {
        // Redirect to dashboard after successful login
        window.location.href = "/flashcards";
      } else {
        setMessage("Sprawdź email aby aktywować konto");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{mode === "login" ? "Zaloguj się" : "Utwórz konto"}</h2>
        <p className="text-gray-600 mt-2">
          {mode === "login" ? "Aby kontynuować naukę z fiszkami" : "Dołącz do my10xCards już dziś"}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-red-800">
            <strong>Błąd:</strong> {error}
          </div>
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="text-green-800">
            <strong>Sukces:</strong> {message}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.com"
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Hasło
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          />
          {mode === "signup" && <p className="text-xs text-gray-500 mt-1">Minimum 6 znaków</p>}
        </div>

        <Button type="submit" disabled={loading || !email || !password} className="w-full">
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="sm" color="white" />
              <span>{mode === "login" ? "Logowanie..." : "Tworzenie konta..."}</span>
            </div>
          ) : mode === "login" ? (
            "Zaloguj się"
          ) : (
            "Utwórz konto"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onToggleMode}
          disabled={loading}
          className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          {mode === "login" ? "Nie masz konta? Zarejestruj się" : "Masz już konto? Zaloguj się"}
        </button>
      </div>

      {mode === "login" && (
        <div className="mt-4 text-center">
          <a href="/auth/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">
            Zapomniałeś hasła?
          </a>
        </div>
      )}
    </div>
  );
}
