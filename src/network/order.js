import {request} from 'network/request'

// 请求全部订单数据
export function getOrderData(obj) {
  return request({
    url: '/orders',
    params: obj
  })
}

// 请求目标订单的物流信息
export function getTargetLogisticsInfo() {
  return request({
    url: '/kuaidi/1106975712662'
  })
}
