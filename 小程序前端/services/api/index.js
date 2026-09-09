// services/api/index.js - API 统一导出

const auth = require('./auth')
const product = require('./product')
const cart = require('./cart')
const order = require('./order')
const address = require('./address')
const user = require('./user')
const review = require('./review')
const refund = require('./refund')
const favorite = require('./favorite')
const coupon = require('./coupon')
const activity = require('./activity')
const notification = require('./notification')
const feedback = require('./feedback')

module.exports = {
  auth,
  product,
  cart,
  order,
  address,
  user,
  review,
  refund,
  favorite,
  coupon,
  activity,
  notification,
  feedback
}