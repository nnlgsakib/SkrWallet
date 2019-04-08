import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

let router = new Router({
    mode: "history",
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: {
                keepAlive: true // 需要缓存
            }
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
        },
        {
            path: '/createwallet',
            name: 'createwallet',
            component: ()=>import('./views/CreateAccount'),
            meta: {
                // no need cached
                keepAlive: false
            }
        },
        {
            path: '/accesswallet',
            name: 'accesswallet',
            component: ()=>import('./views/AccessWallet'),
            meta: {
                keepAlive: false
            }
        },
        {
            path: '/sendtx',
            name: 'sendtx',
            component: ()=>import('./views/SendTx'),
            meta: {
                // need cached
                keepAlive: true
            }
        },
    ],
});


export default router;
