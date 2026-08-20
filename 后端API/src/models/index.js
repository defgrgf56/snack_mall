// src/models/index.js - 模型入口文件
const { Sequelize } = require('sequelize')
const config = require('../config/database')

const env = process.env.NODE_ENV || 'development'
const dbConfig = config[env]

// 创建Sequelize实例 - 强制使用utf8mb4字符集
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    ...dbConfig,
    dialectOptions: {
      ...dbConfig.dialectOptions,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
)

// 在连接后执行字符集设置
sequelize.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'")
  .then(() => console.log('✓ 字符集设置为 utf8mb4'))
  .catch(err => console.error('字符集设置失败:', err))

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
const { Refund, RefundLog } = require('./Refund')(sequelize)
const Notification = require('./Notification')(sequelize)
const Favorite = require('./Favorite')(sequelize)
const Seckill = require('./Seckill')(sequelize)
const Activity = require('./Activity')(sequelize)
const ActivityProduct = require('./ActivityProduct')(sequelize)
const Review = require('./Review')(sequelize)
const ReviewImage = require('./ReviewImage')(sequelize)

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

// 用户 - 消息通知
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' })
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// 用户 - 商品收藏
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' })
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
Product.hasMany(Favorite, { foreignKey: 'product_id', as: 'favorites' })
Favorite.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

// 订单 - 退款
Order.hasMany(Refund, { foreignKey: 'order_id', as: 'refunds' })
Refund.belongsTo(Order, { foreignKey: 'order_id', as: 'order' })
User.hasMany(Refund, { foreignKey: 'user_id', as: 'refunds' })
Refund.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// 退款 - 退款日志
Refund.hasMany(RefundLog, { foreignKey: 'refund_id', as: 'logs' })
RefundLog.belongsTo(Refund, { foreignKey: 'refund_id' })

// 秒杀 - 商品
Seckill.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })
Product.hasMany(Seckill, { foreignKey: 'product_id', as: 'seckills' })

// 活动 - 商品 (多对多)
Activity.belongsToMany(Product, { 
  through: ActivityProduct, 
  foreignKey: 'activity_id',
  otherKey: 'product_id',
  as: 'products' 
})
Product.belongsToMany(Activity, { 
  through: ActivityProduct, 
  foreignKey: 'product_id',
  otherKey: 'activity_id',
  as: 'activities' 
})

// 评价 - 用户
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' })

// 评价 - 商品
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' })

// 评价 - 订单
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order' })
Order.hasMany(Review, { foreignKey: 'order_id', as: 'reviews' })

// 评价 - 订单商品
Review.belongsTo(OrderItem, { foreignKey: 'order_item_id', as: 'orderItem' })
OrderItem.hasOne(Review, { foreignKey: 'order_item_id', as: 'review' })

// 评价 - 评价图片
Review.hasMany(ReviewImage, { foreignKey: 'review_id', as: 'images' })
ReviewImage.belongsTo(Review, { foreignKey: 'review_id', as: 'review' })

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
  Config,
  Refund,
  RefundLog,
  Notification,
  Favorite,
  Seckill,
  Activity,
  ActivityProduct,
  Review,
  ReviewImage
}
