import {
  type HowlOptions,
  Howl,
} from 'howler'

export interface PlayOptions extends HowlOptions {
  lyric: string
  event: (name: EvnetName, player: Player) => void
  interval: (args: {
    timestamp: number
    player: Player
  }) => void
}

export interface Player {
  src: HowlOptions['src']
  lyric: string
  player: Howl
  active: boolean
  timestamp: number
}

export type EvnetName =
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
  private static options: PlayOptions
  private static interval: PlayOptions['interval']
  private static interval_timer: any
  private static interval_ms = 1000

  private static event(...args: Parameters<PlayOptions['event']>) {
    const [name, player] = args
    if (([
      'loaderror',
      'playerror',
      'end',
      'pause',
      'stop',
    ] as EvnetName[]).includes(name)) {
      clearTimeout(this.interval_timer)
    } else if (name === 'play') {
      this.runInterval(player)
    }

    this.options.event(...args)
  }

  private static runEvent(player: Player) {
    player.player.on('load', () => this.event('load', player))
    player.player.on('loaderror', () => this.event('loaderror', player))
    player.player.on('playerror', () => this.event('playerror', player))
    player.player.on('play', () => this.event('play', player))
    player.player.on('end', () => this.event('end', player))
    player.player.on('pause', () => this.event('pause', player))
    player.player.on('stop', () => this.event('stop', player))
    player.player.on('mute', () => this.event('mute', player))
    player.player.on('volume', () => this.event('volume', player))
    player.player.on('rate', () => this.event('rate', player))
    player.player.on('seek', () => this.event('seek', player))
    player.player.on('fade', () => this.event('fade', player))
    player.player.on('unlock', () => this.event('unlock', player))
  }

  private static runInterval(player: Player) {
    const _this = this;
    (function callback() {
      _this.interval_timer = setTimeout(() => {
        _this.options.interval({
          timestamp: Date.now(),
          player,
        })
        callback()
      }, _this.interval_ms)
    })()
  }

  public static play(options: PlayOptions) {
    this.options = options

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
      this.runEvent(player)
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
