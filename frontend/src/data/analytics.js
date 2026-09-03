// 질문·퀴즈 데이터로 약점/통계를 계산한다 (학생 약점 페이지 · 교수 대시보드 공용)
import { questions } from './store'
import { CONCEPTS } from './quizBank'
import schedule from './schedule.json'

const ATTEMPT_KEY = 'skala_quiz_attempts'
export const attempts = {
  all: () => { try { return JSON.parse(localStorage.getItem(ATTEMPT_KEY)) ?? [] } catch { return [] } },
  mine: (id) => attempts.all().filter(a => a.userId === id),
  add(a) { const l = attempts.all(); l.unshift({ id: Date.now(), at: new Date().toISOString(), ...a }); localStorage.setItem(ATTEMPT_KEY, JSON.stringify(l)) },
}

export const conceptLabel = tag => CONCEPTS[tag]?.label || tag
export const conceptLecture = tag => CONCEPTS[tag]?.lecture || ''

// 태그 → 대표 개념으로 묶기 (jpa, n+1 → 'JPA 연관관계 · fetch 전략' 등 label 기준)
function groupByConcept(list) {
  const m = {}
  for (const q of list) for (const t of q.tags || []) {
    const label = conceptLabel(t)
    m[label] ??= { label, tags: new Set(), count: 0, questions: [], lecture: conceptLecture(t) }
    m[label].tags.add(t); m[label].count++; if (!m[label].questions.includes(q)) m[label].questions.push(q)
  }
  return Object.values(m).map(c => ({ ...c, tags: [...c.tags], count: c.questions.length })).sort((a, b) => b.count - a.count)
}

export function weekOf(dateStr) {
  const row = schedule.find(r => r.date === dateStr?.slice(0, 10))
  if (row?.week) return row.week
  const d = new Date(dateStr); const start = new Date('2026-07-13')
  return Math.max(1, Math.floor((d - start) / (7 * 864e5)) + 1)
}

// ── 학생 ────────────────────────────────────────────────
export function studentAnalytics(userId) {
  const mine = questions.mine(userId)
  const concepts = groupByConcept(mine)
  const myAttempts = attempts.mine(userId)
  // 개념별 퀴즈 정답률
  const acc = {}
  for (const a of myAttempts) for (const r of a.results) {
    const label = conceptLabel(r.tag); acc[label] ??= { correct: 0, total: 0 }
    acc[label].total++; if (r.correct) acc[label].correct++
  }
  const weak = concepts.map(c => {
    const a = acc[c.label]; const rate = a ? Math.round(a.correct / a.total * 100) : null
    const ai = c.questions.flatMap(q => q.answers.filter(x => x.type === 'ai'))
    const lowConf = ai.filter(x => (x.confidence ?? 100) < 70).length
    // 약점 점수: 질문 수 + 낮은 신뢰도 + 퀴즈 오답
    const score = c.count * 2 + lowConf + (rate != null ? Math.round((100 - rate) / 25) : 1)
    return { ...c, rate, attempts: a?.total || 0, lowConf, score, status: rate == null ? '미응시' : rate >= 80 ? '보완됨' : rate >= 50 ? '개선 중' : '취약' }
  }).sort((a, b) => b.score - a.score)
  // 주차별 질문 수
  const byWeek = {}
  for (const q of mine) { const w = weekOf(q.date || q.createdAt); byWeek[w] = (byWeek[w] || 0) + 1 }
  const weeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b)
  // 과목별
  const bySubject = {}
  for (const q of mine) bySubject[q.subject] = (bySubject[q.subject] || 0) + 1
  const subjects = Object.entries(bySubject).sort((a, b) => b[1] - a[1])
  const answered = mine.filter(q => q.status === 'ANSWERED').length
  const aiOnly = mine.filter(q => q.status === 'AI_ANSWERED').length
  const review = mine.filter(q => q.status === 'REVIEW').length
  const avgConf = (() => { const c = mine.flatMap(q => q.answers.filter(a => a.type === 'ai' && a.confidence != null).map(a => a.confidence)); return c.length ? Math.round(c.reduce((s, x) => s + x, 0) / c.length) : null })()
  return { mine, concepts: weak, weeks, byWeek, subjects, answered, aiOnly, review, avgConf, attempts: myAttempts }
}

// ── 교수 ────────────────────────────────────────────────
export function professorAnalytics() {
  const all = questions.all()
  const concepts = groupByConcept(all)
  const byWeek = {}
  for (const q of all) { const w = weekOf(q.date || q.createdAt); byWeek[w] = (byWeek[w] || 0) + 1 }
  const weeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b)
  const bySubject = {}
  for (const q of all) bySubject[q.subject] = (bySubject[q.subject] || 0) + 1
  const subjects = Object.entries(bySubject).sort((a, b) => b[1] - a[1])
  const status = { AI_PENDING: 0, AI_ANSWERED: 0, REVIEW: 0, ANSWERED: 0 }
  for (const q of all) status[q.status] = (status[q.status] || 0) + 1
  const confs = all.flatMap(q => q.answers.filter(a => a.type === 'ai' && a.confidence != null).map(a => a.confidence))
  const avgConf = confs.length ? Math.round(confs.reduce((s, x) => s + x, 0) / confs.length) : null
  const buckets = { '~59': 0, '60~69': 0, '70~79': 0, '80~89': 0, '90~': 0 }
  for (const c of confs) buckets[c < 60 ? '~59' : c < 70 ? '60~69' : c < 80 ? '70~79' : c < 90 ? '80~89' : '90~']++
  const autoRate = all.length ? Math.round((status.AI_ANSWERED + status.ANSWERED) / all.length * 100) : 0
  const reviewQueue = all.filter(q => q.status === 'REVIEW').sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
  // 개선 제안: 질문 2건 이상 개념 → 자료 보강 권장
  const suggestions = concepts.filter(c => c.count >= 2).map(c => ({
    concept: c.label, count: c.count, lecture: c.lecture,
    lowConf: c.questions.flatMap(q => q.answers.filter(a => a.type === 'ai' && (a.confidence ?? 100) < 70)).length,
    text: `${c.label} 관련 질문이 ${c.count}건 반복되었습니다. ${c.lecture ? c.lecture.split(' · ')[1] + ' 자료에' : '해당 차시 자료에'} 예제를 추가하는 것을 권장합니다.`,
  }))
  return { all, concepts, weeks, byWeek, subjects, status, avgConf, buckets, autoRate, reviewQueue, suggestions }
}
