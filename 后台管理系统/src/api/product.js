// src/api/product.js
import request from '@/utils/request'

/**
 * 获取商品列表
 */
export function getProductList(params) {
  return request({
    url: '/admin/products',
    method: 'get',
    params
  })
}

/**
 * 获取商品详情
 */
export function getProductDetail(id) {
  return request({
    url: `/admin/products/${id}`,
    method: 'get'
  })
}

/**
 * 创建商品
 */
export function createProduct(data) {
  return request({
    url: '/admin/products',
    method: 'post',
    data
  })
}

/**
 * 更新商品
 */
export function updateProduct(id, data) {
  return request({
    url: `/admin/products/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除商品
 */
export function deleteProduct(id) {
  return request({
    url: `/admin/products/${id}`,
    method: 'delete'
  })
}

/**
 * 上架/下架商品
 */
export function updateProductStatus(id, status) {
  return request({
    url: `/admin/products/${id}/status`,
    method: 'put',
    data: { status }
  })
}
