import request from '@/utils/request'

// 矿机状态
export function machineStat(params) {
  return request({
    url: '/api/v1/machine/stat',
    method: 'get',
    params
  })
}

// 矿机列表
export function machineList(data) {
  return request({
    url: '/api/v1/machine/list',
    method: 'post',
    data,
  })
}

// 新增矿机
export function machineAdd(data) {
  return request({
    url: '/api/v1/machine/add',
    method: 'post',
    data
  })
}

//发送token给矿机(开启挖矿)
export function machineToken(data) {
    return request({
      url: '/api/v1/machine/token',
      method: 'post',
      data
    })
  }