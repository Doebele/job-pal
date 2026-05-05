import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="t-h1 text-fg-1 leading-tight">
              Mit Job-Pal entdeckst du Jobs, die zu deinem Profil, deinen Fähigkeiten und deinen Interessen passen.
            </h1>
            <p className="t-body text-fg-2 max-w-lg mx-auto">
              Job-Pal matcht dich mit passenden Stellenanzeigen basierend auf deinem Profil,
              deinen Skills und deinen Sprachkenntnissen.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link to="/register">
              <button className="bp-btn-primary gradient-accent t-h3 px-8 py-3">
                Kostenlos registrieren
              </button>
            </Link>
            <Link to="/login">
              <button className="bp-btn-secondary t-h3 px-8 py-3">
                Anmelden
              </button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
            {[
              {
                title: 'Smart Matching',
                desc: 'Algorithmus findet die besten Jobs für dein Profil',
                icon: 'M3 8l3 3 7-7',
              },
              {
                title: 'Schweiz-weit',
                desc: 'Alle Kantone, alle Branchen, alle Sprachen',
                icon: 'M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5z',
              },
              {
                title: 'Dokumente',
                desc: 'Lebenslauf & Zeugnisse direkt hochladen',
                icon: 'M4 2h6l4 4v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z',
              },
            ].map((feature) => (
              <div key={feature.title} className="bp-card text-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto mb-3 text-accent"
                >
                  <path d={feature.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 className="t-h3 text-fg-1 mb-1">{feature.title}</h3>
                <p className="t-body-sm text-fg-3">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center t-caption text-fg-3">
        © {new Date().getFullYear()} Job-Pal — Made in Switzerland
      </footer>
    </div>
  );
}
