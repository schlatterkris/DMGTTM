<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const creatures = ref([])
const q = ref('')
const category = ref('all')
const loading = ref(false)
const selected = ref(null)

const API = '/api/dm'

async function search() {
    loading.value = true
    const params = new URLSearchParams()
    if (q.value) params.set('q', q.value)
    if (category.value !== 'all') params.set('category', category.value)
    const res = await fetch(`${API}/bestiary?${params}`)
    const data = await res.json()
    creatures.value = data.results || []
    loading.value = false
}

function viewCreature(c) {
    selected.value = c
}

function closeDetail() {
    selected.value = null
}

function addToWarband(c) {
    alert('Open a warband first, then use the "Add Creature" button there.')
}

onMounted(search)
</script>

<template>
  <div class="page">
    <h1>Bestiary</h1>
    <p class="subtitle">Browse creatures, monsters, and NPCs from the multiverse.</p>

    <div class="controls">
      <input v-model="q" placeholder="Search creatures..." @input="search" class="search-input" />
      <select v-model="category" @change="search" class="select-input">
        <option value="all">All</option>
        <option value="creatures">Creatures</option>
        <option value="monsters">Monsters</option>
        <option value="npcs">NPCs</option>
      </select>
    </div>

    <div v-if="loading" class="status">Loading...</div>
    <div v-else-if="creatures.length === 0" class="status empty">No creatures found.</div>
    <div v-else class="grid">
      <div v-for="c in creatures" :key="c.name" class="card" @click="viewCreature(c)">
        <div class="card-name">{{ c.name }}</div>
        <div class="card-meta" v-if="c.ac">AC {{ c.ac }}</div>
        <div class="card-meta" v-if="c.hp">HP {{ c.hp }}</div>
        <div class="card-path">{{ c.path }}</div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selected" class="modal-overlay" @click.self="closeDetail">
      <div class="modal">
        <button class="close-btn" @click="closeDetail">×</button>
        <h2>{{ selected.name }}</h2>
        <div v-if="selected.type_line" class="type-line" v-html="formatText(selected.type_line)"></div>
        <div class="detail-section" v-if="selected.ac">
          <strong>AC:</strong> {{ selected.ac }}
        </div>
        <div class="detail-section" v-if="selected.hp">
          <strong>HP:</strong> {{ selected.hp }}
        </div>
        <div class="detail-section" v-if="selected.speed">
          <strong>Speed:</strong> {{ selected.speed }}
        </div>
        <div class="detail-text" v-if="selected.text" v-html="formatText(selected.text)"></div>
        <button class="btn-accent" @click="addToWarband(selected)">Add to Warband</button>
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
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
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
  background: linear-gradient(90deg, #a0c4ff, #99eaf9);
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
.search-input:focus { outline:none; border-color: #a0c4ff; }
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
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
.card:hover {
  border-color: #a0c4ff;
  transform: translateY(-2px);
}
.card-name {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 6px;
}
.card-meta {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 2px;
}
.card-path {
  font-size: 11px;
  color: #666;
  margin-top: 8px;
}
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
  background: linear-gradient(90deg, #a0c4ff, #99eaf9);
  background-clip:text;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}
.close-btn {
  position:absolute; top:16px; right:16px;
  background:none; border:none; color:#888; font-size:24px; cursor:pointer;
}
.type-line { color:#aaa; margin-bottom:12px; font-style:italic; }
.detail-section { margin:8px 0; color:#ccc; }
.detail-section strong { color:#f2f2f2; }
.detail-text { color:#bbb; margin:16px 0; line-height:1.6; }
.btn-accent {
  margin-top:16px;
  padding:10px 20px;
  border-radius:8px;
  border:none;
  background:linear-gradient(90deg, #ff6b6b, #ffa36b);
  color:#1a1a1a;
  font-weight:700;
  cursor:pointer;
}
</style>
