import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="t-h1 text-fg-1">Willkommen zurück</h1>
          <p className="t-body text-fg-2">Melde dich bei deinem Konto an</p>
        </div>

        <form onSubmit={handleSubmit} className="bp-card space-y-4">
          {error && (
            <div className="bp-card border-l-4 border-red text-red text-t-body-sm">
              {error}
            </div>
          )}

          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.ch"
            required
          />

          <Input
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between text-t-body-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-fg-3">Angemeldet bleiben</span>
            </label>
            <Link to="/forgot-password" className="text-accent hover:underline">
              Passwort vergessen?
            </Link>
          </div>

          <Button
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            type="submit"
          >
            Anmelden
          </Button>

          <p className="text-center t-body-sm text-fg-3">
            Noch kein Konto?{' '}
            <Link to="/register" className="text-accent hover:underline">
              Registrieren
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
