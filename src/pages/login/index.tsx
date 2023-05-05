import { FC } from 'react'
import { Outlet, useNavigate } from "react-router-dom"
import { Button, Input, Form, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import style from './index.module.scss'
import { IPC } from '@common/constants';
import { useUserStore } from '@/store';

const { Password } = Input;

const login: FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const submit = async () => {
    const formData = await form.validateFields();
    window.ipcRenderer.invoke(IPC.登录, formData).then(res => {
      if(res.code === 0) {
        message.error(res.msg);
      } else {
        message.success({
          content: res.msg,
          onClose() {
            setUser(res.data);
            navigate('/')
          }
        });
      }
    })
  }

  return <div className={style.login}>
    <div className="left"></div>
    <div className="right">
      <div className="title">欢迎登录</div>
      <div className="content">
        <Form form={form}>
          <Form.Item name='username' rules={[{required: true, message: '请输入用户名'}]}>
        <Input
          prefix={<UserOutlined style={{color: '#929292'}}/>}
          placeholder='请输入用户名'
        />
          </Form.Item>
          <Form.Item name='password' rules={[{required: true, message: '请输入密码'}]}>
        <Password
          prefix={<LockOutlined style={{color: '#929292'}}/>}
          placeholder='请输入密码'
        />
          </Form.Item>
        </Form>
        <div className='btns'>
          <Button style={{marginRight: 10}}>注册</Button>
          <Button type='primary' onClick={submit}>提交</Button>
        </div>
      </div>
    </div>
  </div>
}

export default login;