import { type } from 'os';
import { create } from 'zustand';

export type UserInfo = {
  id: string;
  nickname: string;
  imgUrl: string;
  age: number;
  gender: 0 | 1;
  isVip: boolean;
  level: number;
}

type State = {
  user: UserInfo | null;
}

type Action = {
  setUser: (user: UserInfo | null) => void;
}

export const useUserStore = create<State & Action >((set) => ({
  user: null,
  setUser: (newUser: UserInfo | null) => set((state) => ({user: newUser}))
}))