import { useState } from 'react'
import { Drawer, Spin } from 'antd'
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
    fetching,
    loading,
    playing,
    song,
    play,
    pause,
    prev,
    next,
  } = usePlay()

  return (
    <Spin spinning={!!fetching || !!loading}>
      <div
        className={[styles['controller-play'], 'd-flex align-items-center justify-content-around'].join(' ')}
        style={{ color }}
      >
        <ShangyishouIcon onClick={prev} />
        <span className='play-pause'>
          {playing
            ? <ZantingIcon onClick={pause} />
            : <BofangIcon onClick={() => song && play(song)} />
          }
        </span>
        <XiayishouIcon onClick={next} />
      </div>
    </Spin>
  )
}

export function ControllerPanel(props: {
  onClose: () => void,
}) {
  const {
    song,
    lyricLines,
    lyricActiveLine,
    playing,
  } = usePlay()

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
                className={['lyric-line', lyricActiveLine === line && 'active'].filter(Boolean).join(' ')}
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
    song,
    playing,
    lyricActiveLine,
  } = usePlay()
  const [visiblePanel, setVisiblePanel] = useState(false)

  return (
    <div className={[styles['footer-controller'], 'h-100'].join(' ')}>
      <div className={styles['process-box']}>
        <ControllerProcess />
      </div>
      <div className='bar d-flex align-items-center justify-content-center h-100'>
        <div className='bar-left d-flex align-items-center text-truncate'>
          <span
            className={['song-img cursor-pointer ml-3', playing && 'animate-rotate'].filter(Boolean).join(' ')}
            onClick={() => setVisiblePanel(!visiblePanel)}
          >
            <Image src={song?.img_url} />
          </span>
          <span className='song-author ml-2'>
            {song ? `${song.title}: ${song.artist}` : '--'}
          </span>
          <span className='song-lyric ml-2'>
            {lyricActiveLine?.text}
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
