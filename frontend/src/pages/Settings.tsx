import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/auth-store';
import { useToast } from '../components/ui/Toast';
import api from '../lib/api';

export default function Settings() {
  const { logout } = useAuthStore();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateEmail = async () => {
    setSaving(true);
    setPasswordError(null);
    try {
      await api.put('/profile', { email });
      addToast('E-Mail aktualisiert', 'success');
    } catch {
      addToast('E-Mail konnte nicht aktualisiert werden', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setSaving(true);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwörter stimmen nicht überein');
      setSaving(false);
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Neues Passwort muss mindestens 8 Zeichen haben');
      setSaving(false);
      return;
    }

    try {
      await api.put('/profile', {
        currentPassword,
        newPassword,
      });
      addToast('Passwort aktualisiert', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      addToast('Passwort konnte nicht aktualisiert werden', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Bist du sicher? Dein gesamtes Profil wird gelöscht.')) return;

    try {
      await api.delete('/profile');
      logout();
      addToast('Konto gelöscht', 'success');
    } catch {
      addToast('Konto konnte nicht gelöscht werden', 'error');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="t-h1 text-fg-1 mb-1">Einstellungen</h1>
          <p className="t-body text-fg-2">Konto und Sicherheit verwalten</p>
        </div>

        {/* Email */}
        <div className="bp-card space-y-4">
          <span className="t-label text-fg-3 mb-1 block">E-Mail</span>
          <div className="flex gap-2">
            <Input
              label=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="neue@email.ch"
            />
            <Button variant="primary" onClick={handleUpdateEmail} isLoading={saving}>
              Aktualisieren
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="bp-card space-y-4">
          <span className="t-label text-fg-3 mb-1 block">Passwort ändern</span>
          {(passwordError) && (
            <div className="bp-card border-l-4 border-red text-red text-t-body-sm">
              {passwordError}
            </div>
          )}
          <div className="space-y-3">
            <Input
              label="Aktuelles Passwort"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              label="Neues Passwort"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 Zeichen"
            />
            <Input
              label="Passwort bestätigen"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button variant="primary" onClick={handleChangePassword} isLoading={saving}>
            Passwort ändern
          </Button>
        </div>

        {/* Danger zone */}
        <div className="bp-card border-l-4 border-red">
          <span className="t-label text-red mb-2 block">Gefahrenzone</span>
          <p className="t-body-sm text-fg-2 mb-4">
            Beim Löschen deines Kontos werden alle deine Daten unwiderruflich entfernt.
          </p>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Konto löschen
          </Button>
        </div>
      </div>
    </Layout>
  );
}
