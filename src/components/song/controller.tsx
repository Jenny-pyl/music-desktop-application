import { useState } from 'react'
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
  const { color } = useGlobalColor();
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
  const { color } = useGlobalColor();
  const {
    song,
    lyric,
    playing,
  } = usePlay()

  return (
    <div
      className={[styles['controller-panel'], 'd-flex flex-column h-100'].join(' ')}
      style={{ color }}
    >
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
        <div className='panel-right h-100 d-flex flex-column'>
          <div className='panel-song-info pb-3'>
            <h2>{song?.title ?? '--'}</h2>
            <div>
              <span>歌手: {song?.artist ?? '-'}</span>
              <span className='ml-3'>专辑: {song?.album ?? '-'}</span>
            </div>
          </div>
          <div className='pang-lyric overflow-auto'>
            {lyric?.split('\n').map((line, idx) => (
              <div key={idx}>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='panel-footer d-flex align-items-center justify-content-around'>
        <div className='process-box'>
          <ControllerProcess />
        </div>
        <ControllerPlay />
      </div>
    </div>
  )
}

export function ControllerProcess() {
  const { color } = useGlobalColor();
  const {
    playInfo,
  } = usePlay()

  console.log((playInfo?.percent ?? 0) * 100)

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
  const { color } = useGlobalColor();
  const {
    playing,
    song,
  } = usePlay()
  const [visiblePanel, setVisiblePanel] = useState(false)

  return (
    <div className={[styles['footer-controller'], 'h-100'].join(' ')}>
      <div className='process-box'>
        <ControllerProcess />
      </div>
      <div
        className='bar d-flex align-items-center justify-content-center h-100'
        style={{ color }}
      >
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