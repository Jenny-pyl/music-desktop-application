import { FC } from 'react';
import { useParams } from 'react-router-dom';
import style from './index.module.scss'

const myCreate: FC = () => {
  const { id } = useParams();

  return <div className={style.myCreate}>
    myCreate{id}
  </div>
}

export default myCreate;