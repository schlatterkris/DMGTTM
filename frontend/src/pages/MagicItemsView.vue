<script setup>
import { ref, onMounted } from 'vue'

const items = ref([])
const q = ref('')
const loading = ref(false)
const selected = ref(null)

const API = '/api/dm'

async function search() {
    loading.value = true
    const params = q.value ? `?q=${encodeURIComponent(q.value)}` : ''
    const res = await fetch(`${API}/magic-items${params}`)
    const data = await res.json()
    items.value = data.results || []
    loading.value = false
}

function viewItem(item) {
    selected.value = item
}

function closeDetail() {
    selected.value = null
}

onMounted(search)
</script>

<template>
  <div class="page">
    <h1>Magic Items</h1>
    <p class="subtitle">Browse magic items from the multiverse.</p>

    <div class="controls">
      <input v-model="q" placeholder="Search magic items..." @input="search" class="search-input" />
    </div>

    <div v-if="loading" class="status">Loading...</div>
    <div v-else-if="items.length === 0" class="status empty">No magic items found.</div>
    <div v-else class="grid">
      <div v-for="item in items" :key="item.name" class="card" @click="viewItem(item)">
        <div class="card-name">{{ item.name }}</div>
        <div class="card-path" v-if="item.path">{{ item.path }}</div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selected" class="modal-overlay" @click.self="closeDetail">
      <div class="modal">
        <button class="close-btn" @click="closeDetail">×</button>
        <h2>{{ selected.name }}</h2>
        <div class="detail-text" v-if="selected.text" v-html="formatText(selected.text)"></div>
        <div class="detail-raw" v-if="selected.content">
          <pre>{{ JSON.stringify(selected.content, null, 2) }}</pre>
        </div>
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
  background: linear-gradient(90deg, #aaffcd, #99eaf9);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subtitle { color: #999; margin-bottom: 20px; }
.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.search-input {
  flex:1;
  padding: 10px 16px;
  border-radius: 8px;
  border:1px solid #444;
  background: #2a2a2a;
  color: #f2f2f2;
  font-size: 15px;
}
.search-input:focus { outline:none; border-color: #aaffcd; }
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
.card:hover { border-color: #aaffcd; transform: translateY(-2px); }
.card-name { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
.card-path { font-size: 11px; color: #666; }
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
  background: linear-gradient(90deg, #aaffcd, #99eaf9);
  background-clip:text;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}
.close-btn {
  position:absolute; top:16px; right:16px;
  background:none; border:none; color:#888; font-size:24px; cursor:pointer;
}
.detail-text { color:#bbb; line-height:1.6; margin-top:8px; }
.detail-raw pre {
  background:#111;
  padding:12px;
  border-radius:8px;
  color:#888;
  font-size:12px;
  overflow-x:auto;
}
</style>
