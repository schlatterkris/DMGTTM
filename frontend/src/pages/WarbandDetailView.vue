<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const warband = ref({})
const members = ref([])
const allCreatures = ref([])
const search = ref('')
const loading = ref(false)
const showAdd = ref(false)
const editingMember = ref(null)
const editHP = ref(0)
const editMaxHP = ref(0)
const editName = ref('')
const editInitiative = ref(0)

const API = '/api/dm'

async function load() {
    loading.value = true
    const res = await fetch(`${API}/warbands/${id}`)
    const data = await res.json()
    warband.value = data.warband
    members.value = data.members || []
    loading.value = false
}

async function loadCreatures() {
    const res = await fetch(`${API}/bestiary?q=${encodeURIComponent(search.value)}`)
    const data = await res.json()
    allCreatures.value = data.results || []
}

function openAdd() {
    showAdd.value = true
    search.value = ''
    allCreatures.value = []
}

async function searchCreatures() {
    if (search.value.length < 2) return
    await loadCreatures()
}

async function addCreature(creature) {
    const name = creature.name || creature.path?.split('>').pop()?.trim() || 'Unknown'
    const hpMatch = creature.hp || ''
    let maxHP = null
    if (typeof hpMatch === 'string') {
        const m = hpMatch.match(/(\d+)\s*\(/)
        if (m) maxHP = parseInt(m[1])
    }
    await fetch(`${API}/warbands/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            creature_data: creature,
            max_hp: maxHP,
            current_hp: maxHP
        })
    })
    showAdd.value = false
    await load()
}

function startEdit(m) {
    editingMember.value = m.id
    editHP.value = m.current_hp
    editMaxHP.value = m.max_hp
    editName.value = m.name
    editInitiative.value = m.initiative || 0
}

async function saveEdit(m) {
    const payload = {}
    if (editHP.value !== m.current_hp) payload.current_hp = editHP.value
    if (editMaxHP.value !== m.max_hp) payload.max_hp = editMaxHP.value
    if (editName.value !== m.name) payload.name = editName.value
    if (editInitiative.value !== (m.initiative || 0)) payload.initiative = editInitiative.value
    if (Object.keys(payload).length) {
        await fetch(`${API}/warbands/${id}/members/${m.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
    }
    editingMember.value = null
    await load()
}

async function removeMember(mid) {
    if (!confirm('Remove this creature?')) return
    await fetch(`${API}/warbands/${id}/members/${mid}`, { method: 'DELETE' })
    await load()
}

function hpPercent(m) {
    if (!m.max_hp || m.max_hp === 0) return 100
    return Math.max(0, Math.min(100, (m.current_hp / m.max_hp) * 100))
}

function hpColor(m) {
    const pct = hpPercent(m)
    if (pct > 60) return '#4ade80'
    if (pct > 30) return '#fbbf24'
    return '#ef4444'
}

function dealDamage(m) {
    const dmg = prompt(`Damage to ${m.name}?`)
    if (dmg === null) return
    const amount = parseInt(dmg)
    if (isNaN(amount)) return
    editHP.value = m.current_hp - amount
    saveEdit(m)
}

function healDamage(m) {
    const amount = prompt(`Heal ${m.name} by?`)
    if (amount === null) return
    const val = parseInt(amount)
    if (isNaN(val)) return
    editHP.value = Math.min(m.max_hp || 999, m.current_hp + val)
    saveEdit(m)
}

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="header">
      <button class="btn-back" @click="router.push('/warbands')">← Warbands</button>
      <h1>{{ warband.name || 'Warband' }}</h1>
      <button class="btn-accent" @click="openAdd">+ Add Creature</button>
    </div>

    <div v-if="loading" class="status">Loading...</div>

    <div v-else-if="members.length === 0" class="status empty">
      No creatures in this warband yet. Click "Add Creature" to start building your encounter.
    </div>

    <table v-else class="tracker-table">
      <thead>
        <tr>
          <th class="num">#</th>
          <th>Name</th>
          <th>Initiative</th>
          <th>HP</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(m, i) in members" :key="m.id">
          <td class="num">{{ i + 1 }}</td>
          <td class="name-cell">
            <div class="name">{{ m.name }}</div>
            <div class="meta" v-if="m.creature_data && m.creature_data.ac">
              AC {{ m.creature_data.ac }}
            </div>
          </td>
          <td class="num">
            <input
              v-if="editingMember === m.id"
              type="number"
              step="any"
              v-model.number="editInitiative"
              class="inline-input sm"
              @keyup.enter="saveEdit(m)"
            />
            <span v-else @click="startEdit(m)" class="clickable-num">{{ m.initiative || 0 }}</span>
          </td>
          <td class="hp-cell">
            <div v-if="editingMember === m.id" class="hp-edit">
              <input type="number" v-model.number="editHP" class="inline-input" />
              <span>/</span>
              <input type="number" v-model.number="editMaxHP" class="inline-input" />
              <button class="btn-sm btn-save" @click="saveEdit(m)">✓</button>
            </div>
            <div v-else class="hp-bar-wrap" @click="startEdit(m)">
              <div class="hp-bar" :style="{ width: hpPercent(m) + '%', background: hpColor(m) }"></div>
              <span class="hp-text">{{ m.current_hp || 0 }} / {{ m.max_hp || '?' }}</span>
            </div>
          </td>
          <td>
            <span class="status-badge" :style="{ background: hpColor(m) + '33', color: hpColor(m) }">
              {{ m.current_hp <= 0 ? 'Dead' : hpPercent(m) > 60 ? 'Healthy' : hpPercent(m) > 30 ? 'Injured' : 'Critical' }}
            </span>
          </td>
          <td class="actions-cell">
            <button class="btn-sm btn-hit" @click="dealDamage(m)">Hit</button>
            <button class="btn-sm btn-heal" @click="healDamage(m)">Heal</button>
            <button class="btn-sm btn-danger" @click="removeMember(m.id)">×</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Add Creature Modal -->
    <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
      <div class="modal">
        <h2>Add Creature</h2>
        <div class="search-bar">
          <input v-model="search" placeholder="Search creatures..." @input="searchCreatures" />
        </div>
        <div class="creature-list" v-if="allCreatures.length">
          <div
            v-for="c in allCreatures"
            :key="c.name"
            class="creature-item"
            @click="addCreature(c)"
          >
            <span class="c-name">{{ c.name }}</span>
            <span class="c-meta" v-if="c.ac">AC {{ c.ac }}</span>
            <span class="c-meta" v-if="c.hp">HP {{ c.hp }}</span>
          </div>
        </div>
        <div v-else-if="search.length >= 2" class="status">No creatures found.</div>
        <div v-else class="status">Type at least 2 characters to search.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  color: #f2f2f2;
}
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.header h1 {
  flex: 1;
  font-size: 30px;
  font-weight: 800;
  background: linear-gradient(90deg, #ff6b6b, #ffa36b);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.btn-back {
  background: none;
  border: 1px solid #555;
  color: #aaa;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.btn-back:hover {
  color: #f2f2f2;
  border-color: #888;
}
.btn-accent {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg, #ff6b6b, #ffa36b);
  color: #1a1a1a;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.tracker-table {
  width: 100%;
  border-collapse: collapse;
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
}
.tracker-table th {
  background: #2a2a2a;
  color: #aaa;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 14px;
  text-align: left;
}
.tracker-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #2a2a2a;
  vertical-align: middle;
}
.tracker-table tbody tr:hover {
  background: #252525;
}
.num {
  text-align: center;
  color: #888;
  font-size: 14px;
}
.name-cell .name {
  font-weight: 600;
  font-size: 15px;
}
.name-cell .meta {
  font-size: 12px;
  color: #888;
}
.hp-cell {
  min-width: 200px;
}
.hp-bar-wrap {
  position: relative;
  height: 28px;
  background: #333;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}
.hp-bar {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s, background 0.3s;
}
.hp-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
}
.hp-edit {
  display: flex;
  align-items: center;
  gap: 6px;
}
.inline-input {
  width: 60px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #555;
  background: #2a2a2a;
  color: #f2f2f2;
  font-size: 13px;
}
.inline-input.sm {
  width: 45px;
}
.clickable-num {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}
.clickable-num:hover {
  background: #333;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.actions-cell {
  display: flex;
  gap: 6px;
}
.btn-sm {
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn-hit {
  background: #ef444422;
  color: #ef4444;
}
.btn-heal {
  background: #4ade8022;
  color: #4ade80;
}
.btn-save {
  background: #3b82f622;
  color: #3b82f6;
}
.btn-danger {
  background: #ef444422;
  color: #ef4444;
}
.status {
  color: #888;
  padding: 40px;
  text-align: center;
}
.empty {
  color: #666;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal {
  background: #1e1e1e;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}
.modal h2 {
  margin: 0 0 16px;
  background: linear-gradient(90deg, #ff6b6b, #ffa36b);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.search-bar input {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #444;
  background: #2a2a2a;
  color: #f2f2f2;
  font-size: 15px;
  margin-bottom: 16px;
  box-sizing: border-box;
}
.creature-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.creature-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  background: #252525;
}
.creature-item:hover {
  background: #333;
}
.c-name {
  font-weight: 600;
}
.c-meta {
  font-size: 13px;
  color: #888;
}
</style>
