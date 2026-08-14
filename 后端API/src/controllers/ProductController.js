// src/controllers/ProductController.js - 商品控制器
const { Product, ProductImage, Category } = require('../models')
const Response = require('../utils/response')
const { Op } = require('sequelize')

class ProductController {
  /**
   * 获取商品列表
   */
  async list(req, res) {
    try {
      const {
        page = 1,
        pageSize = 10,
        category_id,
        is_hot,
        is_new,
        is_recommend,
        keyword,
        status = 1
      } = req.query

      const offset = (page - 1) * pageSize
      const where = { status }

      // 分类筛选
      if (category_id) {
        where.category_id = category_id
      }

      // 标签筛选
      if (is_hot) where.is_hot = is_hot
      if (is_new) where.is_new = is_new
      if (is_recommend) where.is_recommend = is_recommend

      // 关键词搜索
      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { subtitle: { [Op.like]: `%${keyword}%` } }
        ]
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'url'],
            limit: 5
          }
        ],
        order: [['sort', 'DESC'], ['created_at', 'DESC']],
        limit: parseInt(pageSize),
        offset: parseInt(offset)
      })

      return Response.paginate(res, rows, count, page, pageSize)
    } catch (error) {
      console.error('获取商品列表失败:', error)
      return Response.error(res, '获取商品列表失败', 500)
    }
  }

  /**
   * 获取商品详情
   */
  async detail(req, res) {
    try {
      const { id } = req.params

      const product = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'url', 'sort'],
            order: [['sort', 'ASC']]
          }
        ]
      })

      if (!product) {
        return Response.notFound(res, '商品不存在')
      }

      if (product.status === 0) {
        return Response.error(res, '商品已下架')
      }

      return Response.success(res, product)
    } catch (error) {
      console.error('获取商品详情失败:', error)
      return Response.error(res, '获取商品详情失败', 500)
    }
  }

  /**
   * 创建商品（管理员）
   */
  async create(req, res) {
    try {
      const productData = req.body

      // 创建商品
      const product = await Product.create(productData)

      // 如果有商品图片，创建图片记录
      if (productData.images && productData.images.length > 0) {
        const images = productData.images.map((url, index) => ({
          product_id: product.id,
          url,
          sort: index
        }))
        await ProductImage.bulkCreate(images)
      }

      return Response.success(res, product, '创建成功')
    } catch (error) {
      console.error('创建商品失败:', error)
      return Response.error(res, '创建商品失败', 500)
    }
  }

  /**
   * 更新商品（管理员）
   */
  async update(req, res) {
    try {
      const { id } = req.params
      const productData = req.body

      const product = await Product.findByPk(id)
      if (!product) {
        return Response.notFound(res, '商品不存在')
      }

      await product.update(productData)

      // 更新商品图片
      if (productData.images) {
        await ProductImage.destroy({ where: { product_id: id } })
        const images = productData.images.map((url, index) => ({
          product_id: id,
          url,
          sort: index
        }))
        await ProductImage.bulkCreate(images)
      }

      return Response.success(res, product, '更新成功')
    } catch (error) {
      console.error('更新商品失败:', error)
      return Response.error(res, '更新商品失败', 500)
    }
  }

  /**
   * 删除商品（管理员）
   */
  async delete(req, res) {
    try {
      const { id } = req.params

      const product = await Product.findByPk(id)
      if (!product) {
        return Response.notFound(res, '商品不存在')
      }

      await product.destroy()

      return Response.success(res, null, '删除成功')
    } catch (error) {
      console.error('删除商品失败:', error)
      return Response.error(res, '删除商品失败', 500)
    }
  }
}

module.exports = new ProductController()
