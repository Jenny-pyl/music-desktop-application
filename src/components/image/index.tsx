import {
  useState,
  useEffect,
  useRef,
} from 'react'

export const coverImage = './images/music-error.svg'

/**
 * 更好的 <img /> 标签处理 - 懒加载、异常处理
 */
export default (props: React.ImgHTMLAttributes<HTMLImageElement> & {
  srcError?: string
} = {}) => {
  const { src: src2, ...omit } = props
  const [src, setSrc] = useState(props.srcError ?? coverImage)
  const refImg = useRef(document.createElement('img'))

  useEffect(() => {
    if (src2) {
      refImg.current.onload = () => { setSrc(src2) }
      refImg.current.src = src2
    }

    return () => { refImg.current.onload = null }
  }, [src2])

  // TODO: 懒加载

  return <img src={src} {...omit} />
}
