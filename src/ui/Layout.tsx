import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { useProfile } from '../engine/progress/store';
import { setSoundOn, useSoundOn } from './sound';

export function Layout({ children }: { children: ReactNode }) {
  const profile = useProfile();
  const soundOn = useSoundOn();
  const { pathname } = useLocation();
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-20 bg-base-200/90 backdrop-blur border-b-2 border-base-300">
        <div className="mx-auto max-w-5xl flex items-center gap-2 px-3 py-2">
          {pathname !== '/' ? (
            <Link to="/" className="btn btn-circle btn-lg bg-base-100 border-base-300 text-2xl" aria-label="Về nhà">
              🏠
            </Link>
          ) : (
            <span className="w-14" />
          )}
          <Link to="/" className="font-display text-2xl font-extrabold text-primary tracking-tight flex-1 text-center">
            Toán Rốt
          </Link>
          {profile && (
            <Link
              to="/tu-do"
              className="badge badge-lg h-12 px-4 gap-1 bg-accent text-accent-content border-2 border-white text-xl font-extrabold shadow"
              aria-label={`${profile.carrots} cà rốt`}
            >
              🥕 {profile.carrots}
            </Link>
          )}
          <button
            type="button"
            className="btn btn-circle btn-lg bg-base-100 border-base-300 text-2xl"
            onClick={() => setSoundOn(!soundOn)}
            aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-4">{children}</main>
    </div>
  );
}
