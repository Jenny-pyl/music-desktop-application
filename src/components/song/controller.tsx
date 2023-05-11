import { useEffect, useRef, useState } from 'react'
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
import styles from './controller.module.scss'

export function ControllerPlay() {
  const {
    fetching,
    loading,
    playing,
    song,
    songList,
    play,
    pause,
    prev,
    next,
  } = usePlay()

  const clickPlay = () => {
    const _song = song ?? songList?.[0]
    _song && play(_song)
  }

  return (
    <Spin spinning={!!fetching || !!loading}>
      <div className={[styles['controller-play'], 'd-flex align-items-center justify-content-around'].join(' ')}>
        <ShangyishouIcon onClick={prev} />
        <span className='play-pause'>
          {playing
            ? <ZantingIcon onClick={pause} />
            : <BofangIcon onClick={clickPlay} />
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
  const refPanelLyric = useRef<HTMLDivElement>()

  useEffect(() => {
    if (!refPanelLyric.current) return

    const index = lyricLines.findIndex(l => l === lyricActiveLine)
    if (index <= -1) return

    const panelHeight = refPanelLyric.current.offsetHeight
    const lineHeight = 45.9 // 写死即可，动态获取耗费性能
    const showLines = panelHeight / 45.9 // 当前视口显示的行数
    const thanCurrentLines = index - showLines / 2 // 超过视口中间行数

    if (thanCurrentLines > 0) { // 歌词播放到了中间以下
      refPanelLyric.current.scrollTo({
        left: 0,
        top: lineHeight * thanCurrentLines + /* 偏移到中间位置 */lineHeight, // 滚动超过行数高度
        behavior: 'smooth',
      })
    }
  }, [lyricActiveLine])

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
          <div
            className='panel-lyric'
            ref={refPanelLyric as any}
          >
            {lyricLines.map((line, idx) => (
              <div
                key={idx}
                className={[
                  'lyric-line',
                  // TODO: 切歌时候歌词 “乱跳”
                  lyricActiveLine === line && 'active',
                ].filter(Boolean).join(' ')}
              >
                <span className={['line-text', !line.text && 'empty'].filter(Boolean).join(' ')}>{line.text || '-'}</span>
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
  const {
    playInfo,
  } = usePlay()

  return (
    <div className={[styles['controller-process'], 'h-100'].join(' ')}>
      <div
        className='process-bar h-100'
        style={{ width: `${(playInfo?.percent ?? 0) * 100}%` }}
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
          <span className='like cursor-pointer'>
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
