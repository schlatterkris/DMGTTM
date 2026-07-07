<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  { title: 'Warbands', desc: 'Create and manage encounter warbands with HP tracking', icon: '⚔️', path: '/warbands' },
  { title: 'Bestiary', desc: 'Browse creatures, monsters, and NPCs', icon: '🐉', path: '/bestiary' },
  { title: 'Spellbook', desc: 'Search and reference all spells', icon: '✨', path: '/spells' },
  { title: 'Magic Items', desc: 'Browse magic items from the multiverse', icon: '🎁', path: '/magic-items' },
]
</script>

<template>
  <div class="home-view">
    <div class="content-wrapper">
      <h1 class="title">
        <span class="title-line">DMGTTM</span>
        <span class="title-sub">Dungeon Master Guide to the Multiverse</span>
      </h1>

      <p class="introduction">
        The ultimate DM companion — manage warbands, track HP, and access creatures, spells, and magic items at your fingertips.
      </p>

      <div class="features">
        <div v-for="f in features" :key="f.title" class="feature-card" @click="router.push(f.path)">
          <div class="feature-icon">{{ f.icon }}</div>
          <div class="feature-title">{{ f.title }}</div>
          <div class="feature-desc">{{ f.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  min-height: calc(100vh - 55px);
  background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a1a 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

.content-wrapper {
  max-width: 900px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 72px;
  font-weight: 900;
  line-height: 1.1;
  margin: 0 0 8px 0;
  letter-spacing: -2px;
}

.title-line {
  display: block;
  background: linear-gradient(90deg, #ef4444, #f97316, #eab308);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-sub {
  display: block;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 1px;
  color: #888;
  margin-top: 8px;
}

.introduction {
  font-size: 18px;
  color: rgba(235, 235, 235, 0.7);
  line-height: 1.5;
  max-width: 600px;
  margin: 0 auto 48px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 700px;
}

.feature-card {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 24px 16px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: #ef4444;
}

.feature-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.feature-title {
  font-size: 18px;
  font-weight: 700;
  color: #f2f2f2;
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 13px;
  color: #999;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .title {
    font-size: 48px;
  }

  .introduction {
    font-size: 16px;
  }

  .features {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .features {
    grid-template-columns: 1fr;
  }
}
</style>
