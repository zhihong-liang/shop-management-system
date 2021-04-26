import {request} from './request'

export function getRightsData() {
  return request({
    url: '/rights/list'
  })
}

// 获取roles表格数据
export function getRolesData() {
  return request({
    url: '/roles'
  })
}

// 添加roles角色
export function addRoles(obj) {
  return request({
    method: 'post',
    url: '/roles',
    data: obj
  })
}

// 删除roles角色
export function deleteRoles(Rolesid) {
  return request({
    method: 'delete',
    url: `/roles/${Rolesid}`
  })
}

// 编辑roles角色
export function editRoles(Rolesobj) {
  return request({
    method: 'put',
    url: `/roles/${Rolesobj.id}`,
    data: {
      id: Rolesobj.id,
      roleName: Rolesobj.roleName,
      roleDesc: Rolesobj.roleDesc
    }
  })
}

// 删除角色指定权限
export function removeRolesPower(role,rightid) {
  return request({
    method: 'delete',
    url: `/roles/${role.id}/rights/${rightid}`
  })
}

// 获取所有权限列表
export function getAllRightList() {
  return request({
    url: '/rights/tree'
  })
}

// 角色授权data
export function RoleAuthorization(roleId, rids) {
  return request({
    method: 'post',
    url: `/roles/${roleId}/rights`,
    data: {
      rids: rids
    }
  })
}

