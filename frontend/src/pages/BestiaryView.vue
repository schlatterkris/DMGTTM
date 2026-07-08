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

function formatText(text) {
    if (!text) return ''
    return text
        .replace(/\*\*\*([^*]+)\*\*\*/g, '<em><strong>$1</strong></em>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
}

function hasDefenses(c) {
    return c.saving_throws || c.skills || c.damage_vulnerabilities ||
        c.damage_resistances || c.damage_immunities || c.condition_immunities ||
        c.senses || c.languages
}

function hasAnyBoxedContent(c) {
    return c.ac || c.hp || c.speed || c.abilities || hasDefenses(c) ||
        c.challenge || (c.traits && c.traits.length) ||
        (c.actions && c.actions.length) || (c.reactions && c.reactions.length) ||
        (c.legendary_actions && c.legendary_actions.length)
}

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

        <!-- Core Stats -->
        <div class="stat-box core-stats" v-if="selected.ac || selected.hp || selected.speed">
          <div class="box-title">Core Stats</div>
          <div class="core-grid">
            <div class="core-item" v-if="selected.ac">
              <span class="core-label">AC</span>
              <span class="core-value">{{ selected.ac }}</span>
            </div>
            <div class="core-item" v-if="selected.hp">
              <span class="core-label">HP</span>
              <span class="core-value">{{ selected.hp }}</span>
            </div>
            <div class="core-item" v-if="selected.speed">
              <span class="core-label">Speed</span>
              <span class="core-value">{{ selected.speed }}</span>
            </div>
          </div>
        </div>

        <!-- Ability Scores -->
        <div class="stat-box abilities" v-if="selected.abilities">
          <div class="box-title">Abilities</div>
          <div class="abilities-grid">
            <div v-for="(val, key) in selected.abilities" :key="key" class="ability-item">
              <div class="ability-name">{{ key.toUpperCase() }}</div>
              <div class="ability-value">{{ val }}</div>
            </div>
          </div>
        </div>

        <!-- Defenses & Senses -->
        <div class="stat-box defenses" v-if="hasDefenses(selected)">
          <div class="box-title">Defenses &amp; Senses</div>
          <div v-if="selected.saving_throws" class="stat-line"><strong>Saving Throws</strong> {{ selected.saving_throws }}</div>
          <div v-if="selected.skills" class="stat-line"><strong>Skills</strong> {{ selected.skills }}</div>
          <div v-if="selected.damage_vulnerabilities" class="stat-line"><strong>Dmg. Vulnerabilities</strong> {{ selected.damage_vulnerabilities }}</div>
          <div v-if="selected.damage_resistances" class="stat-line"><strong>Dmg. Resistances</strong> {{ selected.damage_resistances }}</div>
          <div v-if="selected.damage_immunities" class="stat-line"><strong>Dmg. Immunities</strong> {{ selected.damage_immunities }}</div>
          <div v-if="selected.condition_immunities" class="stat-line"><strong>Cond. Immunities</strong> {{ selected.condition_immunities }}</div>
          <div v-if="selected.senses" class="stat-line"><strong>Senses</strong> {{ selected.senses }}</div>
          <div v-if="selected.languages" class="stat-line"><strong>Languages</strong> {{ selected.languages }}</div>
        </div>

        <!-- Challenge -->
        <div class="stat-box challenge" v-if="selected.challenge">
          <div class="box-title">Challenge</div>
          <div class="stat-line">{{ selected.challenge }}</div>
        </div>

        <!-- Traits -->
        <div class="stat-box traits" v-if="selected.traits && selected.traits.length">
          <div class="box-title">Traits</div>
          <div v-for="(t, i) in selected.traits" :key="i" class="stat-line" v-html="formatText(t)"></div>
        </div>

        <!-- Actions -->
        <div class="stat-box actions-box" v-if="selected.actions && selected.actions.length">
          <div class="box-title">Actions</div>
          <div v-for="(a, i) in selected.actions" :key="i" class="stat-line" v-html="formatText(a)"></div>
        </div>

        <!-- Reactions -->
        <div class="stat-box reactions" v-if="selected.reactions && selected.reactions.length">
          <div class="box-title">Reactions</div>
          <div v-for="(r, i) in selected.reactions" :key="i" class="stat-line" v-html="formatText(r)"></div>
        </div>

        <!-- Legendary Actions -->
        <div class="stat-box legendary" v-if="selected.legendary_actions && selected.legendary_actions.length">
          <div class="box-title">Legendary Actions</div>
          <div v-for="(la, i) in selected.legendary_actions" :key="i" class="stat-line" v-html="formatText(la)"></div>
        </div>

        <!-- Fallback for anything not parsed -->
        <div class="detail-text" v-if="selected.remaining && selected.remaining.length" v-html="formatText(selected.remaining.join('\n\n'))"></div>

        <button class="btn-accent" @click="addToWarband(selected)">Add to Warband</button>
      </div>
    </div>
  </div>
</template>

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
.type-line { color:#aaa; margin-bottom:14px; font-style:italic; font-size:14px; }
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

/* Stat Boxes */
.stat-box {
  background: #151515;
  border: 1px solid #333;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.stat-box .box-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #2a2a2a;
}
.stat-line {
  font-size: 13px;
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 4px;
}
.stat-line:last-child { margin-bottom: 0; }
.stat-line strong { color: #f2f2f2; font-weight: 600; }
.stat-line em { color: #aaa; }

/* Core Stats Grid */
.core-grid {
  display: flex;
  gap: 12px;
}
.core-item {
  flex: 1;
  text-align: center;
  background: #1e1e1e;
  border-radius: 8px;
  padding: 10px 8px;
}
.core-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin-bottom: 4px;
}
.core-value {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #f2f2f2;
}

/* Abilities Grid */
.abilities-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}
.ability-item {
  text-align: center;
  background: #1e1e1e;
  border-radius: 8px;
  padding: 8px 4px;
}
.ability-name {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin-bottom: 2px;
}
.ability-value {
  font-size: 13px;
  font-weight: 600;
  color: #f2f2f2;
}

/* Defenses box singles out */
.defenses .stat-line:first-child { margin-top: 0; }

/* Challenge box */
.challenge .stat-line { font-size: 14px; font-weight: 600; color: #f2f2f2; }

/* Traits, Actions, Reactions, Legendary */
.traits .stat-line,
.actions-box .stat-line,
.reactions .stat-line,
.legendary .stat-line {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #252525;
}
.traits .stat-line:last-child,
.actions-box .stat-line:last-child,
.reactions .stat-line:last-child,
.legendary .stat-line:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
</style>
