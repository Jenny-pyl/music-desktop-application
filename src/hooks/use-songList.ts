import { useEffect, useState } from "react";
import { IPC } from "@common/constants";

export interface SongList {
  listId: number;
  listName: string;
  userName: string;
  createTime: string;
  updateTime: string;
}

export function useSongList(userId: number | undefined) {
  const [songList, setSongList] = useState<SongList[]>();

  useEffect(() => {
    if(!userId) {
      setSongList([]);
      return
    }
    window.ipcRenderer.invoke(IPC.获取全部歌单, { userId }).then(res => {
      setSongList(res.data);
    })
  }, [])

  return [ songList ]
}