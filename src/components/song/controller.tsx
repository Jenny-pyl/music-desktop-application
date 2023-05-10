import { useMemo, useState } from 'react'
import { Drawer } from 'antd'
import { CloseCircleOutlined } from '@ant-design/icons'
import {
  BofangIcon,
  ZantingIcon,
  ShangyishouIcon,
  XiayishouIcon,
  AixinIcon,
} from '@/components/icons'
import Image from '@/components/image'
import usePlay from '@/hooks/use-play'
import { useGlobalColor } from '@/store'
import styles from './controller.module.scss'

export function ControllerPlay() {
  const { color } = useGlobalColor()
  const {
    playing,
    song,
    play,
    pause,
  } = usePlay()

  return (
    <div
      className={[styles['controller-play'], 'd-flex align-items-center justify-content-around'].join(' ')}
      style={{ color }}
    >
      <ShangyishouIcon />
      <span className='play-pause'>
        {playing
          ? <ZantingIcon onClick={pause} />
          : <BofangIcon onClick={() => song && play(song)} />
        }
      </span>
      <XiayishouIcon />
    </div>
  )
}

export function ControllerPanel(props: {
  onClose: () => void,
}) {
  const {
    song,
    lyric,
    playing,
    playInfo,
  } = usePlay()
  const lyricLines = useMemo(() => lyric ? parseLyric(lyric) : [], [lyric])
  const activeLine = useMemo(() => {
    let closest = lyricLines[0]
    const seek = playInfo?.seek ?? 0
    const delay = 4
    for (const line of lyricLines) {
      if (Math.abs(line.time - seek) < Math.abs(closest.time - seek) - delay) {
        closest = line
      }
    }
    return closest
  }, [lyricLines, playInfo?.seek])

  return (
    <div className={[styles['controller-panel'], 'd-flex flex-column h-100'].join(' ')}>
      <div
        className='panel-header text-right'
        onClick={props.onClose}
      >
        <span className='panel-close d-inline-block p-3 cursor-pointer'>
          <CloseCircleOutlined />
        </span>
      </div>
      <div className='panel-main d-flex'>
        <div className='panel-left h-100 d-flex align-items-center justify-content-center'>
          <div className={['panel-img', playing && 'animate-rotate'].filter(Boolean).join(' ')}>
            <Image src={song?.img_url} />
          </div>
        </div>
        <div className='panel-right h-100 d-flex flex-column pb-3'>
          <div className='panel-song-info pb-3'>
            <h2>{song?.title ?? '--'}</h2>
            <div>
              <span>歌手: {song?.artist ?? '-'}</span>
              <span className='ml-3'>专辑: {song?.album ?? '-'}</span>
            </div>
          </div>
          <div className='panel-lyric'>
            {lyricLines.map((line, idx) => (
              <div
                key={idx}
                className={['lyric-line', activeLine === line && 'active'].filter(Boolean).join(' ')}
              >
                <span className='line-text'>{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='panel-footer d-flex align-items-center justify-content-around'>
        <div className={styles['process-box']}>
          <ControllerProcess />
        </div>
        <ControllerPlay />
      </div>
    </div>
  )
}

export function ControllerProcess() {
  const { color } = useGlobalColor()
  const {
    playInfo,
  } = usePlay()

  return (
    <div className={[styles['controller-process'], 'h-100'].join(' ')}>
      <div
        className='process-bar h-100'
        style={{
          backgroundColor: color,
          width: `${(playInfo?.percent ?? 0) * 100}%`,
        }}
      />
    </div>
  )
}

export function FooterController() {
  const {
    playing,
    song,
  } = usePlay()
  const [visiblePanel, setVisiblePanel] = useState(false)

  return (
    <div className={[styles['footer-controller'], 'h-100'].join(' ')}>
      <div className={styles['process-box']}>
        <ControllerProcess />
      </div>
      <div className='bar d-flex align-items-center justify-content-center h-100'>
        <div className='bar-left d-flex align-items-center'>
          <span
            className={['song-img cursor-pointer ml-3', playing && 'animate-rotate'].filter(Boolean).join(' ')}
            onClick={() => setVisiblePanel(!visiblePanel)}
          >
            <Image src={song?.img_url} />
          </span>
          <span className='song-author ml-3'>
            {song ? `${song.title}: ${song.artist}` : '--'}
          </span>
        </div>
        <ControllerPlay />
        <div className='bar-right d-flex align-items-center'>
          <span className='like'>
            <AixinIcon />
          </span>
        </div>
      </div>

      <Drawer
        destroyOnClose
        placement='bottom'
        closable={false}
        onClose={() => setVisiblePanel(false)}
        open={visiblePanel}
        height='100vh'
        className='footer-controller-drawer'
      >
        <ControllerPanel onClose={() => setVisiblePanel(false)} />
      </Drawer>
    </div>
  )
}

// ------------------------------------------------------------------------------

// https://dev.to/mcanam/javascript-lyric-synchronizer-4i15
// lrc (String) - lrc file text
function parseLyric(lrc: string) {
  // will match "[00:00.00] ooooh yeah!" or "[00:00.0000] ooooh yeah!"
  // note: i use named capturing group
  const regex = /^\[(?<time>\d{2}:\d{2}(.\d{2,4})?)\](?<text>.*)/;

  // split lrc string to individual lines
  const lines = lrc.split("\n");

  const output: { time: number, text: string }[] = [];

  lines.forEach(line => {
    const match = line.match(regex);

    // if doesn't match, return.
    if (match == null) return;

    const { time, text } = match.groups!;

    output.push({
      time: parseTime(time),
      text: text.trim()
    });
  });

  return output;
}

// parse formated time
// "03:24.73" => 204.73 (total time in seconds)
function parseTime(time: string) {
  const minsec = time.split(":");

  const min = parseInt(minsec[0]) * 60;
  const sec = parseFloat(minsec[1]);

  return min + sec;
}
