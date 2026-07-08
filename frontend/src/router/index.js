import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('../pages/HomeView.vue')
    },
    {
        path: '/warbands',
        component: () => import('../pages/WarbandsView.vue')
    },
    {
        path: '/warbands/:id',
        component: () => import('../pages/WarbandDetailView.vue')
    },
    {
        path: '/bestiary',
        component: () => import('../pages/BestiaryView.vue')
    },
    {
        path: '/spells',
        component: () => import('../pages/SpellsView.vue')
    },
    {
        path: '/magic-items',
        component: () => import('../pages/MagicItemsView.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
                // Add a small delay to ensure the element exists
                top: 0
            }
        }
        
        // Otherwise scroll to top
        return { top: 0 }
    }
})

export default router