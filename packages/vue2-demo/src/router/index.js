import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/new-channel',
      name: 'new-channel',
      component: () => import('@/components/new-channel.vue'),
    },
    {
      path: '/layout-1',
      name: 'layout-1',
      component: () => import('@/components/layout-1.vue'),
    }
  ]
})
