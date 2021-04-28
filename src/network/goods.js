import {request} from './request'

export function getCateData(obj) {
  return request({
    url: 'categories',
    params: obj
  })
}

export function getParentCateDate() {
  return request({
    url: 'categories',
    params: {
      type: 3
    }
  })
}

export function addcategory(obj) {
  return request({
    method: 'post',
    url: 'categories',
    data: obj
  })
}
