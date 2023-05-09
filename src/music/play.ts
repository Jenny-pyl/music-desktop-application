import {
  type HowlOptions,
  Howl,
} from 'howler'

export interface PlayOptions extends HowlOptions {
  lyric: string
}

export interface PlayCallback {
  (evnet: PlayerEvnet, player: Player): void
}

export interface Player {
  src: HowlOptions['src']
  lyric: string
  player: Howl
  active: boolean
  timestamp: number
}

export type PlayerEvnet =
  | 'load'
  | 'loaderror'
  | 'playerror'
  | 'play'
  | 'end'
  | 'pause'
  | 'stop'
  | 'mute'
  | 'volume'
  | 'rate'
  | 'seek'
  | 'fade'
  | 'unlock'

/**
 * 单例模式更加可控
 */
export class Play {
  private constructor() { }
  private static players: Player[] = []
  private static callback: PlayCallback

  private static playerEvent(player: Player) {
    player.player.on('load', () => this.callback('load', this.getActivePlayer()!))
    player.player.on('loaderror', () => this.callback('loaderror', this.getActivePlayer()!))
    player.player.on('playerror', () => this.callback('playerror', this.getActivePlayer()!))
    player.player.on('play', () => this.callback('play', this.getActivePlayer()!))
    player.player.on('end', () => this.callback('end', this.getActivePlayer()!))
    player.player.on('pause', () => this.callback('pause', this.getActivePlayer()!))
    player.player.on('stop', () => this.callback('stop', this.getActivePlayer()!))
    player.player.on('mute', () => this.callback('mute', this.getActivePlayer()!))
    player.player.on('volume', () => this.callback('volume', this.getActivePlayer()!))
    player.player.on('rate', () => this.callback('rate', this.getActivePlayer()!))
    player.player.on('seek', () => this.callback('seek', this.getActivePlayer()!))
    player.player.on('fade', () => this.callback('fade', this.getActivePlayer()!))
    player.player.on('unlock', () => this.callback('unlock', this.getActivePlayer()!))
  }

  public static play(
    options: PlayOptions,
    callback: PlayCallback,
  ) {
    this.callback = callback

    const index = this.players.findIndex(item => item.src === options.src)
    let player: Player
    if (index > -1) {
      player = this.players[index]
    } else {
      player = {
        timestamp: Date.now(),
        player: new Howl({
          src: options.src,
          volume: 1,
          html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        }),
        active: true,
        src: options.src,
        lyric: options.lyric,
      }
      this.playerEvent(player)
      this.players.push(player)
    }

    this.pause()
    this.setActivePlayer(player)

    player.player.play()
    return player // ActivePlayer
  }

  public static getActivePlayer() {
    for (const player of this.players) {
      if (player.active) {
        return player
      }
    }
  }

  public static setActivePlayer(player: Player) {
    for (const _player of this.players) {
      _player.active = _player.src === player.src
    }
  }

  public static pause() {
    for (const player of this.players) {
      player.player.playing() && player.player.stop()
    }
  }
}
