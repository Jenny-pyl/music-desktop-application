import {
  type HowlOptions,
  Howl,
} from 'howler'

/**
 * 单例模式更加可控
 */
export class Player {
  private constructor() { }
  private static instance = new Player

  private static players: {
    src: HowlOptions['src']
    player: Howl
    active: boolean
    timestamp: number
  }[] = []

  public static getInstance(options: HowlOptions) {
    const index = this.players.findIndex(item => item.src === options.src)
    if (index > -1) {
      for (const item of this.players) {
        item.active = false
      }
      this.players[index].active = true
    } else {
      const player = {
        timestamp: Date.now(),
        player: new Howl({
          src: options.src,
          volume: 1,
          html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        }),
        active: true,
        src: options.src,
      }
      for (const item of this.players) {
        item.active = false
      }
      this.players.push(player)
    }

    return this.instance
  }

  play() {
    for (const player of Player.players) {
      if (player.active) {
        // 播放 active player
        !player.player.playing() && player.player.play()
      } else {
        player.player.playing() && player.player.stop()
      }
    }
  }
}
