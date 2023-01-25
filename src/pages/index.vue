<script setup lang="ts">
defineOptions({
  name: 'IndexPage',
})
</script>

<template>
  <div>
    <MarkType class="mark-type"></MarkType>
  </div>
</template>
<style lang="less" scoped>
.mark-type {
  margin: 200px auto;
  width: 1200px;
}
</style>

<route lang="yaml">
meta:
  layout: home
</route>
