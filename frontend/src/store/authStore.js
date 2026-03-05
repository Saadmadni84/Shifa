import { create } from 'zustand'

export const useAuthStore = create(() => ({
  token: null,
  setToken: () => undefined,
}))
