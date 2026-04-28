import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { ProfilePreview } from '../components/profile/ProfilePreview';
import { ProfileForm } from '../components/profile/ProfileForm';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/auth-store';
import api from '../lib/api';

export default function ProfileView() {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data.profile);
    } catch {
      // No profile yet
    } finally {
      setLoading(false);
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
          {!editing ? (
            <Button variant="primary" onClick={() => setEditing(true)}>
              Bearbeiten
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Abbrechen
            </Button>
          )}
        </div>

        {editing ? (
          <ProfileForm onSubmit={() => setEditing(false)} />
        ) : profile ? (
          <ProfilePreview />
        ) : (
          <div className="bp-card dashed-accent text-center p-12">
            <p className="t-body text-fg-2 mb-4">Noch kein Profil vorhanden</p>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/profile/setup'}
            >
              Profil einrichten
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
