import request from '@/utils/request'

export function getHalls() {
  return request({
    url: 'api/hall',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: 'api/seat',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/seat/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/seat',
    method: 'put',
    data
  })
}

export default { add, edit, del, getHalls }
