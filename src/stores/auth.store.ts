import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import type {
  AuthState,
  LoginCredentials,
  SignUpCredentials,
  User,
} from '@/types/auth.type';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<string | null>;
  signUp: (credentials: SignUpCredentials) => Promise<string | null>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string | null>;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,

      /**
       * Initialize auth from existing Supabase session
       */
      initialize: async () => {
        set({ isLoading: true });
        try {
          const session = await authService.getCurrentSession();
          if (session?.user) {
            const user = await authService.getUserProfile(session.user.id);
            set({ user, session, isAuthenticated: !!user });
          }
        } catch (err) {
          console.error('Auth init error:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Login action — returns error message or null on success
       */
      login: async (credentials) => {
        set({ isLoading: true });
        const { user, session, error } = await authService.login(credentials);
        if (error) {
          set({ isLoading: false });
          return error.message;
        }
        set({ user, session, isAuthenticated: true, isLoading: false });
        return null;
      },

      /**
       * Sign-up action — returns error message or null on success
       */
      signUp: async (credentials) => {
        set({ isLoading: true });
        const { user, session, error } = await authService.signUp(credentials);
        if (error) {
          set({ isLoading: false });
          return error.message;
        }
        set({ user, session, isAuthenticated: true, isLoading: false });
        return null;
      },

      /**
       * Logout action
       */
      logout: async () => {
        set({ isLoading: true });
        await authService.logout();
        set({ user: null, session: null, isAuthenticated: false, isLoading: false });
      },

      /**
       * Forgot password — returns error message or null
       */
      forgotPassword: async (email) => {
        const { error } = await authService.forgotPassword(email);
        return error;
      },

      /**
       * Manually set user (used by auth listener).
       * Always sets isAuthenticated in sync so ProtectedRoute never stalls.
       */
      setUser: (user) => {
        set({ user, isAuthenticated: !!user, isLoading: false });
      },
    }),
    {
      name: 'dunganta-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive fields
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);