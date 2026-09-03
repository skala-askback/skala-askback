<template>
  <div class="page">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">내 약점 분석</h2>
        <div class="page-sub">내가 올린 질문 {{ a.mine.length }}건과 퀴즈 결과를 바탕으로 어디가 약한지 짚어드립니다</div>
      </div>
      <router-link to="/quiz" class="primary-btn">약점 퀴즈 풀기</router-link>
    </div>

    <div v-if="!a.mine.length" class="card empty-card">
      <div class="empty-title">아직 분석할 질문이 없습니다</div>
      <div class="empty-sub">질문을 올리면 개념별로 약점을 찾아드립니다. 질문 없이 시작하려면 진단 퀴즈를 먼저 풀어보세요.</div>
      <div class="empty-actions"><router-link to="/questions/new" class="primary-btn">질문하기</router-link><router-link to="/quiz" class="ghost-btn">진단 퀴즈</router-link></div>
    </div>

    <template v-else>
      <div class="stat-cards">
        <div class="stat-card"><div class="stat-k">내 질문</div><div class="stat-v">{{ a.mine.length }}<span class="unit">건</span></div><div class="stat-cmp">교수 답변 {{ a.answered }} · AI 답변 {{ a.aiOnly }} · 검토 대기 {{ a.review }}</div></div>
        <div class="stat-card"><div class="stat-k">취약 개념</div><div class="stat-v c-amber">{{ weakCount }}<span class="unit">개</span></div><div class="stat-cmp">질문이 반복되거나 퀴즈 정답률이 낮은 개념</div></div>
        <div class="stat-card"><div class="stat-k">평균 AI 신뢰도</div><div class="stat-v c-blue">{{ a.avgConf ?? '-' }}</div><div class="stat-cmp">낮을수록 강의자료 밖 질문이 많다는 뜻</div></div>
        <div class="stat-card"><div class="stat-k">퀴즈 정답률</div><div class="stat-v c-green">{{ quizRate == null ? '-' : quizRate + '%' }}</div><div class="stat-cmp">{{ a.attempts.length }}회 응시</div></div>
      </div>

      <div class="two-col">
        <div class="card">
          <div class="card-title">질문이 몰린 개념</div>
          <div class="card-sub">개념별 내 질문 수 · 많을수록 위</div>
          <ChartCanvas type="bar" :data="conceptChart" :options="hBar" :height="Math.max(160, a.concepts.length * 38)" />
        </div>
        <div class="card">
          <div class="card-title">주차별 질문 추이</div>
          <div class="card-sub">어느 주차에 많이 막혔는지</div>
          <ChartCanvas type="line" :data="weekChart" :options="lineOpt" :height="Math.max(160, a.concepts.length * 38)" />
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div><div class="card-title">개념별 진단</div><div class="card-sub">근거가 된 내 질문과 추천 복습 차시 · 퀴즈로 보완 여부를 확인합니다</div></div></div>
        <div class="concept-list">
          <div v-for="c in a.concepts" :key="c.label" class="concept">
            <div class="concept-head">
              <div class="concept-name">{{ c.label }}</div>
              <span class="status-chip" :class="statusCls(c.status)">{{ c.status }}</span>
            </div>
            <div class="concept-meta">
              <span class="meta-chip">질문 {{ c.count }}건</span>
              <span v-if="c.lowConf" class="meta-chip warn">AI 신뢰도 낮음 {{ c.lowConf }}건</span>
            </div>
            <div v-if="c.lecture" class="lecture">복습 · {{ c.lecture }}</div>
            <div class="evidence">
              <router-link v-for="q in c.questions.slice(0, 2)" :key="q.id" :to="'/questions/' + q.id" class="evidence-link">{{ q.title }}</router-link>
              <span v-if="c.questions.length > 2" class="evidence-more">외 {{ c.questions.length - 2 }}건</span>
            </div>
            <div class="concept-foot">
              <div class="rate">
                <div class="rate-label">퀴즈 정답률 <b>{{ c.rate == null ? '미응시' : c.rate + '%' }}</b></div>
                <div class="rate-bar"><div class="rate-fill" :class="statusCls(c.status)" :style="{ width: (c.rate ?? 0) + '%' }"></div></div>
              </div>
              <router-link :to="'/quiz?tag=' + encodeURIComponent(c.tags[0])" class="ghost-btn small">퀴즈 풀기</router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="card" v-if="a.subjects.length > 1">
        <div class="card-title">과목별 질문 수</div>
        <ChartCanvas type="bar" :data="subjectChart" :options="hBar" :height="Math.max(120, a.subjects.length * 34)" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ChartCanvas from '../components/ChartCanvas.vue'
import { session, store } from '../data/store'
import { studentAnalytics } from '../data/analytics'
const a = computed(() => { store.version; return studentAnalytics(session.user?.id) })
const weakCount = computed(() => a.value.concepts.filter(c => c.status === '취약' || c.status === '미응시').length)
const quizRate = computed(() => { const r = a.value.attempts; if (!r.length) return null; const t = r.reduce((s, x) => s + x.total, 0); const c = r.reduce((s, x) => s + x.score, 0); return t ? Math.round(c / t * 100) : null })
const statusCls = s => ({ '취약': 'bad', '개선 중': 'mid', '보완됨': 'good', '미응시': 'none' }[s])
const PURPLE = '#6B35FF'
const conceptChart = computed(() => ({ labels: a.value.concepts.map(c => c.label), datasets: [{ data: a.value.concepts.map(c => c.count), backgroundColor: PURPLE, borderRadius: 4, barThickness: 16 }] }))
const subjectChart = computed(() => ({ labels: a.value.subjects.map(s => s[0]), datasets: [{ data: a.value.subjects.map(s => s[1]), backgroundColor: PURPLE, borderRadius: 4, barThickness: 16 }] }))
const weekChart = computed(() => ({ labels: a.value.weeks.map(w => w + '주차'), datasets: [{ data: a.value.weeks.map(w => a.value.byWeek[w]), borderColor: PURPLE, backgroundColor: 'rgba(107,53,255,.10)', fill: true, tension: .3, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: PURPLE, pointBorderWidth: 2 }] }))
const hBar = { indexAxis: 'y', scales: { x: { grid: { color: '#f1f5f9' }, ticks: { precision: 0 }, beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#0f172a' } } }, plugins: { tooltip: { callbacks: { label: c => ` ${c.parsed.x}건` } } } }
const lineOpt = { plugins: { tooltip: { callbacks: { label: c => ` 질문 ${c.parsed.y}건` } } } }
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.page-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
.primary-btn { padding: 9px 18px; background: #6b35ff; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; }
.ghost-btn { padding: 9px 18px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 10px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; font-family: inherit; white-space: nowrap; }
.ghost-btn.small { padding: 6px 12px; font-size: 12px; color: #6b35ff; border-color: #ddd6fe; }
.ghost-btn.small:hover { background: #f5f3ff; }
.card { background: #fff; border-radius: 16px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.card-head { display: flex; align-items: center; justify-content: space-between; }
.card-title { font-size: 14px; font-weight: 800; color: #0f172a; }
.card-sub { font-size: 12px; color: #94a3b8; margin-top: -4px; }
.empty-card { align-items: center; text-align: center; padding: 40px 20px; gap: 8px; }
.empty-title { font-size: 16px; font-weight: 800; color: #0f172a; }
.empty-sub { font-size: 13px; color: #64748b; max-width: 420px; line-height: 1.6; }
.empty-actions { display: flex; gap: 8px; margin-top: 8px; }
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { background: #fff; border-radius: 14px; padding: 14px 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.stat-k { font-size: 11px; color: #64748b; font-weight: 600; }
.stat-v { font-size: 26px; font-weight: 800; color: #0f172a; margin: 2px 0; }
.unit { font-size: 13px; color: #64748b; margin-left: 3px; font-weight: 600; }
.stat-cmp { font-size: 11px; color: #94a3b8; }
.c-amber { color: #d97706; } .c-blue { color: #0369a1; } .c-green { color: #15803d; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.concept-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
.concept { border: 1.5px solid #eef2f7; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 8px; background: #fff; transition: .12s; }
.concept:hover { border-color: #ddd6fe; box-shadow: 0 4px 14px rgba(107,53,255,.08); }
.concept-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.concept-name { font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.3; }
.status-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.status-chip.bad { background: #fef3c7; color: #b45309; }
.status-chip.mid { background: #dbeafe; color: #1d4ed8; }
.status-chip.good { background: #dcfce7; color: #15803d; }
.status-chip.none { background: #f1f5f9; color: #64748b; }
.concept-meta { display: flex; gap: 6px; flex-wrap: wrap; }
.meta-chip { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: #f1f5f9; color: #475569; }
.meta-chip.warn { background: #fef3c7; color: #b45309; }
.lecture { font-size: 12px; color: #6b35ff; font-weight: 600; }
.evidence { display: flex; flex-direction: column; gap: 3px; padding: 8px 10px; background: #f8fafc; border-radius: 8px; }
.evidence-link { font-size: 12.5px; color: #334155; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.evidence-link:hover { color: #6b35ff; }
.evidence-more { font-size: 11.5px; color: #94a3b8; }
.concept-foot { display: flex; align-items: flex-end; gap: 12px; margin-top: auto; padding-top: 4px; }
.rate { flex: 1; min-width: 0; }
.rate-label { font-size: 12px; color: #64748b; margin-bottom: 5px; }
.rate-label b { color: #0f172a; }
.rate-bar { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
.rate-fill { height: 100%; border-radius: 3px; background: #94a3b8; }
.rate-fill.bad { background: #d97706; } .rate-fill.mid { background: #0369a1; } .rate-fill.good { background: #15803d; }
@media (max-width: 1000px) { .two-col { grid-template-columns: 1fr; } .stat-cards { grid-template-columns: repeat(2, 1fr); } }
</style>
