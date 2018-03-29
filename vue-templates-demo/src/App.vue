<template>
  <div id="app">
    <h1>{{title}}</h1>
    <h2>{{msg}}</h2>

    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>
<style lang="css">

</style>
<script>
  import {getCookie,delCookie} from './util/cookie'
  export default {
    data(){
      return {
        title: 'vue-ssr-template-demo',
        msg: 'vue-ssr-template-demo'
      }
    },
    computed:{

    },
    beforeMount(){

    },
    beforeRouteEnter(to, from, next) {
    },
    methods:{

    },
    watch: {
      $route(){

      }
    },
  }
</script>
