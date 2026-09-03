<template>
  <div class="page">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">{{ isProf ? '질문 관리' : '나의 질문' }}</h2>
        <div class="page-sub">{{ isProf ? 'AI가 먼저 답하고, 신뢰도가 낮은 질문은 교수님 검토가 필요합니다' : '내가 등록한 질문과 AI · 교수 답변 현황' }}</div>
      </div>
      <div class="right-controls">
        <div class="view-toggle">
          <button class="toggle-btn" :class="{ active: filter === 'all' }" @click="filter = 'all'">전체</button>
          <button class="toggle-btn" :class="{ active: filter === 'REVIEW' }" @click="filter = 'REVIEW'">교수 검토 대기</button>
          <button class="toggle-btn" :class="{ active: filter === 'AI_ANSWERED' }" @click="filter = 'AI_ANSWERED'">AI 답변</button>
          <button class="toggle-btn" :class="{ active: filter === 'ANSWERED' }" @click="filter = 'ANSWERED'">교수 답변 완료</button>
        </div>
        <router-link v-if="!isProf" to="/questions/new" class="primary-btn">+ 질문하기</router-link>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat"><div class="stat-num c-purple">{{ list.length }}</div><div class="stat-label">전체</div></div>
      <div class="stat"><div class="stat-num c-amber">{{ count('REVIEW') }}</div><div class="stat-label">교수 검토 대기</div></div>
      <div class="stat"><div class="stat-num c-blue">{{ count('AI_ANSWERED') }}</div><div class="stat-label">AI 답변 완료</div></div>
      <div class="stat"><div class="stat-num c-green">{{ count('ANSWERED') }}</div><div class="stat-label">교수 답변 완료</div></div>
    </div>

    <div class="grid-card">
      <div v-if="!filtered.length" class="empty">{{ isProf ? '검토할 질문이 없습니다.' : '아직 등록한 질문이 없습니다.' }}</div>
      <router-link v-for="q in filtered" :key="q.id" :to="'/questions/' + q.id" class="q-row">
        <div class="q-main">
          <div class="q-title">{{ q.title }}</div>
          <div class="q-meta">
            <span class="tag">{{ q.subject }}</span>
            <span v-for="t in (q.tags || []).slice(0, 3)" :key="t" class="tag light">{{ t }}</span>
            <span v-if="isProf" class="meta">{{ q.authorName }}</span>
            <span class="meta">{{ fmt(q.createdAt) }}</span>
            <span class="meta">답변 {{ q.answers.length }}</span>
          </div>
        </div>
        <span class="status-chip" :class="STATUS[q.status].cls"><span v-if="q.status === 'AI_PENDING'" class="dot"></span>{{ STATUS[q.status].label }}</span>
        <span class="chev">›</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { session, questions, store, STATUS } from '../data/store'
const isProf = computed(() => session.user?.role === 'professor')
const filter = ref('all')
const ORDER = { REVIEW: 0, AI_PENDING: 1, AI_ANSWERED: 2, ANSWERED: 3 }
const list = computed(() => {
  store.version
  const l = isProf.value ? questions.all() : questions.mine(session.user?.id)
  return isProf.value ? [...l].sort((a, b) => ORDER[a.status] - ORDER[b.status] || (b.createdAt > a.createdAt ? 1 : -1)) : l
})
const filtered = computed(() => list.value.filter(q => filter.value === 'all' || q.status === filter.value))
const count = s => list.value.filter(q => q.status === s).length
const fmt = s => s ? new Date(s).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.page-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
.right-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.view-toggle { display: flex; border: 1.5px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
.toggle-btn { padding: 7px 12px; border: none; background: #fff; font-size: 12.5px; font-weight: 600; color: #64748b; cursor: pointer; font-family: inherit; white-space: nowrap; }
.toggle-btn.active { background: #6b35ff; color: #fff; }
.primary-btn { padding: 8px 16px; background: #6b35ff; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.stat { background: #fff; border-radius: 12px; padding: 12px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.stat-num { font-size: 22px; font-weight: 800; }
.stat-label { font-size: 11px; color: #64748b; }
.c-purple { color: #6b35ff; } .c-amber { color: #f59e0b; } .c-blue { color: #3b82f6; } .c-green { color: #16a34a; }
.grid-card { background: #fff; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; }
.empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 13px; }
.q-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #f1f5f9; transition: background .12s; }
.q-row:last-child { border-bottom: none; }
.q-row:hover { background: #faf5ff; }
.q-main { flex: 1; min-width: 0; }
.q-title { font-size: 14px; font-weight: 700; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.q-meta { display: flex; align-items: center; gap: 6px; margin-top: 5px; flex-wrap: wrap; }
.tag { font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: #dbeafe; color: #1d4ed8; }
.tag.light { background: #f1f5f9; color: #475569; }
.meta { font-size: 11.5px; color: #94a3b8; }
.status-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.status-chip.gen { background: #ede9fe; color: #6b35ff; }
.status-chip.ai { background: #dbeafe; color: #1d4ed8; }
.status-chip.review { background: #fef3c7; color: #b45309; }
.status-chip.done { background: #dcfce7; color: #15803d; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #6b35ff; animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: .2; } }
.chev { color: #cbd5e1; font-size: 18px; }
@media (max-width: 800px) { .stat-row { grid-template-columns: repeat(2, 1fr); } }
</style>
