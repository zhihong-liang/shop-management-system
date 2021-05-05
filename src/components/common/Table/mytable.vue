<template>
  <div>
    <el-table :data="data" border>
      <slot name="expand"></slot>
      <el-table-column type="index" label="#" width="50px" />
      <el-table-column :label="name" prop="attr_name"></el-table-column>
      <el-table-column label="操作">
        <template v-slot:default="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="EditBtnClick(scope.row.attr_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="DeleteBtnClick(scope.row.attr_id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'mytable',
  props: {
    data: {
      type: Array,
      default() {
        return []
      }
    },
    name: {
      type: String,
      default() {
        return ''
      }
    },
  },
  methods: {
    EditBtnClick(attrid) {
      this.$emit('showEditDialog',true,attrid)
    },
    DeleteBtnClick(attrid) {
      this.$emit('isDeleteParams',attrid)
    }
  }
}
</script>
<style lang="less" scoped>
</style>