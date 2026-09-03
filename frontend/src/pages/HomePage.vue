<template>
  <div class="page">
    <div class="home-head">
      <div>
        <h2 class="page-title">안녕하세요, {{ user.name }}님 👋</h2>
        <div class="page-sub">{{ user.campus }} {{ user.cohort }} {{ user.classNo }}반</div>
      </div>
      <router-link to="/more/profile" class="outline-btn">내 정보</router-link>
    </div>

    <div class="card">
      <div class="card-head">
        <span class="card-title">출결 현황</span>
        <router-link to="/attendance" class="card-link">상세보기 ›</router-link>
      </div>
      <div class="range-row">
        <label class="range-field"><span>From</span><input type="date" v-model="from" /></label>
        <span class="range-tilde">~</span>
        <label class="range-field"><span>To</span><input type="date" v-model="to" /></label>
        <button class="primary-btn">조회</button>
      </div>
      <div class="stat-row">
        <div class="stat"><div class="stat-num c-green">{{ stats.present }}</div><div class="stat-label">출석</div></div>
        <div class="stat"><div class="stat-num c-amber">{{ stats.late }}</div><div class="stat-label">지각</div></div>
        <div class="stat"><div class="stat-num c-blue">{{ stats.out }}</div><div class="stat-label">외출</div></div>
        <div class="stat"><div class="stat-num c-red">{{ stats.absent }}</div><div class="stat-label">결석</div></div>
        <div class="stat"><div class="stat-num c-purple">{{ stats.leave }}</div><div class="stat-label">공가</div></div>
      </div>
      <div class="rate-bar"><div class="rate-fill" :style="{ width: rate + '%' }"></div></div>
      <div class="rate-text">출석률 {{ rate }}%</div>
      <div class="today-box">
        <div class="today-box-label">오늘</div>
        <div class="today-box-text">아직 입실 기록이 없습니다.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { user as base } from '../data/user'
import { session } from '../data/store'
const user = { ...base, ...(session.user || {}) }
const from = ref('2026-08-14')
const to = ref('2026-09-13')
const stats = { present: 14, late: 0, out: 0, absent: 0, leave: 1 }
const rate = 100
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.home-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.page-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
.outline-btn { padding: 7px 16px; border: 1.5px solid #6b35ff; color: #6b35ff; border-radius: 8px; font-size: 12px; font-weight: 700; background: #fff; }
.card { background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 14px; }
.card-head { display: flex; align-items: center; justify-content: space-between; }
.card-title { font-size: 14px; font-weight: 800; color: #0f172a; }
.card-link { font-size: 12px; font-weight: 700; color: #6b35ff; }
.range-row { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.range-field { display: flex; flex-direction: column; gap: 4px; font-size: 11px; font-weight: 700; color: #64748b; }
.range-field input { padding: 7px 10px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-family: inherit; color: #0f172a; background: #fff; }
.range-tilde { color: #94a3b8; padding-bottom: 8px; }
.primary-btn { padding: 8px 16px; background: #6b35ff; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
.stat-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.stat { background: #f8fafc; border-radius: 10px; padding: 12px; text-align: center; }
.stat-num { font-size: 22px; font-weight: 800; }
.stat-label { font-size: 11px; color: #64748b; margin-top: 2px; }
.c-green { color: #16a34a; } .c-amber { color: #f59e0b; } .c-blue { color: #3b82f6; } .c-red { color: #dc2626; } .c-purple { color: #6b35ff; }
.rate-bar { height: 6px; background: #ede9fe; border-radius: 3px; overflow: hidden; }
.rate-fill { height: 100%; background: linear-gradient(90deg, #6b35ff, #a78bfa); }
.rate-text { font-size: 11px; color: #64748b; text-align: right; margin-top: -8px; }
.today-box { background: #f8fafc; border-radius: 10px; padding: 12px 14px; }
.today-box-label { font-size: 11.5px; font-weight: 700; color: #64748b; margin-bottom: 4px; }
.today-box-text { font-size: 13px; color: #94a3b8; }
@media (max-width: 700px) { .stat-row { grid-template-columns: repeat(3, 1fr); } }
</style>
