// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板', icon: 'DataLine' }
      },
      {
        path: 'statistics',
        name: 'DataAnalysis',
        component: () => import('@/views/DataAnalysis.vue'),
        meta: { title: '数据分析', icon: 'DataAnalysis' }
      },
      // 商品管理
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/product/ProductList.vue'),
        meta: { title: '商品列表', icon: 'Goods' }
      },
      {
        path: 'products/create',
        name: 'ProductCreate',
        component: () => import('@/views/product/ProductForm.vue'),
        meta: { title: '添加商品', hidden: true }
      },
      {
        path: 'products/edit/:id',
        name: 'ProductEdit',
        component: () => import('@/views/product/ProductForm.vue'),
        meta: { title: '编辑商品', hidden: true }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/product/CategoryList.vue'),
        meta: { title: '商品分类', icon: 'Menu' }
      },
      // 订单管理
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/order/OrderList.vue'),
        meta: { title: '订单列表', icon: 'List' }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/order/OrderDetail.vue'),
        meta: { title: '订单详情', hidden: true }
      },
      // 用户管理
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/user/UserList.vue'),
        meta: { title: '用户列表', icon: 'User' }
      },
      // 营销管理
      {
        path: 'coupons',
        name: 'Coupons',
        component: () => import('@/views/marketing/CouponList.vue'),
        meta: { title: '优惠券', icon: 'Ticket' }
      },
      {
        path: 'banners',
        name: 'Banners',
        component: () => import('@/views/marketing/BannerList.vue'),
        meta: { title: '轮播图', icon: 'Picture' }
      },
      {
        path: 'marketing/activities',
        name: 'Activities',
        component: () => import('@/views/marketing/ActivityList.vue'),
        meta: { title: '活动专区', icon: 'Present' }
      },
      {
        path: 'marketing/activities/create',
        name: 'ActivityCreate',
        component: () => import('@/views/marketing/ActivityForm.vue'),
        meta: { title: '新建活动', hidden: true }
      },
      {
        path: 'marketing/activities/:id/edit',
        name: 'ActivityEdit',
        component: () => import('@/views/marketing/ActivityForm.vue'),
        meta: { title: '编辑活动', hidden: true }
      },
      // 系统设置
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/system/Settings.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      },
      {
        path: 'admins',
        name: 'Admins',
        component: () => import('@/views/system/AdminList.vue'),
        meta: { title: '管理员', icon: 'UserFilled' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  console.log('路由导航:', to.path)
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 零食商城后台` : '零食商城后台管理系统'
  
  // 登录页直接放行
  if (to.path === '/login') {
    next()
    return
  }
  
  // 检查登录状态
  const token = localStorage.getItem('admin_token')
  if (!token) {
    next('/login')
    return
  }
  
  next()
})

export default router
