<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="~assets/img/logo.png" alt />
        <span>电商管理系统</span>
      </div>
      <div>
        <span>你好，{{Username}}</span>
        <el-button type="info" @click="logout">退出</el-button>
      </div>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>

      <!-- 侧边栏 -->
      <el-aside :width="iscollapse ? '64px' : '200px'" ref="elaside">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744"
                 text-color="#fff" 
                 :unique-opened="true"
                 :collapse="iscollapse"
                 :collapse-transition="false"
                 :router="true"
                 :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu v-for="(item,index) in menuList" :key="index" :index="item.id + ''">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              v-for="(item2,index2) in item.children"
              :key="index2"
              :index="'/' + item2.path"
              @click="saveNavState('/' + item2.path)"
            >
              <i class="el-icon-menu"></i>
              <span>{{item2.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容主体 -->
      <el-main>

        <!-- 路由占位符 -->
        <router-view v-if="isRouterAlive"></router-view>

      </el-main>
    </el-container>
  </el-container>
</template>

<script>

import {getMenu} from 'network/home'

export default {
  name: 'Home',
  provide (){
    return {
      reload: this.reload
    }
  },
  data() {
    return {
      Username: null,
      menuList: [],
      iconsObj: {
        '125': 'el-icon-user-solid',
        '103': 'el-icon-coin',
        '101': 'el-icon-s-goods',
        '102': 'el-icon-s-order',
        '145': 'el-icon-s-marketing'
      },
      // 是否折叠
      iscollapse: false,
      // 被激活的链接地址
      activePath: '',
      isRouterAlive: true   // 局部刷新布尔值
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push('/login')  
    },
    getMenuList() {
      getMenu().then(res => {
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menuList = res.data
      })
    },
    // 点击按钮，菜单栏折叠收起
    toggleCollapse() {
      this.iscollapse = !this.iscollapse
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    },
    // 局部刷新的方法
    reload() {
      this.isRouterAlive = false
      this.$nextTick(function() {
        this.isRouterAlive = true
      })  
    }
  },
  created() {
    this.getMenuList();

    this.activePath = window.sessionStorage.getItem('activePath')

    this.$bus.$off('getName')
    this.$bus.$on('getName', data => {
      window.sessionStorage.setItem('username',data)
    })
    this.Username = window.sessionStorage.getItem('username')
  },
  mounted() {
    
  },
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    img {
      width: 200px;
      height: 60px;
    }
    span {
      font-size: 25px;
      color: #fff;
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  height: 100%;
  .el-menu {
    border: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.toggle-button {
  background-color: #4a5064;
  text-align: center;
  cursor: pointer;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  letter-spacing: 0.2em;
}
</style>