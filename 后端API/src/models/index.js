// src/models/index.js - 模型入口文件
const { Sequelize } = require('sequelize')
const config = require('../config/database')

const env = process.env.NODE_ENV || 'development'
const dbConfig = config[env]

// 创建Sequelize实例
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
)

// 导入模型
const User = require('./User')(sequelize)
const Address = require('./Address')(sequelize)
const Category = require('./Category')(sequelize)
const Product = require('./Product')(sequelize)
const ProductImage = require('./ProductImage')(sequelize)
const Cart = require('./Cart')(sequelize)
const Order = require('./Order')(sequelize)
const OrderItem = require('./OrderItem')(sequelize)
const OrderLog = require('./OrderLog')(sequelize)
const Coupon = require('./Coupon')(sequelize)
const UserCoupon = require('./UserCoupon')(sequelize)
const PointsLog = require('./PointsLog')(sequelize)
const Banner = require('./Banner')(sequelize)
const Admin = require('./Admin')(sequelize)
const Config = require('./Config')(sequelize)

// 定义关联关系
// 用户 - 地址
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' })
Address.belongsTo(User, { foreignKey: 'user_id' })

// 分类 - 商品
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' })
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' })

// 商品 - 商品图片
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' })
ProductImage.belongsTo(Product, { foreignKey: 'product_id' })

// 用户 - 购物车
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' })
Cart.belongsTo(User, { foreignKey: 'user_id' })
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

// 用户 - 订单
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' })
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// 订单 - 订单商品
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' })
OrderItem.belongsTo(Order, { foreignKey: 'order_id' })
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

// 订单 - 订单日志
Order.hasMany(OrderLog, { foreignKey: 'order_id', as: 'logs' })
OrderLog.belongsTo(Order, { foreignKey: 'order_id' })

// 优惠券 - 用户优惠券
Coupon.hasMany(UserCoupon, { foreignKey: 'coupon_id', as: 'userCoupons' })
UserCoupon.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' })
User.hasMany(UserCoupon, { foreignKey: 'user_id', as: 'coupons' })
UserCoupon.belongsTo(User, { foreignKey: 'user_id' })

// 用户 - 积分记录
User.hasMany(PointsLog, { foreignKey: 'user_id', as: 'pointsLogs' })
PointsLog.belongsTo(User, { foreignKey: 'user_id' })

// 导出
module.exports = {
  sequelize,
  User,
  Address,
  Category,
  Product,
  ProductImage,
  Cart,
  Order,
  OrderItem,
  OrderLog,
  Coupon,
  UserCoupon,
  PointsLog,
  Banner,
  Admin,
  Config
}
