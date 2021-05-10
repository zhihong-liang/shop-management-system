import {request} from "network/request"

export function getreportsData() {
  return request({
    url: 'reports/type/1'
  })
}