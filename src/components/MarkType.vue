<script setup lang="ts">
import { Router } from "vue-router";

const EntryList = ref([
  {
    icon: 'i-carbon-pen',
    span: 8,
    id: 0,
    describe: 'Text callout',
    url: '/mark/TextCallout'
  },
  {
    icon: 'i-carbon-volume-up-filled',
    span: 8,
    id: 1,
    describe: 'Audio callout',
    url: '/mark/TextCallout'
  },
  {
    icon: 'i-carbon-scalpel',
    span: 8,
    id: 2,
    describe: 'Scribe mark',
    url: '/mark/TextCallout'
  }
])
// 路由跳转
const router: Router = useRouter();
const jumpUrl = (url: string) => {
   router.push({
    path: url
   })
}
</script>

<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="item.span" v-for="item in EntryList" :key="item.id">
        <el-card shadow="hover" class="card-item" @click="jumpUrl(item.url)">
          <div>
            <span :class="item.icon" class="card-icon"/>
            <span class="card-describe">{{item.describe}}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<style lang="less" scoped>
.card-item {
  text-align: left;
  cursor: pointer;
  .card-icon {
    display: inline-block;
    margin-right: 100px;
  }
  .card-describe {
    vertical-align: text-bottom;
  }
}
</style>