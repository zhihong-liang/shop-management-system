import {request} from "./request"

export function FromLogin(data) {
  return request({
    method: 'post',
    url: '/login',
    data: {
      username: data.username,
      password: data.password
    }
  })
}
