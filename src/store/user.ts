import { create } from 'zustand';

export type UserInfo = {
  id: string;
  username: string;
  imgUrl: string;
  age: number;
  gender: 0 | 1;
  isVip: boolean;
  level: number;
}

type Store = {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
}

export const useUserStore = create<Store>()((set) => ({
  user: null,
  setUser: (newUser: UserInfo | null) => set(() => ({user: newUser}))
}))