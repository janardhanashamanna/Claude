import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Address, User } from '../types';

interface UserState {
  user: User | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  addAddress: (address: Address) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      login: (name, email) =>
        set({ user: { name, email, addresses: [] } }),
      logout: () => set({ user: null }),
      addAddress: (address) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, addresses: [...state.user.addresses, address] } }
            : state
        ),
    }),
    { name: 'shopping-user' }
  )
);
