<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const warbands = ref([])
const newName = ref('')
const loading = ref(false)

const uploading = ref(false)
const uploadResult = ref(null)
const uploadError = ref('')

const searchQuery = ref('')
const sortBy = ref('updated_at')
const sortOrder = ref('desc')

const API = '/api/dm'

function sortIcon(field) {
    if (sortBy.value !== field) return '\u2195'
    return sortOrder.value === 'asc' ? '\u25B2' : '\u25BC'
}

function toggleSort(field) {
    if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortBy.value = field
        sortOrder.value = 'asc'
    }
    load()
}

async function load() {
    loading.value = true
    const params = new URLSearchParams()
    if (searchQuery.value.trim()) params.set('q', searchQuery.value.trim())
    params.set('sort_by', sortBy.value)
    params.set('sort_order', sortOrder.value)
    const res = await fetch(`${API}/warbands?${params}`)
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

const pdfFile = ref(null)

function onFileSelected(e) {
    pdfFile.value = e.target.files[0] || null
    uploadResult.value = null
    uploadError.value = ''
}

async function uploadPdf() {
    if (!pdfFile.value) return
    uploading.value = true
    uploadResult.value = null
    uploadError.value = ''

    const form = new FormData()
    form.append('file', pdfFile.value)

    try {
        const res = await fetch(`${API}/warbands/upload-pdf`, { method: 'POST', body: form })
        const data = await res.json()
        if (!res.ok) {
            uploadError.value = data.detail || 'Upload failed'
        } else {
            uploadResult.value = data
        }
    } catch (err) {
        uploadError.value = err.message || 'Network error'
    } finally {
        uploading.value = false
    }
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

    <div class="pdf-section">
      <div class="pdf-header">Upload PDF</div>
      <p class="pdf-desc">Upload an adventure PDF to auto-detect encounters and build a warband per encounter.</p>
      <div class="pdf-controls">
        <input type="file" accept=".pdf" @change="onFileSelected" class="file-input" />
        <button class="btn-pdf" :disabled="!pdfFile || uploading" @click="uploadPdf">
          {{ uploading ? 'Processing...' : 'Upload & Create Warband' }}
        </button>
      </div>

      <div v-if="uploadError" class="pdf-error">{{ uploadError }}</div>

      <div v-if="uploadResult" class="pdf-result">
        <div class="result-header">
          <span class="result-icon">&#10003;</span>
          <strong>{{ uploadResult.warbands.length }}</strong> warband{{ uploadResult.warbands.length !== 1 ? 's' : '' }} created
        </div>
        <div v-for="wb in uploadResult.warbands" :key="wb.warband_id" class="wb-result">
          <div class="wb-result-header">
            Warband <strong>{{ wb.warband_name }}</strong>
            ({{ wb.members_added }} member{{ wb.members_added !== 1 ? 's' : '' }})
          </div>
          <div class="result-creatures">
            <div v-for="c in wb.creatures" :key="c.name" class="result-creature"
                 :class="{ matched: c.matched, unmatched: !c.matched }">
              <span class="creature-icon">{{ c.matched ? '&#10003;' : '&#10007;' }}</span>
              <span class="creature-name">{{ c.name }}</span>
              <span class="creature-count">&times;{{ c.count }}</span>
              <span v-if="!c.matched" class="creature-note">not in database</span>
            </div>
          </div>
          <button class="btn-sm btn-accent" @click="open(wb.warband_id)">
            View &rarr;
          </button>
        </div>
      </div>
    </div>

    <div class="toolbar">
      <input v-model="searchQuery" placeholder="Search warbands..." class="search-input"
             @input="load" />
    </div>

    <div v-if="loading" class="status">Loading...</div>
    <div v-else-if="warbands.length === 0" class="status empty">
      No warbands yet. Create one to get started.
    </div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th class="sortable" @click="toggleSort('name')">
            Name <span class="sort-icon">{{ sortIcon('name') }}</span>
          </th>
          <th class="sortable" @click="toggleSort('created_at')">
            Created <span class="sort-icon">{{ sortIcon('created_at') }}</span>
          </th>
          <th class="sortable" @click="toggleSort('updated_at')">
            Updated <span class="sort-icon">{{ sortIcon('updated_at') }}</span>
          </th>
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
.toolbar {
  margin-bottom: 12px;
}
.search-input {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #444;
  background: #2a2a2a;
  color: #f2f2f2;
  font-size: 14px;
  box-sizing: border-box;
}
.search-input:focus {
  outline: none;
  border-color: #ffa36b;
}
.search-input::placeholder {
  color: #666;
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
  user-select: none;
}
.sortable {
  cursor: pointer;
}
.sortable:hover {
  color: #f2f2f2;
}
.sort-icon {
  font-size: 11px;
  margin-left: 4px;
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
.wb-result .btn-accent {
  padding: 6px 16px;
  font-size: 13px;
  margin-top: 8px;
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

/* PDF Upload Section */
.pdf-section {
  background: #151515;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}
.pdf-header {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #ffa36b;
  margin-bottom: 4px;
}
.pdf-desc {
  color: #888;
  font-size: 13px;
  margin-bottom: 14px;
}
.pdf-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.file-input {
  color: #ccc;
  font-size: 13px;
}
.file-input::file-selector-button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #555;
  background: #2a2a2a;
  color: #f2f2f2;
  cursor: pointer;
  font-size: 13px;
  margin-right: 10px;
}
.file-input::file-selector-button:hover {
  background: #333;
}
.btn-pdf {
  padding: 9px 20px;
  border-radius: 8px;
  border: 1px solid #ffa36b;
  background: transparent;
  color: #ffa36b;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}
.btn-pdf:hover:not(:disabled) {
  background: #ffa36b22;
}
.btn-pdf:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pdf-error {
  margin-top: 12px;
  color: #ff6b6b;
  font-size: 13px;
  padding: 8px 12px;
  background: #ff6b6b11;
  border-radius: 6px;
}
.pdf-result {
  margin-top: 14px;
  padding: 14px;
  background: #1e1e1e;
  border-radius: 8px;
}
.result-header {
  font-size: 14px;
  color: #7ddf7d;
  margin-bottom: 10px;
}
.result-icon {
  margin-right: 6px;
}
.result-creatures {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
.wb-result {
  margin-top: 12px;
  padding: 12px;
  background: #252525;
  border-radius: 8px;
  border-left: 3px solid #ffa36b;
}
.wb-result-header {
  font-size: 14px;
  color: #ffa36b;
  font-weight: 700;
  margin-bottom: 8px;
}
.result-creature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.result-creature.matched .creature-icon { color: #7ddf7d; }
.result-creature.unmatched .creature-icon { color: #ff6b6b; }
.creature-icon { font-size: 14px; }
.creature-name { font-weight: 600; color: #f2f2f2; }
.creature-count { color: #888; }
.creature-note { color: #ff6b6b; font-size: 12px; font-style: italic; }
</style>
