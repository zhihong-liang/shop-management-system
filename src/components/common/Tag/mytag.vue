<template>
  <div>
    <el-tag :key="tag"
            v-for="tag in Tags" 
            closable 
            @close="handleClose(tag)">{{tag}}</el-tag>
    <el-input
      class="input-new-tag"
      v-if="inputVisible"
      v-model="inputValue"
      ref="saveTagInput"
      size="small"
      @keyup.enter.native="handleInputConfirm"
      @blur="handleInputConfirm"
    ></el-input>
    <el-button v-else size="small" @click="showInput">+ New Tag</el-button>
  </div>
</template>
<script>
export default {
  name: 'mytag',
  data() {
    return {
      Tags: [],
      inputVisible: false,
      inputValue: ''
    }
  },
  props: {
    dynamicTags: {
      type: Object,
      default: {}
    }
  },
  methods: {
    toBeArray() {
      this.Tags = this.dynamicTags.attr_vals ? this.dynamicTags.attr_vals.split(' ') : []
    },
    handleClose(tag) {
      this.Tags.splice(this.Tags.indexOf(tag), 1)
      this.toBeString
      this.$emit("deleteParamsValue",this.dynamicTags)
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      })
    },
    handleInputConfirm() {
      if(this.inputValue.trim().length === 0){
        this.inputValue = ''
        this.inputVisible = false
        return
      } else {
        this.Tags.push(this.inputValue.trim())
        this.toBeString
        this.$emit("addParamsValue",this.dynamicTags)
        this.inputValue = ''
        this.inputVisible = false
      }
    }
  },
  computed: {
    toBeString() {
      this.dynamicTags.attr_vals = this.Tags.join(' ')
    }
  },
  mounted() {
    this.toBeArray()
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin-right: 15px;
  margin-top: 5px;
}
.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>