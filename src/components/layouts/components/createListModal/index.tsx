import { FC, useState } from 'react';
import { Input, Modal, message } from 'antd';
import { IPC } from '@common/constants';
import { UserInfo } from '../..';
import { locaStorage } from '@/utils';

const CreateListModal: FC<{
  modalOpen: boolean;
  setModalOpen: (val: boolean) => void;
}> = (props) => {
  const { modalOpen, setModalOpen} = props;
  const [listName, setListName]= useState<string>();
  const userInfo = locaStorage.get<UserInfo | null>('userInfo');

  const createList = () => {
    window.ipcRenderer.invoke(IPC.创建歌单, {userId: userInfo?.id, listName }).then(res => {
      if(res.code === 0) {
        message.error(res.msg);
      } else {
        message.success({
          content: res.msg,
        });
      }
    })
  }

  return (<Modal
    title='新建歌单'
    okText='创建'
    cancelText='取消'
    closable={false}
    open={modalOpen}
    onCancel={() => setModalOpen(false)}
    onOk={() => createList()}
  >
    <Input
      placeholder='请输入歌单名称'
      value={listName}
      onChange={(val) => setListName(val.target.value)}
    />
  </Modal>)
}

export default CreateListModal;