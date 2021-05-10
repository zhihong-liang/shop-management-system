import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import('../components/Login')
const Home = () => import('../views/Home')
const Welcome = () => import('../views/Welcome')
const User = () => import('../views/user/Users')
const Rights = () => import('../views/rights/Rights')
const Roles = () => import('../views/rights/Roles')
const Category = () => import('../views/goods/Category')
const GoodsParams = () => import('../views/goods/goodsParams')
const GoodsList = () => import('../views/goods/goodsList')
const AddGoods = () => import('../views/goods/addGoods')
const Order = () => import('../views/order/Order')

Vue.use(VueRouter)

const routes = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path:'/users',
        component: User
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: "/categories",
        component: Category
      },
      {
        path: '/params',
        component: GoodsParams
      },
      {
        path: '/goods',
        component: GoodsList,
      },
      {
        path: '/goods/add',
        component: AddGoods
      },
      {
        path: '/orders',
        component: Order
      }
    ]
  },
  
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径F
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //      next() 放行     next('/login')  强制跳转

  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router