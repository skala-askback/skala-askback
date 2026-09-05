<template>
  <div class="page">
    <div class="page-title-row">
      <div>
        <h2 class="page-title">약점 퀴즈</h2>
        <div class="page-sub">내 질문에서 나온 개념으로 문제를 냅니다 · 풀이 결과는 약점 분석에 반영됩니다</div>
      </div>
      <router-link to="/weakness" class="ghost-btn">약점 분석으로</router-link>
    </div>

    <!-- 1) 설정 -->
    <div v-if="phase === 'setup'" class="card setup">
      <div class="setup-title">어떤 개념을 풀까요?</div>
      <div class="scope-list">
        <button class="scope" :class="{ active: scope === 'all' }" @click="scope = 'all'">
          <div class="scope-name">내 약점 전체</div>
          <div class="scope-sub">{{ weakTags.length ? weakLabels.join(' · ') : '질문이 없어 기본 진단 문제로 구성' }}</div>
        </button>
        <button v-for="c in concepts" :key="c.label" class="scope" :class="{ active: scope === c.tags[0] }" @click="scope = c.tags[0]">
          <div class="scope-name">{{ c.label }}</div>
          <div class="scope-sub">내 질문 {{ c.count }}건{{ c.rate != null ? ' · 정답률 ' + c.rate + '%' : '' }}</div>
        </button>
      </div>
      <div class="setup-foot">
        <span class="count">문항 <b>{{ previewCount }}</b>개<span v-if="lastIds.size" class="count-note"> · 직전 회차와 다른 문제로 출제</span></span>
        <button class="primary-btn" :disabled="!previewCount" @click="start">{{ lastIds.size ? '다시 풀기' : '시작하기' }}</button>
      </div>
    </div>

    <!-- 2) 풀이 -->
    <div v-else-if="phase === 'quiz'" class="card quiz">
      <div class="quiz-top">
        <span class="concept-chip">{{ conceptLabel(current.tag) }}</span>
        <span class="progress-text">{{ idx + 1 }} / {{ pool.length }}</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" :style="{ width: ((idx + (answered ? 1 : 0)) / pool.length * 100) + '%' }"></div></div>
      <div class="q-text">{{ current.q }}</div>
      <div class="options">
        <button v-for="(o, i) in current.options" :key="i" class="option" :disabled="answered"
                :class="{ selected: picked === i, correct: answered && i === current.answer, wrong: answered && picked === i && i !== current.answer }"
                @click="picked = i">
          <span class="opt-letter">{{ 'ABCD'[i] }}</span><span class="opt-text">{{ o }}</span>
        </button>
      </div>
      <div v-if="answered" class="explain" :class="picked === current.answer ? 'ok' : 'bad'">
        <div class="explain-title">{{ picked === current.answer ? '정답입니다' : '오답입니다 · 정답은 ' + 'ABCD'[current.answer] }}</div>
        <div class="explain-text">{{ current.why }}</div>
        <div class="explain-ref">관련 복습 · {{ conceptLecture(current.tag) || '강의자료' }}</div>
      </div>
      <div class="quiz-actions">
        <button class="ghost-btn" @click="quit">그만두기</button>
        <button v-if="!answered" class="primary-btn" :disabled="picked == null" @click="submit">제출</button>
        <button v-else class="primary-btn" @click="next">{{ idx + 1 < pool.length ? '다음 문항' : '결과 보기' }}</button>
      </div>
    </div>

    <!-- 3) 결과 -->
    <div v-else class="result-wrap">
      <div class="card result">
        <div class="result-score">{{ score }}<span>/ {{ pool.length }}</span></div>
        <div class="result-title">{{ score === pool.length ? '전부 맞혔습니다' : score >= pool.length * .6 ? '개선되고 있습니다' : '아직 취약한 개념이 있습니다' }}</div>
        <div class="result-sub">결과가 약점 분석에 반영되었습니다</div>
        <div class="result-actions">
          <router-link to="/weakness" class="primary-btn">약점 분석 보기</router-link>
          <button class="ghost-btn" @click="phase = 'setup'">다시 풀기</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">개념별 결과</div>
        <table class="tbl">
          <thead><tr><th>개념</th><th>정답</th><th>문항</th><th>상태</th></tr></thead>
          <tbody>
            <tr v-for="r in byConcept" :key="r.label"><td>{{ r.label }}</td><td>{{ r.correct }}</td><td>{{ r.total }}</td>
              <td><span class="status-chip" :class="r.correct === r.total ? 'good' : r.correct ? 'mid' : 'bad'">{{ r.correct === r.total ? '보완됨' : r.correct ? '개선 중' : '취약' }}</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { session, store } from '../data/store'
import { studentAnalytics, attempts, conceptLabel, conceptLecture } from '../data/analytics'
import { QUIZ_BANK } from '../data/quizBank'
const route = useRoute()
const a = computed(() => { store.version; return studentAnalytics(session.user?.id) })
const concepts = computed(() => a.value.concepts)
const weakTags = computed(() => [...new Set(concepts.value.flatMap(c => c.tags))])
const weakLabels = computed(() => [...new Set(weakTags.value.map(conceptLabel))].slice(0, 4))
const scope = ref(route.query.tag ? String(route.query.tag) : 'all')
const shuffle = arr => [...arr].sort(() => Math.random() - .5)
const BANK = QUIZ_BANK.map((x, i) => ({ ...x, id: i }))
// 이 범위에서 출제 가능한 문제 전체
const candidates = computed(() => {
  if (scope.value !== 'all') { const label = conceptLabel(scope.value); return BANK.filter(x => conceptLabel(x.tag) === label) }
  if (!weakTags.value.length) return BANK
  const labels = new Set(weakTags.value.map(conceptLabel))
  return BANK.filter(x => labels.has(conceptLabel(x.tag)))
})
// 한 회차 문항 수: 전체는 8, 개념 하나는 후보의 절반(3~5) → 다시 풀기 때 겹치지 않는 문제가 남도록
const LIMIT = computed(() => scope.value === 'all' ? (weakTags.value.length ? 8 : 5) : Math.min(5, Math.max(3, Math.floor(candidates.value.length / 2))))
// 직전 회차에 나온 문제는 피한다 (다시 풀기 → 다른 문제). 남은 게 모자라면 직전 문제로 채운다
const lastIds = ref(new Set())
function buildPool() {
  const fresh = shuffle(candidates.value.filter(x => !lastIds.value.has(x.id)))
  const reused = shuffle(candidates.value.filter(x => lastIds.value.has(x.id)))
  return [...fresh, ...reused].slice(0, LIMIT.value)
}
const pool = ref([])
const previewCount = computed(() => Math.min(LIMIT.value, candidates.value.length))
const phase = ref('setup'); const idx = ref(0); const picked = ref(null); const answered = ref(false); const results = ref([])
const current = computed(() => pool.value[idx.value])
function start() {
  pool.value = buildPool()
  lastIds.value = new Set(pool.value.map(x => x.id))
  idx.value = 0; picked.value = null; answered.value = false; results.value = []; phase.value = 'quiz'
}
function submit() { answered.value = true; results.value.push({ tag: current.value.tag, correct: picked.value === current.value.answer }) }
function next() {
  if (idx.value + 1 < pool.value.length) { idx.value++; picked.value = null; answered.value = false; return }
  attempts.add({ userId: session.user.id, scope: scope.value, results: results.value, score: score.value, total: pool.value.length })
  store.version++; phase.value = 'result'
}
function quit() { phase.value = 'setup' }
const score = computed(() => results.value.filter(r => r.correct).length)
const byConcept = computed(() => { const m = {}; for (const r of results.value) { const l = conceptLabel(r.tag); m[l] ??= { label: l, correct: 0, total: 0 }; m[l].total++; if (r.correct) m[l].correct++ } return Object.values(m) })
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; width: 100%; max-width: 880px; margin: 0 auto; }
.page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.page-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
.card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 12px; }
.card-title { font-size: 14px; font-weight: 800; color: #0f172a; }
.primary-btn { padding: 10px 20px; background: #6b35ff; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
.primary-btn:disabled { background: #c4b5fd; cursor: not-allowed; }
.ghost-btn { padding: 10px 18px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 10px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; font-family: inherit; }
.setup-title { font-size: 16px; font-weight: 800; color: #0f172a; }
.scope-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.scope { text-align: left; padding: 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; font-family: inherit; transition: .12s; }
.scope:hover { border-color: #c4b5fd; }
.scope.active { border-color: #6b35ff; background: #f5f3ff; box-shadow: 0 0 0 3px rgba(107,53,255,.12); }
.scope-name { font-size: 14px; font-weight: 800; color: #0f172a; }
.scope-sub { font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.5; }
.setup-foot { display: flex; align-items: center; justify-content: flex-end; gap: 14px; margin-top: 4px; }
.count { font-size: 13px; color: #64748b; } .count b { color: #0f172a; }
.count-note { color: #6b35ff; font-weight: 600; }
.quiz, .setup { width: 100%; max-width: 880px; margin: 0 auto; }
.quiz-top { display: flex; align-items: center; justify-content: space-between; }
.concept-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: #ede9fe; color: #6b35ff; }
.progress-text { font-size: 12px; font-weight: 700; color: #64748b; }
.progress-bar { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #6b35ff; transition: width .3s; }
.q-text { font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.5; margin: 6px 0; }
.options { display: flex; flex-direction: column; gap: 8px; }
.option { display: flex; align-items: center; gap: 12px; text-align: left; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; font-family: inherit; font-size: 14px; color: #0f172a; transition: .12s; }
.option:hover:not(:disabled) { border-color: #c4b5fd; background: #faf5ff; }
.option.selected { border-color: #6b35ff; background: #f5f3ff; }
.option.correct { border-color: #15803d; background: #f0fdf4; }
.option.wrong { border-color: #dc2626; background: #fef2f2; }
.option:disabled { cursor: default; }
.opt-letter { width: 26px; height: 26px; border-radius: 50%; background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.option.selected .opt-letter { background: #6b35ff; color: #fff; }
.option.correct .opt-letter { background: #15803d; color: #fff; }
.option.wrong .opt-letter { background: #dc2626; color: #fff; }
.explain { border-radius: 12px; padding: 14px 16px; }
.explain.ok { background: #f0fdf4; border: 1px solid #bbf7d0; }
.explain.bad { background: #fef2f2; border: 1px solid #fecaca; }
.explain-title { font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
.explain-text { font-size: 13.5px; color: #374151; line-height: 1.7; }
.explain-ref { font-size: 12px; color: #6b35ff; font-weight: 600; margin-top: 8px; }
.quiz-actions { display: flex; justify-content: space-between; gap: 8px; margin-top: 4px; }
.result-wrap { display: grid; grid-template-columns: 300px 1fr; gap: 16px; align-items: start; width: 100%; max-width: 880px; margin: 0 auto; }
.result { align-items: center; text-align: center; padding: 32px 20px; }
.result-score { font-size: 48px; font-weight: 900; color: #6b35ff; line-height: 1; }
.result-score span { font-size: 18px; color: #94a3b8; margin-left: 6px; font-weight: 700; }
.result-title { font-size: 16px; font-weight: 800; color: #0f172a; }
.result-sub { font-size: 12.5px; color: #64748b; }
.result-actions { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 8px; }
.result-actions .primary-btn, .result-actions .ghost-btn { text-align: center; }
.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
.tbl th { background: #f8fafc; color: #64748b; font-weight: 700; padding: 9px 10px; border-bottom: 2px solid #e2e8f0; text-align: left; }
.tbl td { padding: 10px; border-bottom: 1px solid #f1f5f9; color: #374151; }
.status-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.status-chip.bad { background: #fef3c7; color: #b45309; } .status-chip.mid { background: #dbeafe; color: #1d4ed8; } .status-chip.good { background: #dcfce7; color: #15803d; }
@media (max-width: 900px) { .result-wrap { grid-template-columns: 1fr; } }
</style>
