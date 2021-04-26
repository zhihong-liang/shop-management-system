<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <slot name="first"></slot>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <slot name="second"></slot>  
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>
<script>
export default {
  name: 'breadcrumb'
}
</script>
<style lang="less" scoped>
  
</style>