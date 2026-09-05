<template>
  <div class="page">
    <div class="page-title-row">
      <h2 class="page-title">교육일정</h2>
      <div class="right-controls">
        <input v-model="query" type="text" placeholder="과목명 검색..." class="search-input" />
        <div class="view-toggle">
          <button class="toggle-btn" :class="{ active: view === 'list' }" @click="view = 'list'">목록</button>
          <button class="toggle-btn" :class="{ active: view === 'cal' }" @click="view = 'cal'">달력</button>
        </div>
      </div>
    </div>

    <!-- 오늘 교육 내용 -->
    <div class="today-card" :class="{ 'today-empty': !today || !today.subject }">
      <template v-if="today && today.subject">
       <div class="today-body">
        <div class="today-left">
        <div class="today-top">
          <span class="today-label">오늘 교육 내용</span>
        </div>
        <div class="today-subject">{{ today.subject }}</div>
        <div class="today-meta">
          <span class="mode-chip" :class="'mode-' + today.mode">{{ modeLabel(today.mode) }}</span>
          <span v-if="assist(today)" class="today-instructor">👤 {{ assist(today) }}</span>
          <span v-if="today.leadClass" class="today-class">🏫 전임 직강 {{ today.leadClass }}반</span>
          <span v-if="today.leadRoom" class="today-classroom">📍 {{ today.leadRoom }}</span>
        </div>
        </div>
        <div v-if="isStudent" class="today-right">
          <router-link :to="'/questions/new?date=' + today.date" class="today-ask">
            <span class="today-ask-text">질문하기</span>
            <span class="today-ask-sub">오늘 수업에 대해 물어보기</span>
          </router-link>
        </div>
       </div>
      </template>
      <template v-else>
        <div class="today-top"><span class="today-label empty">오늘 교육 내용</span></div>
        <div class="today-subject empty">오늘은 교육 일정이 없습니다.</div>
      </template>
    </div>

    <!-- 목록 -->
    <template v-if="view === 'list'">
      <div class="tab-row">
        <button class="tab-btn" :class="{ active: range === 'future' }" @click="range = 'future'">앞으로</button>
        <button class="tab-btn" :class="{ active: range === 'month' }" @click="range = 'month'">이번 달</button>
        <button class="tab-btn" :class="{ active: range === 'all' }" @click="range = 'all'">전체</button>
      </div>

      <div class="grid-card">
        <div class="grid-table">
          <div class="grid-head">
            <div class="gh-cell gh-date">일자</div>
            <div class="gh-cell gh-subject">과목</div>
            <div class="gh-cell gh-ask">질문</div>
            <div class="gh-cell gh-mode">온/오프라인</div>
            <div class="gh-cell gh-ltime">강의시간</div>
            <div class="gh-cell gh-instructor">전임교수</div>
            <div class="gh-cell gh-class">반</div>
            <div class="gh-cell gh-instructor">실습교수</div>
          </div>
          <div v-for="r in listRows" :key="r.date" class="grid-row"
               :class="{ 'row-active': r.date === todayKey, 'row-done': r.date < todayKey, 'row-future': r.date > todayKey, 'row-weekend': r.weekend, 'row-holiday': r.holiday }">
            <div class="gd-cell gd-date">
              <span class="date-val">{{ r.md }}</span>
              <span class="dow-val" :class="{ weekend: r.weekend, holiday: r.holiday }">{{ r.dow }}</span>
            </div>
            <div class="gd-cell gd-subject"><span class="subject-name">{{ r.subject || '—' }}</span></div>
            <div class="gd-cell gd-ask">
              <router-link v-if="isStudent && r.subject && !r.holiday" :to="'/questions/new?date=' + r.date" class="ask-btn">질문</router-link>
            </div>
            <div class="gd-cell gd-mode"><span class="mode-chip" :class="'mode-' + r.mode">{{ modeLabel(r.mode) }}</span></div>
            <div class="gd-cell gd-ltime"><span class="ltime-text">{{ r.ltime || (r.holiday ? '공휴일' : r.weekend ? '주말' : '—') }}</span></div>
            <div class="gd-cell gd-instructor">{{ r.lead || '—' }}</div>
            <div class="gd-cell gd-class">{{ r.leadClass ? r.leadClass + '반' : '-' }}</div>
            <div class="gd-cell gd-instructor">{{ assist(r) || '—' }}</div>
          </div>
          <div v-if="!listRows.length" class="grid-empty">일정이 없습니다.</div>
        </div>
      </div>
    </template>

    <!-- 달력 -->
    <template v-else>
      <div class="cal-card">
        <div class="cal-nav">
          <button class="cal-nav-btn" @click="moveMonth(-1)">‹</button>
          <div class="cal-title">{{ calYear }}년 {{ calMonth + 1 }}월</div>
          <button class="cal-nav-btn" @click="moveMonth(1)">›</button>
          <button class="cal-today-btn" @click="goToday">오늘</button>
        </div>
        <div class="cal-grid">
          <div v-for="(d, i) in ['일','월','화','수','목','금','토']" :key="d" class="cal-dow" :class="{ 'dow-sun': i === 0, 'dow-sat': i === 6 }">{{ d }}</div>
          <div v-for="c in calCells" :key="c.key" class="cal-day"
               :class="{ 'cal-day--other': c.other, 'cal-day--today': c.key === todayKey, 'cal-day--weekend': c.weekend, 'cal-day--holiday': c.row && c.row.holiday, 'cal-day--active': !!(c.row && c.row.subject) }"
               @click="c.row && c.row.subject && (detail = c.row)">
            <div class="cal-day-top">
              <span class="cal-day-num" :class="{ 'num-sun': c.dow === 0, 'num-sat': c.dow === 6, 'num-today': c.key === todayKey }">{{ c.day }}</span>
              <span v-if="c.row && c.row.holiday && !c.other" class="cal-hol-badge">공휴일</span>
            </div>
            <div v-if="c.row && c.row.subject && !c.other" class="cal-event" :class="'type-' + (c.row.holiday ? 'holiday' : c.row.kind)">
              <div class="cal-ev-name">{{ c.row.subject }}</div>
              <div v-if="c.row.ltime" class="cal-ev-ltime">{{ c.row.ltime }}</div>
              <div v-else-if="c.row.holiday" class="cal-ev-instr">공휴일</div>
              <div v-if="c.row.lead || assist(c.row)" class="cal-ev-instr">{{ [...new Set([c.row.lead, assist(c.row)].filter(Boolean))].join(' / ') }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="detail" class="day-detail-backdrop" @click.self="detail = null">
        <div class="day-detail">
          <div class="day-detail-header">
            <span class="day-detail-date">{{ detail.md }} ({{ detail.dow }})</span>
            <button class="day-detail-close" @click="detail = null">✕</button>
          </div>
          <div v-if="detail.holiday" class="day-holiday-notice">🎌 {{ detail.subject }}</div>
          <div v-else class="day-detail-row">
            <div class="day-detail-info">
              <div class="day-detail-subject">{{ detail.subject }}</div>
              <div class="day-detail-meta">
                <span class="mode-chip" :class="'mode-' + detail.mode">{{ modeLabel(detail.mode) }}</span>
                <span v-if="detail.ltime" class="ltime-text">{{ detail.ltime }}</span>
                <span v-if="detail.lead" class="meta-text">전임 {{ detail.lead }}<template v-if="detail.leadClass"> · {{ detail.leadClass }}반</template></span>
                <span v-if="assist(detail)" class="meta-text">실습 {{ assist(detail) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import schedule from '../data/schedule.json'
import { session } from '../data/store'
const user = session.user || { classNo: 4 }
const isStudent = session.user?.role !== 'professor'

const view = ref('list')
const range = ref('future')
const query = ref('')
const detail = ref(null)

// 데모용: ?today=2026-09-02 로 기준일을 고정할 수 있다
const params = new URLSearchParams(location.search)
const todayDate = params.get('today') ? new Date(params.get('today')) : new Date()
const todayKey = fmt(todayDate)
function fmt(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

const byDate = Object.fromEntries(schedule.map(r => [r.date, r]))
const today = computed(() => byDate[todayKey])
const assist = r => (r.instructors && r.instructors[String(user.classNo)]) || ''
const modeLabel = m => ({ online: '온라인', offline: '오프라인' }[m] || '-')
const kindLabel = k => ({ lecture: '강의', project: '프로젝트', eval: '평가', special: '특강' }[k] || '강의')

const listRows = computed(() => {
  const q = query.value.trim()
  return schedule.filter(r => {
    if (range.value === 'future' && r.date < todayKey) return false
    if (range.value === 'month' && r.date.slice(0, 7) !== todayKey.slice(0, 7)) return false
    if (q && !(r.subject || '').includes(q)) return false
    return true
  })
})

// 달력
const calYear = ref(todayDate.getFullYear())
const calMonth = ref(todayDate.getMonth())
function moveMonth(n) { const d = new Date(calYear.value, calMonth.value + n, 1); calYear.value = d.getFullYear(); calMonth.value = d.getMonth() }
function goToday() { calYear.value = todayDate.getFullYear(); calMonth.value = todayDate.getMonth() }
const calCells = computed(() => {
  const first = new Date(calYear.value, calMonth.value, 1)
  const start = new Date(first); start.setDate(1 - first.getDay())
  const cells = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i)
    const key = fmt(d)
    cells.push({ key, day: d.getDate(), dow: d.getDay(), other: d.getMonth() !== calMonth.value, weekend: d.getDay() === 0 || d.getDay() === 6, row: byDate[key] })
  }
  return cells
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.right-controls { display: flex; align-items: center; gap: 8px; }
.search-input { padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; outline: none; background: #fff; width: 160px; }
.search-input:focus { border-color: #6b35ff; }
.view-toggle { display: flex; border: 1.5px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
.toggle-btn { padding: 7px 16px; border: none; background: #fff; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; transition: .15s; }
.toggle-btn.active { background: #6b35ff; color: #fff; }

.today-card { background: linear-gradient(135deg, #6b35ff, #4f46e5); border-radius: 18px; padding: 20px 24px; box-shadow: 0 6px 24px rgba(107,53,255,.32); }
.today-card.today-empty { background: #f1f5f9; box-shadow: none; }
.today-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.today-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.65); letter-spacing: .5px; text-transform: uppercase; }
.today-label.empty { color: #94a3b8; }
.today-subject { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 12px; line-height: 1.3; }
.today-subject.empty { color: #64748b; font-size: 15px; margin-bottom: 0; }
.today-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.today-instructor { display: flex; align-items: center; gap: 4px; font-size: 12px; color: rgba(255,255,255,.75); }
.today-classroom { font-size: 12px; color: rgba(255,255,255,.7); }
.today-body { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.today-left { min-width: 0; flex: 1; }
.today-left .today-meta { margin-bottom: 0; }
.today-right { flex-shrink: 0; }
.today-ask { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-width: 168px; padding: 16px 22px; border-radius: 16px; background: #fff; color: #6b35ff; box-shadow: 0 4px 16px rgba(0,0,0,.18); transition: transform .12s, box-shadow .12s; }
.today-ask:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,0,0,.22); }
.today-ask-text { font-size: 15px; font-weight: 800; margin-top: 4px; }
.today-ask-sub { font-size: 10.5px; color: #94a3b8; font-weight: 600; }
.gh-ask { text-align: center; }
.gd-ask { text-align: center; }
.ask-btn { display: inline-flex; align-items: center; gap: 3px; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; color: #fff; background: #6b35ff; box-shadow: 0 2px 6px rgba(107,53,255,.3); transition: .12s; white-space: nowrap; }
.ask-btn:hover { background: #5a2de0; box-shadow: 0 4px 10px rgba(107,53,255,.35); }
@media (max-width: 700px) { .today-body { flex-direction: column; align-items: stretch; } .today-ask { min-width: 0; } }
.today-class { font-size: 12px; font-weight: 700; color: #fff; background: rgba(255,255,255,.18); padding: 2px 8px; border-radius: 6px; }
.type-badge { flex-shrink: 0; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 5px; white-space: nowrap; }
.type-badge.type-lecture { background: #dbeafe; color: #1d4ed8; }
.type-badge.type-special { background: #fef9c3; color: #a16207; }
.type-badge.type-eval { background: #fce7f3; color: #9d174d; }
.type-badge.type-project { background: #d1fae5; color: #065f46; }

.tab-row { display: flex; gap: 8px; }
.tab-btn { padding: 8px 20px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 10px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; transition: .15s; }
.tab-btn.active { background: #6b35ff; border-color: #6b35ff; color: #fff; }

.grid-card { background: #fff; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; }
.grid-table { display: flex; flex-direction: column; }
.grid-head { display: grid; grid-template-columns: 72px 1fr 88px 84px 100px 80px 52px 80px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 0 16px; }
.gh-cell { padding: 10px 8px; font-size: 11.5px; font-weight: 700; color: #64748b; white-space: nowrap; }
.gh-mode, .gh-ltime, .gh-instructor, .gh-class { text-align: center; }
.grid-row { display: grid; grid-template-columns: 72px 1fr 88px 84px 100px 80px 52px 80px; padding: 0 16px; border-bottom: 1px solid #f1f5f9; transition: background .12s; align-items: center; }
.grid-row:last-child { border-bottom: none; }
.grid-row:hover { background: #faf5ff; }
.grid-row.row-active { background: #f5f3ff; }
.grid-row.row-done { opacity: .6; }
.row-weekend { background: #fafafa; }
.row-holiday { background: #fff5f5; }
.gd-cell { padding: 11px 8px; font-size: 13px; color: #374151; min-width: 0; }
.gd-date { display: flex; align-items: baseline; gap: 5px; }
.date-val { font-size: 13px; font-weight: 700; color: #0f172a; white-space: nowrap; }
.dow-val { font-size: 11px; color: #94a3b8; font-weight: 600; white-space: nowrap; }
.dow-val.weekend { color: #ef4444; }
.dow-val.holiday { color: #dc2626; }
.row-weekend .date-val, .row-weekend .dow-val, .row-weekend .ltime-text { color: #94a3b8; }
.row-holiday .date-val, .row-holiday .dow-val { color: #dc2626; }
.subject-name { font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
.row-weekend .subject-name, .row-holiday .subject-name { color: #94a3b8; font-weight: 500; }
.row-holiday .subject-name { color: #374151; }
.gd-mode, .gd-ltime, .gd-instructor, .gd-class { text-align: center; }
.gd-instructor { font-size: 12.5px; color: #475569; }
.gd-class { font-size: 12.5px; font-weight: 700; color: #4c1d95; }
.ltime-text { font-size: 12px; color: #475569; white-space: nowrap; }
.mode-chip { display: inline-flex; align-items: center; gap: 5px; padding: 2px 7px; border-radius: 6px; font-size: 10.5px; font-weight: 700; white-space: nowrap; }
.today-meta .mode-chip { padding: 3px 8px; border-radius: 20px; font-size: 11px; }
.mode-online { background: #dbeafe; color: #1d4ed8; }
.mode-offline { background: #dcfce7; color: #15803d; }
.mode-none { background: transparent; color: #94a3b8; }
.grid-empty { padding: 32px; text-align: center; font-size: 13px; color: #94a3b8; }

.cal-card { background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.cal-nav { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.cal-nav-btn { width: 32px; height: 32px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; font-size: 18px; cursor: pointer; color: #475569; display: flex; align-items: center; justify-content: center; }
.cal-nav-btn:hover { background: #f1f5f9; }
.cal-title { font-size: 16px; font-weight: 800; color: #0f172a; flex: 1 1 0%; }
.cal-today-btn { padding: 5px 12px; border: 1.5px solid #6b35ff; background: #fff; border-radius: 8px; font-size: 12px; font-weight: 700; color: #6b35ff; cursor: pointer; }
.cal-today-btn:hover { background: #ede9fe; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #e2e8f0; border-radius: 12px; overflow: hidden; }
.cal-dow { background: #f8fafc; padding: 8px 4px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b; }
.cal-dow.dow-sun { color: #ef4444; }
.cal-dow.dow-sat { color: #3b82f6; }
.cal-day { background: #fff; min-height: 88px; padding: 5px; display: flex; flex-direction: column; gap: 2px; cursor: default; transition: background .12s; }
.cal-day--active { cursor: pointer; }
.cal-day--active:hover { background: #faf5ff; }
.cal-day--other { background: #fafafa; }
.cal-day--other .cal-day-num { color: #cbd5e1; }
.cal-day--today { background: #faf5ff; }
.cal-day--weekend { background: #f8f9fb; }
.cal-day--weekend.cal-day--other { background: #f4f5f8; }
.cal-day--holiday { background: #fff5f5 !important; }
.cal-day--holiday:hover { background: #fee2e2 !important; }
.cal-day-top { display: flex; align-items: center; gap: 4px; margin-bottom: 3px; }
.cal-day-num { font-size: 12px; font-weight: 700; color: #374151; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0; }
.cal-day-num.num-sun { color: #ef4444; }
.cal-day-num.num-sat { color: #3b82f6; }
.cal-day-num.num-today { background: #6b35ff; color: #fff !important; }
.cal-hol-badge { font-size: 9px; font-weight: 700; color: #dc2626; background: #fee2e2; padding: 1px 4px; border-radius: 3px; white-space: nowrap; }
.cal-event { font-size: 10px; font-weight: 600; padding: 2px 5px; border-radius: 4px; overflow: hidden; line-height: 1.4; }
.cal-event.type-lecture { background: #dbeafe; color: #1d4ed8; }
.cal-event.type-special { background: #dbeafe; color: #1d4ed8; }
.cal-event.type-eval { background: #fce7f3; color: #9d174d; }
.cal-event.type-project { background: #d1fae5; color: #065f46; }
.cal-event.type-holiday { background: #e0e7ff; color: #3730a3; }
.cal-ev-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cal-ev-ltime { font-size: 9px; font-weight: 700; color: #7c3aed; margin-top: 1px; }
.cal-ev-instr { font-size: 9px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.day-detail-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.day-detail { background: #fff; border-radius: 16px; padding: 20px; width: 100%; max-width: 360px; box-shadow: 0 8px 32px rgba(0,0,0,.18); display: flex; flex-direction: column; gap: 10px; }
.day-detail-header { display: flex; align-items: center; justify-content: space-between; }
.day-detail-date { font-size: 15px; font-weight: 800; color: #0f172a; }
.day-detail-close { width: 28px; height: 28px; border: none; background: #f1f5f9; border-radius: 8px; font-size: 13px; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; }
.day-holiday-notice { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #dc2626; background: #fff5f5; padding: 8px 12px; border-radius: 8px; }
.day-detail-row { padding: 10px 12px; background: #f8fafc; border-radius: 10px; }
.day-detail-subject { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.day-detail-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.meta-text { font-size: 12px; color: #475569; }

@media (max-width: 700px) {
  .grid-card { overflow-x: auto; }
  .grid-head, .grid-row { grid-template-columns: 62px 120px 76px 88px 64px 64px 60px 60px; min-width: 654px; }
}
</style>
