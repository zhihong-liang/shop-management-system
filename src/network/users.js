import {request} from "./request"

// 获取用户列表接口
export function getUsers(obj) {
  return request({
    url: '/users',
    params: obj
  })
}

// 修改用户状态接口
export function changeUserState(state) {
  return request({
    method: 'put',
    url: `users/${state.id}/state/${state.mg_state}`,
  })
}

// 添加用户接口
export function addUser(obj) {
  return request({
    method: 'post',
    url: '/users',
    data: obj
  })
}

// 根据id查询用户信息接口
export function queryUser(id) {
  return request({
    url: `/users/${id}`
  })
}

// 编辑用户接口
export function editUser(obj) {
  return request({
    method: 'put',
    url: `/users/${obj.id}`,
    data: {
      email: obj.email,
      mobile: obj.mobile
    }
  })
}

// 删除用户接口
export function deleteUser(id) {
  return request({
    method: 'delete',
    url: `/users/${id}`
  })
}


export function Distselector(obj) {
  return request({
    method: 'put',
    url: `/users/${obj.id}/role`,
    data: {
      rid: obj.rid
    }
  })
}

