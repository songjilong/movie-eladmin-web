import request from '@/utils/request'

export function getMovies() {
  return request({
    url: 'api/movieInfo',
    method: 'get'
  })
}

export function getHalls() {
  return request({
    url: 'api/hall',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: 'api/schedule',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/schedule/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/schedule',
    method: 'put',
    data
  })
}

export default { add, edit, del, getMovies, getHalls }
