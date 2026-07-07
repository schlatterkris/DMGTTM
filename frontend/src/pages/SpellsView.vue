<script setup>
import { ref, onMounted } from 'vue'

const spells = ref([])
const q = ref('')
const level = ref('')
const cls = ref('')
const loading = ref(false)
const selected = ref(null)

const API = '/api/dm'

const levels = ['', 'cantrip', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const classes = ['', 'wizard', 'sorcerer', 'cleric', 'bard', 'druid', 'ranger', 'paladin', 'warlock', 'monk', 'rogue', 'fighter', 'barbarian', 'bard']

async function search() {
    loading.value = true
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    if (level.value) params.set('level', level.value)
    if (cls.value) params.set('cls', cls.value)
    const res = await fetch(`${API}/spells?${params}`)
    const data = await res.json()
    spells.value = data.results || []
    loading.value = false
}

function viewSpell(s) {
    selected.value = s
}

function closeDetail() {
    selected.value = null
}

onMounted(search)
</script>

<template>
  <div class="page">
    <h1>Spellbook</h1>
    <p class="subtitle">Browse all spells by name, level, or class.</p>

    <div class="controls">
      <input v-model="q" placeholder="Search spells..." @input="search" class="search-input" />
      <select v-model="level" @change="search" class="select-input">
        <option v-for="l in levels" :key="l" :value="l">
          {{ l === '' ? 'All Levels' : l === 'cantrip' ? 'Cantrip' : 'Level ' + l }}
        </option>
      </select>
      <select v-model="cls" @change="search" class="select-input">
        <option v-for="c in classes" :key="c" :value="c">
          {{ c === '' ? 'All Classes' : c.charAt(0).toUpperCase() + c.slice(1) }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="status">Loading...</div>
    <div v-else-if="spells.length === 0" class="status empty">No spells found.</div>
    <div v-else class="grid">
      <div v-for="s in spells" :key="s.name" class="card" @click="viewSpell(s)">
        <div class="card-header">
          <span class="card-name">{{ s.name }}</span>
          <span class="badge" :class="'lvl' + (s.level === 'cantrip' ? 'cantrip' : s.level)">{{ s.level === 'cantrip' ? 'Cantrip' : 'Lv ' + s.level }}</span>
        </div>
        <div class="card-meta">
          <span>{{ s.school }}</span>
          <span v-if="s.ritual" class="ritual-badge">Ritual</span>
        </div>
        <div class="card-meta">{{ s.classes.join(', ') }}</div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selected" class="modal-overlay" @click.self="closeDetail">
      <div class="modal">
        <button class="close-btn" @click="closeDetail">×</button>
        <h2>{{ selected.name }}</h2>
        <div class="badges">
          <span class="badge" :class="'lvl' + (selected.level === 'cantrip' ? 'cantrip' : selected.level)">{{ selected.level === 'cantrip' ? 'Cantrip' : 'Level ' + selected.level }}</span>
          <span class="badge school">{{ selected.school }}</span>
          <span v-if="selected.ritual" class="badge ritual">Ritual</span>
        </div>
        <div class="detail-row"><strong>Casting Time:</strong> {{ selected.casting_time }}</div>
        <div class="detail-row"><strong>Range:</strong> {{ selected.range }}</div>
        <div class="detail-row"><strong>Duration:</strong> {{ selected.duration }}</div>
        <div class="detail-row"><strong>Components:</strong> {{ selected.components.raw }}</div>
        <div class="detail-row"><strong>Classes:</strong> {{ selected.classes.join(', ') }}</div>
        <div class="description" v-html="formatText(selected.description)"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    formatText(text) {
      if (!text) return ''
      return text
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
    }
  }
}
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin:0 auto;
  padding: 20px;
  color: #f2f2f2;
}
h1 {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(90deg, #99eaf9, #a0c4ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subtitle { color: #999; margin-bottom: 20px; }
.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.search-input {
  flex:1;
  min-width: 200px;
  padding: 10px 16px;
  border-radius: 8px;
  border:1px solid #444;
  background: #2a2a2a;
  color: #f2f2f2;
  font-size: 15px;
}
.search-input:focus { outline:none; border-color: #99eaf9; }
.select-input {
  padding: 10px 16px;
  border-radius: 8px;
  border:1px solid #444;
  background: #2a2a2a;
  color: #f2f2f2;
  font-size: 14px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}
.card {
  background: #1e1e1e;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  border: 1px solid #333;
  transition: border-color 0.2s, transform 0.1s;
}
.card:hover { border-color: #99eaf9; transform: translateY(-2px); }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.card-name { font-weight: 700; font-size: 15px; }
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}
.badge.cantrip { background: #a0c4ff33; color: #a0c4ff; }
.badge.lvl1 { background: #4ade8033; color: #4ade80; }
.badge.lvl2 { background: #99eaf933; color: #99eaf9; }
.badge.lvl3 { background: #a0c4ff33; color: #a0c4ff; }
.badge.lvl4 { background: #fbbf2433; color: #fbbf24; }
.badge.lvl5 { background: #f9731633; color: #f97316; }
.badge.lvl6 { background: #ef444433; color: #ef4444; }
.badge.lvl7,.badge.lvl8,.badge.lvl9 { background: #a855f733; color: #a855f7; }
.badge.school { background: #4ade8022; color: #4ade80; }
.badge.ritual { background: #fbbf2422; color: #fbbf24; }
.card-meta { font-size: 13px; color: #888; margin-bottom: 2px; }
.ritual-badge { font-size: 10px; color: #fbbf24; margin-left: 6px; }
.status { color:#888; padding:40px; text-align:center; }
.empty { color:#666; }

/* Modal */
.modal-overlay {
  position:fixed; inset:0;
  background:rgba(0,0,0,0.7);
  display:flex; align-items:center; justify-content:center;
  z-index:200;
}
.modal {
  background:#1e1e1e;
  border-radius:16px;
  padding:24px;
  width:90%;
  max-width:600px;
  max-height:80vh;
  overflow-y:auto;
  position:relative;
}
.modal h2 {
  font-size:24px;
  margin:0 0 12px;
  background: linear-gradient(90deg, #99eaf9, #a0c4ff);
  background-clip:text;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}
.close-btn {
  position:absolute; top:16px; right:16px;
  background:none; border:none; color:#888; font-size:24px; cursor:pointer;
}
.badges { display:flex; gap:6px; margin-bottom:16px; flex-wrap:wrap; }
.detail-row { margin:6px 0; color:#ccc; font-size:14px; }
.detail-row strong { color:#f2f2f2; }
.description { color:#bbb; margin-top:16px; line-height:1.6; }
</style>
