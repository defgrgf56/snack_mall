// api/activity.js - 活动专区API
import request from '@/utils/request'

/**
 * 获取活动列表
 */
export function getActivityList(params) {
  return request({
    url: '/admin/activities',
    method: 'get',
    params
  })
}

/**
 * 获取活动详情
 */
export function getActivityDetail(id) {
  return request({
    url: `/admin/activities/${id}`,
    method: 'get'
  })
}

/**
 * 创建活动
 */
export function createActivity(data) {
  return request({
    url: '/admin/activities',
    method: 'post',
    data
  })
}

/**
 * 更新活动
 */
export function updateActivity(id, data) {
  return request({
    url: `/admin/activities/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除活动
 */
export function deleteActivity(id) {
  return request({
    url: `/admin/activities/${id}`,
    method: 'delete'
  })
}

/**
 * 更新活动状态
 */
export function updateActivityStatus(id, status) {
  return request({
    url: `/admin/activities/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 获取活动关联商品列表
 */
export function getActivityProducts(activityId, params) {
  return request({
    url: `/admin/activities/${activityId}/products`,
    method: 'get',
    params
  })
}

/**
 * 添加活动商品
 */
export function addActivityProduct(activityId, data) {
  return request({
    url: `/admin/activities/${activityId}/products`,
    method: 'post',
    data
  })
}

/**
 * 移除活动商品
 */
export function removeActivityProduct(activityId, productId) {
  return request({
    url: `/admin/activities/${activityId}/products/${productId}`,
    method: 'delete'
  })
}

/**
 * 批量添加活动商品
 */
export function batchAddActivityProducts(activityId, data) {
  return request({
    url: `/admin/activities/${activityId}/products/batch`,
    method: 'post',
    data
  })
}

/**
 * 更新活动商品
 */
export function updateActivityProduct(activityId, productId, data) {
  return request({
    url: `/admin/activities/${activityId}/products/${productId}`,
    method: 'put',
    data
  })
}