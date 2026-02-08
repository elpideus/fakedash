import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    setUser: (user: User | null) => void;
    clearError: () => void;
    isOwner: (resourceUserId: string | number) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    // Simulate API call to JSON server
                    const response = await fetch(
                        `http://localhost:3001/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
                    );

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const users = await response.json();

                    if (users.length === 0) {
                        set({
                            isLoading: false,
                            error: 'Invalid email or password'
                        });
                        return false;
                    }

                    const user = users[0];

                    // Don't store password in state
                    const { password: _, ...userWithoutPassword } = user;

                    set({
                        user: userWithoutPassword,
                        token: `fake-jwt-token-${user.id}`,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return true;
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Login failed'
                    });
                    return false;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            setUser: (user) => {
                set({ user });
            },

            clearError: () => {
                set({ error: null });
            },

            // Add this method to check if current user owns a resource
            isOwner: (resourceUserId: string | number) => {
                const currentUser = get().user;
                if (!currentUser) return false;
                // Compare as strings to handle both string and number IDs
                return String(currentUser.id) === String(resourceUserId);
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

// Helper hook - update to include isOwner
export const useAuth = () => {
    const store = useAuthStore();

    return {
        user: store.user,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,
        error: store.error,
        isOwner: store.isOwner,
        login: store.login,
        logout: store.logout,
        clearError: store.clearError
    };
};