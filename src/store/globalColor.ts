import { create } from 'zustand'
import { locaStorage } from '@/utils'

export const LOCAL_KEY = 'theme-primary-color'
export const DEFAULT_COLOR = '#73d13d'

type Store = {
  color: string;
  setColor: (color: string) => void;
}

export const useGlobalColor = create<Store>()((set) => ({
  color: locaStorage.get(LOCAL_KEY) ?? DEFAULT_COLOR,
  setColor(newColor: string) {
    locaStorage.set(LOCAL_KEY, newColor)
    set({ color: newColor })
  },
}))
