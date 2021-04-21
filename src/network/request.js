import axios from 'axios'

export function request(config) {
  const instance = axios.create({
    baseURL: 'http://www.ysqorz.top:8888/api/private/v1',
    timeout: 5000
  })

  // axios的拦截器
  instance.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  }, err => {

  });

  instance.interceptors.response.use(res => {
    return res.data
  }, err => {
    console.log(err);
  });

  return instance(config)
}