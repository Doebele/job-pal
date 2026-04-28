import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'employer'>('student');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError('Passwörter stimmen nicht überein');
      return;
    }
    if (password.length < 8) {
      setFormError('Passwort muss mindestens 8 Zeichen haben');
      return;
    }

    try {
      await register(email, password, role);
      navigate('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="t-h1 text-fg-1">Konto erstellen</h1>
          <p className="t-body text-fg-2">Starte jetzt auf Job-Pal</p>
        </div>

        <form onSubmit={handleSubmit} className="bp-card space-y-4">
          {(error || formError) && (
            <div className="bp-card border-l-4 border-red text-red text-t-body-sm">
              {formError || error}
            </div>
          )}

          {/* Role selection */}
          <div>
            <label className="eyebrow mb-2 block">Ich bin...</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'student', label: 'Auszubildende/r', desc: 'Suche einen Lehrbetrieb' },
                { value: 'employer', label: 'Arbeitgeber/in', desc: 'Stellen anbieten' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value as 'student' | 'employer')}
                  className={cn(
                    'bp-card text-left transition-all',
                    role === opt.value
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-border-2'
                  )}
                >
                  <p className="t-body-sm text-fg-1">{opt.label}</p>
                  <p className="t-caption text-fg-3">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

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
            placeholder="Min. 8 Zeichen"
            required
          />

          <Input
            label="Passwort bestätigen"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            type="submit"
          >
            Registrieren
          </Button>

          <p className="text-center t-body-sm text-fg-3">
            Bereits ein Konto?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Anmelden
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
