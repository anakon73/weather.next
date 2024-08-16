import { type RouteRecordInfo, createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import FavoritePage from '@/pages/FavoritePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
    },
    {
      path: '/favorite',
      name: 'Favorite',
      component: FavoritePage,
    },
  ],
})

export interface RouteNamedMap {
  Home: RouteRecordInfo<'Home', '/'>
  Favorite: RouteRecordInfo<'Favorite', '/favorite'>
}

declare module 'vue-router' {
  interface TypesConfig {
    RouteNamedMap: RouteNamedMap
  }
}

export default router
