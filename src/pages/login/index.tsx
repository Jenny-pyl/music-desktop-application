import { FC } from 'react'
import { Button, Input, Form } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import style from './index.module.scss'

const { Password } = Input;

const login: FC = () => {
  const [form] = Form.useForm();

  const submit = async () => {
    await form.validateFields()
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