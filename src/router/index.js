import Vue from 'vue'
import Router from 'vue-router'
import Cryptocurrency from '@/pages/crypto'

Vue.use(Router)

var router = new Router({
    routes: [{
            path: '',
            component: Cryptocurrency
        },
        {
            path: '/crypto',
            component: Cryptocurrency
        }
    ]
});

export default router;