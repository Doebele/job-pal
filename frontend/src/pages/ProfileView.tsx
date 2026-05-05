import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProfilePreview } from '../components/profile/ProfilePreview';
import { ProfileForm } from '../components/profile/ProfileForm';
import { Button } from '../components/ui/Button';
import { useWizardStore } from '../stores/wizard-store';
import api from '../lib/api';

export default function ProfileView() {
  const navigate = useNavigate();
  const { setDraft, saveProfile, isSaving } = useWizardStore();
  const [editing, setEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/profile');
      setDraft(res.data.profile);
      setHasProfile(true);
    } catch {
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveProfile();
      setEditing(false);
      await loadProfile();
    } catch {
      // saveError is set in wizard-store
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="bp-skeleton h-64" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="t-h1 text-fg-1 mb-1">Mein Profil</h1>
            <p className="t-body text-fg-2">Verwalte deine persönlichen Informationen</p>
          </div>
          {hasProfile && (
            !editing ? (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => navigate('/profile/setup')}>
                  Vollständig bearbeiten
                </Button>
                <Button variant="primary" onClick={() => setEditing(true)}>
                  Schnell bearbeiten
                </Button>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Abbrechen
              </Button>
            )
          )}
        </div>

        {editing ? (
          <ProfileForm onSubmit={handleSave} isLoading={isSaving} />
        ) : hasProfile ? (
          <ProfilePreview />
        ) : (
          <div className="bp-card dashed-accent text-center p-12">
            <p className="t-body text-fg-2 mb-4">Noch kein Profil vorhanden</p>
            <Button
              variant="primary"
              onClick={() => navigate('/profile/setup')}
            >
              Profil einrichten
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
