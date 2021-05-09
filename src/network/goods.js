import {request} from './request'

// 商品分类页面的网络请求
// 获取商品分类页面的数据
export function getCateData(obj) {
  return request({
    url: 'categories',
    params: obj
  })
}

// 获取商品分类和分类参数的父级列表数据
export function getParentCateDate() {
  return request({
    url: 'categories',
    params: {
      type: 3
    }
  })
}

// 商品分类页面的 添加分类 接口
export function addcategory(obj) {
  return request({
    method: 'post',
    url: 'categories',
    data: obj
  })
}

// 分类参数页面的网络请求
// 获取目标参数的 动态参数 或 静态属性 的接口
export function getTargetParams(id,name) {
  return request({
    url: `/categories/${id}/attributes`,
    params: {
      sel: [name]
    }
  })
}

// 添加目标参数的 动态参数 或 静态属性 的接口
export function addTargetParams(id,obj) {
  return request({
    method: 'post',
    url: `/categories/${id}/attributes`,
    data: obj
  })
}

// 添加目标参数的 tag 标签
export function addTag(id,obj) {
  return request({
    method: 'put',
    url: `categories/${id}/attributes/${obj.attr_id}`,
    data: {
      attr_name: obj.attr_name,
      attr_sel: obj.attr_sel,
      attr_vals: obj.attr_vals
    }
  })
}

// 根据 ID 查询参数
export function queryTargetParams(id,obj) {
  return request({
    url: `/categories/${id}/attributes/${obj.attrId}`,
    params: {
      attr_sel: obj.attr_sel
    }
  })
}

// 编辑目标参数的 动态参数 或 静态属性 的接口
export function editTargetParams(id,obj) {
  return request({
    method: 'put',
    url: `categories/${id}/attributes/${obj.attrId}`,
    data: {
      attr_name: obj.attr_name,
      attr_sel: obj.attr_sel
    }
  })
}

// 删除目标参数的 动态参数 或 静态属性 的接口
export function deleteTargetParams(id,attrId) {
  return request({
    method: 'delete',
    url: `categories/${id}/attributes/${attrId}`
  })
}

// 商品列表页面的全部网络请求方法
// 获取页面的商品列表数据
export function getGoodsData(obj) {
  return request({
    url: 'goods',
    params: obj
  })
}

// 添加商品
export function addGoodsData(obj) {
  return request({
    method: 'post',
    url: 'goods',
    data: obj
  })
}

// 删除商品
export function deleteGoodsData(id) {
  return request({
    method: 'delete',
    url: `goods/${id}`
  })
}

