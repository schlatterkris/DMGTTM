<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const warbands = ref([])
const newName = ref('')
const loading = ref(false)

const API = '/api/dm'

async function load() {
    loading.value = true
    const res = await fetch(`${API}/warbands`)
    const data = await res.json()
    warbands.value = data.warbands
    loading.value = false
}

async function create() {
    if (!newName.value.trim()) return
    await fetch(`${API}/warbands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.value.trim() })
    })
    newName.value = ''
    await load()
}

async function remove(id) {
    if (!confirm('Delete this warband?')) return
    await fetch(`${API}/warbands/${id}`, { method: 'DELETE' })
    await load()
}

function open(id) {
    router.push(`/warbands/${id}`)
}

onMounted(load)
</script>

<template>
  <div class="page">
    <h1>Warbands</h1>
    <p class="subtitle">Create and manage encounter warbands for your players.</p>

    <div class="create-bar">
      <input v-model="newName" placeholder="New warband name..." @keyup.enter="create" />
      <button class="btn-accent" @click="create">Create</button>
    </div>

    <div v-if="loading" class="status">Loading...</div>
    <div v-else-if="warbands.length === 0" class="status empty">
      No warbands yet. Create one to get started.
    </div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Created</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="wb in warbands" :key="wb.id" @click="open(wb.id)" class="clickable">
          <td>{{ wb.name }}</td>
          <td>{{ new Date(wb.created_at).toLocaleDateString() }}</td>
          <td>{{ new Date(wb.updated_at).toLocaleDateString() }}</td>
          <td>
            <button class="btn-sm btn-danger" @click.stop="remove(wb.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  color: #f2f2f2;
}
h1 {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(90deg, #ff6b6b, #ffa36b);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subtitle {
  color: #999;
  margin-bottom: 24px;
}
.create-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.create-bar input {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #444;
  background: #2a2a2a;
  color: #f2f2f2;
  font-size: 15px;
}
.create-bar input:focus {
  outline: none;
  border-color: #ff6b6b;
}
.btn-accent {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg, #ff6b6b, #ffa36b);
  color: #1a1a1a;
  font-weight: 700;
  cursor: pointer;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
}
.data-table th, .data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #333;
}
.data-table th {
  background: #2a2a2a;
  color: #aaa;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.clickable:hover {
  background: #2a2a2a;
  cursor: pointer;
}
.btn-sm {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  cursor: pointer;
}
.btn-danger {
  background: #ff6b6b22;
  color: #ff6b6b;
}
.status {
  color: #888;
  padding: 40px;
  text-align: center;
}
.empty {
  color: #666;
}
</style>
