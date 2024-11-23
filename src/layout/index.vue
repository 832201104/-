<template>
  <div class="container">
    <div class="header" style="background-color: #545c64;">
      <div class="logo">通讯录系统</div>
    </div>
    <main>
      <el-row style="width: 100%;">
        <el-col :span="3">
          <el-menu background-color="#545c64" :default-active="route.path" :router="true">
            <el-menu-item index="/contacts">
              <span>全部联系人</span>
            </el-menu-item>
            <el-menu-item index="/contacts/favorites">
              <span>我的收藏</span>
            </el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="21">
          <div :style="{ height: 'calc(100% - 40px)', padding: '20px', background: `url('${imagePath}')` }">
            <router-view />
          </div>
        </el-col>
      </el-row>
    </main>
  </div>
</template>

<script setup>
import imagePath from '@/assets/back.jpg'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
const router = useRouter()
const route = useRoute()

// const logout = async () => {
//   await userStore.logout()
//   router.push({
//     name: 'login'
//   })
// }
// onMounted(() => {
//   username.value = userStore.userInfo.username
// })
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-flow: column;

  .header {
    height: 80px;
    padding: 0 40px;
    display: flex;
    align-items: center;
    background: #409EFF;
    color: #fff;
    // border-bottom: 1px solid var(--el-border-color);
    border-bottom: 1px solid #000;
    justify-content: space-between;

    .logo {
      font-size: 22px;
    }
  }

  .el-menu {
    height: 100%;
  }

  &>main {
    width: 100%;
    flex: 1;
    display: flex;
    overflow-y: auto;
  }
}
</style>