<template>

    <div>
        <Notification></Notification>
	</div>

</template>

<script>
import Notification from '../components/Notification.vue'

export default {
    name: 'Crypto',
	components: {
        Notification
    },
    data () {
        return {
            litecoin: {}
        }
    },
    created(){

    },
    watch: {
    },
    methods: {
    }
}
</script>

<style scoped>
</style>