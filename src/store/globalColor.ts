import { create } from 'zustand';

type Store = {
  color: string;
  setColor: (color: string) => void;
}

export const useGlobalColor = create<Store>()((set) => ({
  color: '#73d13d',
  setColor: (newColor: string) => set(() => ({color: newColor}))
}))