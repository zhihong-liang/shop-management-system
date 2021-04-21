<template>
  <div>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :page-sizes="[1,2,3,4]"
      :page-size="queryInfo.pagesize"
      :current-page="queryInfo.pagenum"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>
<script>
export default {
  name: 'pagination',
  props: {
    queryInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    total: {
      type: Number,
      default() {
        return 0
      }
    }
  },
  methods: {
    // 监听 pagesize 改变的事件
    handleSizeChange(newsize) {
      this.$emit('handleSizeChange', newsize)
    },

    // 监听 页码值 改变的事件
    handleCurrentChange(newpage) {
      this.$emit('handleCurrentChange', newpage)
    },
  },
}
</script>
<style lang="less" scoped>
  
</style>