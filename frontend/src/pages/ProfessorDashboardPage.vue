<template>
  <div class="page">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">강의 대시보드</h2>
        <div class="page-sub">학생 질문이 어디에 몰리는지, AI가 얼마나 처리하는지 · 다음 기수 커리큘럼 개선 근거</div>
      </div>
      <router-link to="/questions" class="primary-btn">검토 대기 {{ d.status.REVIEW }}건 보기</router-link>
    </div>

    <div class="stat-cards">
      <div class="stat-card"><div class="stat-k">전체 질문</div><div class="stat-v">{{ d.all.length }}<span class="unit">건</span></div><div class="stat-cmp">이번 기수 누적</div></div>
      <div class="stat-card hi"><div class="stat-k">교수 검토 대기</div><div class="stat-v c-amber">{{ d.status.REVIEW }}<span class="unit">건</span></div><div class="stat-cmp">AI 신뢰도 70 미만</div></div>
      <div class="stat-card"><div class="stat-k">AI 자동 처리율</div><div class="stat-v c-blue">{{ d.autoRate }}%</div><div class="stat-cmp">AI 답변으로 종결 + 교수 확인 완료</div></div>
      <div class="stat-card"><div class="stat-k">평균 AI 신뢰도</div><div class="stat-v c-green">{{ d.avgConf ?? '-' }}</div><div class="stat-cmp">교수 답변이 쌓일수록 올라갑니다</div></div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-title">과목별 질문 수</div>
        <div class="card-sub">어느 과목에서 막히는지</div>
        <ChartCanvas type="bar" :data="subjectChart" :options="hBar" :height="Math.max(180, d.subjects.length * 34)" />
      </div>
      <div class="card">
        <div class="card-title">주차별 질문 추이</div>
        <div class="card-sub">커리큘럼 주차 기준</div>
        <ChartCanvas type="line" :data="weekChart" :options="lineOpt" :height="Math.max(180, d.subjects.length * 34)" />
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-title">답변 처리 상태</div>
        <div class="card-sub">AI 답변 생성 중 · AI 답변 완료 · 교수 검토 대기 · 교수 답변 완료</div>
        <ChartCanvas type="bar" :data="statusChart" :options="statusOpt" :height="180" />
        <div class="legend">
          <span v-for="s in statusRows" :key="s.key"><i :style="{ background: s.color }"></i>{{ s.label }} <b>{{ s.value }}</b></span>
        </div>
      </div>
      <div class="card">
        <div class="card-title">AI 답변 신뢰도 분포</div>
        <div class="card-sub">70 미만은 교수 검토로 넘어갑니다</div>
        <ChartCanvas type="bar" :data="confChart" :options="confOpt" :height="180" />
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-title">반복 질문 개념</div>
        <div class="card-sub">여러 학생이 같은 개념에서 막힘 · 자료 보강 우선순위</div>
        <ChartCanvas type="bar" :data="conceptChart" :options="hBar" :height="Math.max(160, d.concepts.length * 32)" />
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">검토 대기중인 질문</div><router-link to="/questions" class="link">전체 보기 ›</router-link></div>
        <div v-if="!d.reviewQueue.length" class="empty">검토할 질문이 없습니다.</div>
        <router-link v-for="q in d.reviewQueue.slice(0, 5)" :key="q.id" :to="'/questions/' + q.id" class="queue-row">
          <div class="queue-main">
            <div class="queue-title">{{ q.title }}</div>
            <div class="queue-meta"><span class="tag">{{ q.subject }}</span><span>{{ q.authorName }}</span><span>{{ fmt(q.createdAt) }}</span></div>
          </div>
          <span class="conf" :class="confCls(aiConf(q))">신뢰도 {{ aiConf(q) ?? '-' }}</span>
        </router-link>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div><div class="card-title">AI 커리큘럼 개선 제안</div><div class="card-sub">반복 질문과 낮은 신뢰도를 근거로 자동 생성 · 다음 기수 교육자료 설계 참고</div></div><span class="ai-badge">AI 생성</span></div>
      <div v-if="!d.suggestions.length" class="empty">아직 반복 패턴이 없습니다.</div>
      <div class="suggestions">
        <div v-for="s in d.suggestions" :key="s.concept" class="suggestion">
          <div class="sg-head"><span class="sg-concept">{{ s.concept }}</span><span class="sg-count">질문 {{ s.count }}건<template v-if="s.lowConf"> · 신뢰도 낮음 {{ s.lowConf }}건</template></span></div>
          <div class="sg-text">{{ s.text }}</div>
          <div v-if="s.lecture" class="sg-ref">대상 차시 · {{ s.lecture }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ChartCanvas from '../components/ChartCanvas.vue'
import { store, STATUS } from '../data/store'
import { professorAnalytics } from '../data/analytics'
const d = computed(() => { store.version; return professorAnalytics() })
const PURPLE = '#6B35FF'
// 상태 팔레트 (검증 통과: #6B35FF #D97706 #0369A1 #15803D)
const STATUS_COLOR = { AI_PENDING: '#6B35FF', REVIEW: '#D97706', AI_ANSWERED: '#0369A1', ANSWERED: '#15803D' }
const statusRows = computed(() => ['AI_PENDING', 'AI_ANSWERED', 'REVIEW', 'ANSWERED'].map(k => ({ key: k, label: STATUS[k].label, value: d.value.status[k] || 0, color: STATUS_COLOR[k] })))
const subjectChart = computed(() => ({ labels: d.value.subjects.map(s => s[0]), datasets: [{ data: d.value.subjects.map(s => s[1]), backgroundColor: PURPLE, borderRadius: 4, barThickness: 16 }] }))
const conceptChart = computed(() => ({ labels: d.value.concepts.map(c => c.label), datasets: [{ data: d.value.concepts.map(c => c.count), backgroundColor: PURPLE, borderRadius: 4, barThickness: 16 }] }))
const weekChart = computed(() => ({ labels: d.value.weeks.map(w => w + '주차'), datasets: [{ data: d.value.weeks.map(w => d.value.byWeek[w]), borderColor: PURPLE, backgroundColor: 'rgba(107,53,255,.10)', fill: true, tension: .3, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: PURPLE, pointBorderWidth: 2 }] }))
const statusChart = computed(() => ({ labels: statusRows.value.map(s => s.label), datasets: [{ data: statusRows.value.map(s => s.value), backgroundColor: statusRows.value.map(s => s.color), borderRadius: 4, barThickness: 28 }] }))
const confChart = computed(() => ({ labels: Object.keys(d.value.buckets), datasets: [{ data: Object.values(d.value.buckets), backgroundColor: Object.keys(d.value.buckets).map(k => (k === '~59' || k === '60~69') ? '#D97706' : '#0369A1'), borderRadius: 4, barThickness: 28 }] }))
const hBar = { indexAxis: 'y', scales: { x: { grid: { color: '#f1f5f9' }, ticks: { precision: 0 }, beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#0f172a' } } }, plugins: { tooltip: { callbacks: { label: c => ` ${c.parsed.x}건` } } } }
const lineOpt = { plugins: { tooltip: { callbacks: { label: c => ` 질문 ${c.parsed.y}건` } } } }
const statusOpt = { plugins: { tooltip: { callbacks: { label: c => ` ${c.parsed.y}건` } } } }
const confOpt = { scales: { x: { title: { display: true, text: '신뢰도 구간', font: { size: 11 } } } }, plugins: { tooltip: { callbacks: { label: c => ` ${c.parsed.y}건` } } } }
const aiConf = q => q.answers.find(a => a.type === 'ai')?.confidence ?? null
const confCls = c => c == null ? 'none' : c < 70 ? 'lo' : 'hi'
const fmt = s => s ? new Date(s).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit' }) : ''
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.page-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
.primary-btn { padding: 9px 18px; background: #6b35ff; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; white-space: nowrap; }
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { background: #fff; border-radius: 14px; padding: 14px 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.stat-card.hi { border: 1.5px solid #fde68a; background: #fffbeb; }
.stat-k { font-size: 11px; color: #64748b; font-weight: 600; }
.stat-v { font-size: 26px; font-weight: 800; color: #0f172a; margin: 2px 0; }
.unit { font-size: 13px; color: #64748b; margin-left: 3px; font-weight: 600; }
.stat-cmp { font-size: 11px; color: #94a3b8; }
.c-amber { color: #d97706; } .c-blue { color: #0369a1; } .c-green { color: #15803d; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card { background: #fff; border-radius: 16px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.card-title { font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.5; }
.card-sub { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 2px; }
.link { font-size: 12px; font-weight: 700; color: #6b35ff; }
.legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; color: #64748b; }
.legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
.legend b { color: #0f172a; margin-left: 2px; }
.empty { font-size: 13px; color: #94a3b8; padding: 12px 0; }
.queue-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid #f1f5f9; }
.queue-row:first-of-type { border-top: none; }
.queue-main { flex: 1; min-width: 0; }
.queue-title { font-size: 13.5px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.queue-meta { display: flex; gap: 8px; font-size: 11.5px; color: #94a3b8; margin-top: 3px; align-items: center; }
.tag { font-size: 10.5px; font-weight: 700; padding: 1px 7px; border-radius: 6px; background: #dbeafe; color: #1d4ed8; }
.conf { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
.conf.lo { background: #fef3c7; color: #b45309; } .conf.hi { background: #dbeafe; color: #1d4ed8; } .conf.none { background: #f1f5f9; color: #64748b; }
.ai-badge { font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 5px; background: #6b35ff; color: #fff; }
.suggestions { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }
.suggestion { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 14px; }
.sg-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.sg-concept { font-size: 13.5px; font-weight: 800; color: #1e1b4b; line-height: 1.5; }
.sg-count { font-size: 11px; color: #6b35ff; font-weight: 700; line-height: 1.5; white-space: nowrap; }
.sg-text { font-size: 13px; color: #374151; line-height: 1.6; }
.sg-ref { font-size: 11.5px; color: #7c6fb0; line-height: 1.5; margin-top: 8px; font-weight: 600; }
@media (max-width: 1000px) { .two-col { grid-template-columns: 1fr; } .stat-cards { grid-template-columns: repeat(2, 1fr); } }
</style>
