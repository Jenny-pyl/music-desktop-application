import { create } from 'zustand';

type Store = {
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  currendId: string;
}

export const useMusicInfo = create<Store>()((set) => ({
  playing: false,
  setPlaying: (playing: boolean) => set(() => ({playing})),
  currendId: '1',
}))
