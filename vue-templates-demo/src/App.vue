<template>
  <div id="app">
    <el-container>
      <el-header>
        <img class="logo" src="../public/logo-120.png" width="40" alt="LOGO">
        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" background-color="#B3C0D1" text-color="#fff" active-text-color="#1C84EF" @select="handleSelect">
          <el-menu-item index="1">文档</el-menu-item>
          <el-submenu index="2">
            <template slot="title">操作</template>
            <el-menu-item index="2-1">选项1</el-menu-item>
            <el-menu-item index="2-2">选项2</el-menu-item>
            <el-menu-item index="2-3">选项3</el-menu-item>
          </el-submenu>
          <el-menu-item index="3" disabled>操作</el-menu-item>
          <el-menu-item index="4"><a href="javascript:void(0);" target="_blank">订单管理</a></el-menu-item>
        </el-menu>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu
            default-active="1"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            router="true">
            <el-menu-item index="1" route="index">
              <i class="el-icon-home"></i>
              <span slot="title">首页</span>
            </el-menu-item>
            <el-menu-item index="2">
              <i class="el-icon-menu"></i>
              <span slot="title">导航二</span>
            </el-menu-item>
            <el-menu-item index="3">
              <i class="el-icon-document"></i>
              <span slot="title">导航三</span>
            </el-menu-item>
            <el-menu-item index="4">
              <i class="el-icon-setting"></i>
              <span slot="title">导航四</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-container>
          <el-main>
            <transition name="fade" mode="out-in">
              <router-view></router-view>
            </transition>
          </el-main>
          <el-footer>Footer</el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>
<script>
  import {getCookie,delCookie} from './util/cookie'
  export default {
    data(){
      return {
        activeIndex: '1',
        activeIndex2: '1',
        title: 'vue-ssr-template-demo',
        msg: 'vue-ssr-template-demo',
        isCollapse: true
      }
    },
    computed:{

    },
    beforeMount(){

    },
    beforeRouteEnter(to, from, next) {
    },
    methods:{
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    },
    watch: {
      $route(){

      }
    },
  }
</script>
