// api/seckill.js - 秒杀管理API
import request from '@/utils/request'

/**
 * 获取秒杀列表
 */
export function getSeckillList(params) {
  return request({
    url: '/admin/seckills',
    method: 'get',
    params
  })
}

/**
 * 获取秒杀详情
 */
export function getSeckillDetail(id) {
  return request({
    url: `/admin/seckills/${id}`,
    method: 'get'
  })
}

/**
 * 创建秒杀
 */
export function createSeckill(data) {
  return request({
    url: '/admin/seckills',
    method: 'post',
    data
  })
}

/**
 * 更新秒杀
 */
export function updateSeckill(id, data) {
  return request({
    url: `/admin/seckills/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除秒杀
 */
export function deleteSeckill(id) {
  return request({
    url: `/admin/seckills/${id}`,
    method: 'delete'
  })
}

/**
 * 更新秒杀状态
 */
export function updateSeckillStatus(id, status) {
  return request({
    url: `/admin/seckills/${id}/status`,
    method: 'put',
    data: { status }
  })
}