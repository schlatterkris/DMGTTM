<script setup>
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <div class="page-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #0a0a0a;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>
