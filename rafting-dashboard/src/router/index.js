import Vue from 'vue'
import Router from 'vue-router'
import RaftingDashboard from '@/components/RaftingDashboard'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'RaftingDashboard',
      component: RaftingDashboard
    }
  ]
})
