import { supabase } from '@/utils/supabase';
import type {
  LoginCredentials,
  SignUpCredentials,
  AuthResponse,
  User,
} from '@/types/auth.type';

export const authService = {
  /**
   * Sign in with email and password
   */
  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: { message: error.message, code: error.status?.toString() },
      };
    }

    const user = data.user
      ? await authService.getUserProfile(data.user.id)
      : null;

    return {
      user,
      session: data.session,
      error: null,
    };
  },

  /**
   * Create a new account
   */
  async signUp({
    email,
    password,
    full_name,
    phone,
  }: SignUpCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone },
      },
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: { message: error.message, code: error.status?.toString() },
      };
    }

    // Insert profile row
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name,
        phone: phone ?? null,
      });

      if (profileError) {
        console.error('Profile insert error:', profileError.message);
      }
    }

    const user = data.user
      ? await authService.getUserProfile(data.user.id)
      : null;

    return {
      user,
      session: data.session,
      error: null,
    };
  },

  /**
   * Sign out the current user
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  /**
   * Send a password reset email
   */
  async forgotPassword(email: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error: error?.message ?? null };
  },

  /**
   * Get the currently authenticated Supabase user
   */
  async getCurrentSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Fetch the full profile for a given user id
   */
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return data as User;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(
    callback: (user: User | null) => void
  ) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id);
        callback(profile);
      } else {
        callback(null);
      }
    });
  },
};