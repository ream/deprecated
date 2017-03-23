<template>
  <div class="home">
    <el-button>Hello from Element!</el-button>
    <el-switch
      v-model="value1">
    </el-switch>
    <el-switch
      v-model="value2"
      on-color="#13ce66"
      off-color="#ff4949">
    </el-switch>
  </div>
</template>

<script>
  import { Button, Switch } from 'element-ui'

  export default {
    components: {
      'el-button': Button,
      'el-switch': Switch
    },
    data() {
      return {
        value1: true,
        value2: true
      }
    }
  }
</script>
