import { supabase } from '@/utils/supabase';
import type { Session } from '@supabase/supabase-js';

export const oauthService = {
  async signInWithGoogle(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error: error?.message ?? null };
  },

  /**
   * Handles BOTH Supabase OAuth flows:
   *
   * 1. Implicit flow (Supabase default) — token arrives in the URL hash:
   *    /auth/callback#access_token=...&refresh_token=...
   *    → supabase.auth.getSession() picks this up automatically after
   *      the client initialises and processes the hash fragment.
   *
   * 2. PKCE flow (opt-in via Supabase dashboard) — code arrives as query param:
   *    /auth/callback?code=...
   *    → must call exchangeCodeForSession(code) explicitly.
   *
   * We detect which flow is active and handle both.
   */
  async handleCallback(): Promise<{
    userId: string | null;
    isNewUser: boolean;
    session: Session | null;
    error: string | null;
  }> {
    // ── PKCE flow: ?code= in search params ──────────────────
    const code = new URLSearchParams(window.location.search).get('code');

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.session) {
        return {
          userId: null, isNewUser: false, session: null,
          error: error?.message ?? 'PKCE session exchange failed.',
        };
      }
      return oauthService._upsertProfile(data.session);
    }

    // ── Implicit flow: #access_token= in hash ───────────────
    // Supabase JS automatically parses the hash on initialisation.
    // We just need to wait for getSession() to return it.
    // Add a small retry loop in case the client hasn't finished parsing yet.
    const hash = window.location.hash;
    if (hash.includes('access_token') || hash.includes('error')) {
      // Give the Supabase client up to 3 seconds to process the hash
      for (let i = 0; i < 6; i++) {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          return { userId: null, isNewUser: false, session: null, error: error.message };
        }
        if (data.session) {
          return oauthService._upsertProfile(data.session);
        }
        await new Promise((r) => setTimeout(r, 500));
      }
      return {
        userId: null, isNewUser: false, session: null,
        error: 'Session timed out. Please try signing in again.',
      };
    }

    // ── Neither — something went wrong upstream ──────────────
    return {
      userId: null, isNewUser: false, session: null,
      error: 'No OAuth token or code found. Please try signing in again.',
    };
  },

  /** Upserts the profiles row and returns a normalised result. */
  async _upsertProfile(session: Session): Promise<{
    userId: string;
    isNewUser: boolean;
    session: Session;
    error: null;
  }> {
    const userId = session.user.id;

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    let isNewUser = false;

    if (!existing) {
      isNewUser = true;
      const meta = session.user.user_metadata;
      await supabase.from('profiles').insert({
        id: userId,
        email: session.user.email ?? '',
        full_name: meta?.full_name ?? meta?.name ?? '',
        avatar_url: meta?.avatar_url ?? meta?.picture ?? null,
        phone: null,
      });
    }

    return { userId, isNewUser, session, error: null };
  },
};