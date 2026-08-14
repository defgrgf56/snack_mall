<template>
  <div class="notfound-container">
    <div class="notfound-content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.notfound-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;

  .notfound-content {
    text-align: center;

    h1 {
      font-size: 120px;
      color: #409eff;
      margin: 0;
      font-weight: bold;
    }

    h2 {
      font-size: 32px;
      color: #333;
      margin: 20px 0;
    }

    p {
      font-size: 16px;
      color: #666;
      margin-bottom: 30px;
    }
  }
}
</style>
