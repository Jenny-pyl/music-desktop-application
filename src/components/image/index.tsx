import {
  useState,
  useEffect,
  useRef,
} from 'react'

/**
 * 更好的 <img /> 标签处理 - 懒加载、异常处理
 */
export default (props: React.ImgHTMLAttributes<HTMLImageElement> = {}) => {
  const { src: src2, ...omit } = props
  const [src, setSrc] = useState('./images/music-error.svg')
  const refImg = useRef(document.createElement('img'))

  useEffect(() => {
    if (src2) {
      refImg.current.onload = () => { setSrc(src2) }
      refImg.current.src = src2
    }

    return () => { refImg.current.onload = null }
  }, [])

  // TODO: 懒加载

  return <img src={src} {...omit} />
}
