<template>
  <div id="app">
    <!-- 路由占位符 -->
    <keep-alive exclude="Login">
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
</style>
