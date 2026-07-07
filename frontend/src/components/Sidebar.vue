<template>
  <div class="sidebar">
    <nav class="sidebar-nav">
      <router-link to="/">Home</router-link>
      <router-link to="/warbands">Warbands</router-link>
      <router-link to="/bestiary">Bestiary</router-link>
      <router-link to="/spells">Spells</router-link>
      <router-link to="/magic-items">Magic Items</router-link>
    </nav>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.sidebar {
  width: 100%;
  background-color: #1a1a1a;
  padding: 0 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 55px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #333;
  justify-content: center;
}

.sidebar-nav {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: center;
}

.sidebar-nav a {
  text-decoration: none;
  color: #8e8e8e;
  font-weight: 500;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  transition: color 0.2s ease;
  padding: 8px 4px;
}

.sidebar-nav a:hover {
  color: #f2f2f2;
}

.sidebar-nav a.router-link-active,
.sidebar-nav a.router-link-exact-active {
  background: linear-gradient(90deg, #aaffcd, #99eaf9, #a0c4ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
