import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/auth-store';
import { useSourcesStore } from '../stores/sources-store';
import { DEEPLINK_SOURCES } from '@shared/constants';
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

  // Custom source form
  const [customName, setCustomName] = useState('');
  const [customRssUrl, setCustomRssUrl] = useState('');
  const [customHomepage, setCustomHomepage] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const {
    enabledSourceIds, toggleSource, enableAll, getAllSources,
    customSources, addCustomSource, removeCustomSource,
  } = useSourcesStore();

  const allSources = getAllSources();

  const handleUpdateEmail = async () => {
    setSaving(true);
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
      await api.put('/profile', { currentPassword, newPassword });
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
    } catch {
      addToast('Konto konnte nicht gelöscht werden', 'error');
    }
  };

  const handleAddCustomSource = () => {
    if (!customName.trim() || !customRssUrl.trim()) return;
    addCustomSource({
      name: customName.trim(),
      url: customRssUrl.trim(),
      homepageUrl: customHomepage.trim() || customRssUrl.trim(),
    });
    setCustomName('');
    setCustomRssUrl('');
    setCustomHomepage('');
    setShowCustomForm(false);
    addToast(`Quelle "${customName}" hinzugefügt`, 'success');
  };

  const typeLabel: Record<string, string> = {
    internal: 'Intern',
    rss: 'RSS',
    api: 'API',
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="t-h1 text-fg-1 mb-1">Einstellungen</h1>
          <p className="t-body text-fg-2">Konto, Sicherheit und Suchquellen verwalten</p>
        </div>

        {/* ── Job-Quellen ── */}
        <div className="bp-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="t-label text-fg-3">Job-Quellen</span>
            <button
              type="button"
              onClick={enableAll}
              className="t-caption text-accent hover:underline"
            >
              Alle aktivieren
            </button>
          </div>
          <p className="t-body-sm text-fg-2">
            Wähle welche Plattformen bei der Stellensuche berücksichtigt werden sollen.
            Ergebnisse werden mit Quellenangabe und Direktlink zur Original-Stelle angezeigt.
          </p>

          <div className="space-y-2">
            {allSources.map((source) => {
              const active = enabledSourceIds.includes(source.id);
              const isCustom = source.id.startsWith('custom:');
              return (
                <div
                  key={source.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    active ? 'border-accent/30 bg-accent/5' : 'border-border bg-surface-2/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSource(source.id)}
                      className={`w-9 h-5 rounded-full transition-colors shrink-0 ${
                        active ? 'bg-accent' : 'bg-surface-2'
                      }`}
                    >
                      <span
                        className={`block w-3.5 h-3.5 rounded-full bg-fg-1 transition-transform mx-0.5 ${
                          active ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="t-body text-fg-1 hover:text-accent"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {source.name}
                        </a>
                        <span className="t-caption text-fg-3 border border-border px-1.5 py-0.5 rounded">
                          {typeLabel[source.type] ?? source.type}
                        </span>
                        {source.requiresKey && (
                          <span className="t-caption text-amber-400 border border-amber-400/30 bg-amber-400/5 px-1.5 py-0.5 rounded">
                            API-Key nötig
                          </span>
                        )}
                      </div>
                      <p className="t-caption text-fg-3 truncate">{source.description}</p>
                    </div>
                  </div>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => removeCustomSource(source.id)}
                      className="t-caption text-red hover:underline shrink-0 ml-2"
                    >
                      Entfernen
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Adzuna Hinweis */}
          <div className="bp-card bg-amber-400/5 border-amber-400/20 space-y-1">
            <p className="t-body-sm text-amber-400 font-medium">Adzuna API-Key konfigurieren (empfohlen)</p>
            <p className="t-caption text-fg-2">
              Adzuna aggregiert hunderte CH-Jobportale inkl. jobs.ch und jobscout24. Kostenlose Registrierung unter{' '}
              <a href="https://developer.adzuna.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                developer.adzuna.com
              </a>
              . Danach <code className="bg-surface-2 px-1 rounded">ADZUNA_APP_ID</code> und{' '}
              <code className="bg-surface-2 px-1 rounded">ADZUNA_APP_KEY</code> in{' '}
              <code className="bg-surface-2 px-1 rounded">backend/.env</code> eintragen und den Server neu starten.
            </p>
          </div>

          {/* Deep-Link Portale */}
          <div className="pt-2 border-t border-border space-y-2">
            <p className="t-body-sm text-fg-2 font-medium">Weitere Portale (Deep-Links)</p>
            <p className="t-caption text-fg-3">
              Diese Portale bieten keine öffentliche API — sie öffnen deine Suche in einem neuen Tab.
              Glassdoor und LinkedIn fallen in diese Kategorie.
            </p>
            <div className="flex flex-wrap gap-2">
              {DEEPLINK_SOURCES.map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={source.description}
                  className="t-caption px-2.5 py-1 rounded border border-border bg-surface-2 hover:border-fg-3 text-fg-2 hover:text-fg-1 transition-colors"
                >
                  {source.name}
                </a>
              ))}
            </div>
          </div>

          {/* Eigene Quelle hinzufügen */}
          <div className="pt-2 border-t border-border">
            {!showCustomForm ? (
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="t-body-sm text-accent hover:underline flex items-center gap-1"
              >
                <span>+</span> Eigene RSS-Quelle hinzufügen
              </button>
            ) : (
              <div className="space-y-3">
                <p className="t-body-sm text-fg-2">
                  Jede Plattform mit RSS-Feed kann hinzugefügt werden. Typische RSS-URLs:
                </p>
                <ul className="t-caption text-fg-3 list-disc list-inside space-y-0.5">
                  <li><code className="bg-surface-2 px-1 rounded">https://ch.indeed.com/rss?q=entwickler&l=Zürich</code></li>
                  <li><code className="bg-surface-2 px-1 rounded">https://jobs.ch/de/rss/?term=lehrling</code></li>
                  <li><code className="bg-surface-2 px-1 rounded">https://www.jobscout24.ch/de/jobs/informatik?format=rss</code></li>
                </ul>
                <div className="space-y-2">
                  <Input
                    label="Name der Quelle"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="z.B. jobs.ch Informatik"
                  />
                  <Input
                    label="RSS-Feed URL"
                    value={customRssUrl}
                    onChange={(e) => setCustomRssUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <Input
                    label="Webseite (für Quellenlink, optional)"
                    value={customHomepage}
                    onChange={(e) => setCustomHomepage(e.target.value)}
                    placeholder="https://jobs.ch"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleAddCustomSource}
                    disabled={!customName.trim() || !customRssUrl.trim()}
                  >
                    Hinzufügen
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCustomForm(false)}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── E-Mail ── */}
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

        {/* ── Passwort ── */}
        <div className="bp-card space-y-4">
          <span className="t-label text-fg-3 mb-1 block">Passwort ändern</span>
          {passwordError && (
            <div className="bp-card border-l-4 border-red text-red t-body-sm">
              {passwordError}
            </div>
          )}
          <div className="space-y-3">
            <Input label="Aktuelles Passwort" type="password" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            <Input label="Neues Passwort" type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 Zeichen" />
            <Input label="Passwort bestätigen" type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button variant="primary" onClick={handleChangePassword} isLoading={saving}>
            Passwort ändern
          </Button>
        </div>

        {/* ── Gefahrenzone ── */}
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
