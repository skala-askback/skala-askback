import { reactive } from 'vue'
import { mockQuestions } from './mockQuestions'

const KEYS = { users: 'skala_users', session: 'skala_session', questions: 'skala_questions' }
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))

const readSession = () => { try { return JSON.parse(sessionStorage.getItem(KEYS.session)) } catch { return null } }
export const session = reactive({ user: readSession() })
export const homePath = () => (session.user?.role === 'professor' ? '/dashboard' : '/home')

// 목록 화면이 저장소 변경을 감지하도록 하는 버전 카운터
export const store = reactive({ version: 0 })
const bump = () => { store.version++ }

// ── 인증 ───────────────────────────────────────────────────
export const auth = {
  users: () => read(KEYS.users, []),
  signup({ id, password, name, role }) {
    const users = auth.users()
    if (users.some(u => u.id === id)) return { ok: false, msg: '이미 사용 중인 아이디입니다.' }
    users.push({ id, password, name, role, classNo: 4 })
    write(KEYS.users, users)
    return { ok: true }
  },
  login(id, password, role) {
    const u = auth.users().find(u => u.id === id && u.password === password)
    if (!u) return { ok: false, msg: '아이디 또는 비밀번호가 올바르지 않습니다.' }
    if (u.role !== role) return { ok: false, msg: `${role === 'professor' ? '교수' : '학생'} 계정이 아닙니다.` }
    session.user = { id: u.id, name: u.name, role: u.role, classNo: u.classNo }
    sessionStorage.setItem(KEYS.session, JSON.stringify(session.user))
    return { ok: true }
  },
  logout() { session.user = null; sessionStorage.removeItem(KEYS.session) },
}

// ── 질문 ───────────────────────────────────────────────────
export const STATUS = {
  AI_PENDING: { label: 'AI 답변 생성 중', cls: 'gen' },
  AI_ANSWERED: { label: 'AI 답변 완료', cls: 'ai' },
  REVIEW: { label: '교수 검토 대기', cls: 'review' },
  ANSWERED: { label: '교수 답변 완료', cls: 'done' },
}

export const questions = {
  all: () => read(KEYS.questions, []),
  mine: (id) => questions.all().filter(q => q.authorId === id),
  get: (id) => questions.all().find(q => q.id === Number(id)),
  save(list) { write(KEYS.questions, list); bump() },
  add(q) {
    const list = questions.all()
    const item = { id: Date.now(), createdAt: new Date().toISOString(), status: 'AI_PENDING', answers: [], tags: [], views: 0, likes: 0, ...q }
    list.unshift(item); questions.save(list)
    scheduleAi(item.id)
    return item
  },
  addAnswer(id, { type, author, authorId, content }) {
    const list = questions.all()
    const q = list.find(q => q.id === Number(id)); if (!q) return
    q.answers.push({ id: Date.now(), type, author, authorId, content, createdAt: new Date().toISOString(), likes: 0 })
    q.status = deriveStatus(q)
    questions.save(list)
  },
  updateAnswer(id, answerId, content) {
    const list = questions.all()
    const q = list.find(q => q.id === Number(id)); if (!q) return
    const a = q.answers.find(a => a.id === answerId); if (!a) return
    a.content = content; a.editedAt = new Date().toISOString()
    questions.save(list)
  },
  deleteAnswer(id, answerId) {
    const list = questions.all()
    const q = list.find(q => q.id === Number(id)); if (!q) return
    q.answers = q.answers.filter(a => a.id !== answerId)
    q.status = deriveStatus(q)
    questions.save(list)
  },
  view(id) {
    const list = questions.all(); const q = list.find(q => q.id === Number(id))
    if (q) { q.views = (q.views || 0) + 1; write(KEYS.questions, list) }
  },
}

// 답변 구성으로 상태를 다시 계산한다: 교수 답변 있음 → ANSWERED, AI 만 있음 → 신뢰도로, 없음 → 생성 중
function deriveStatus(q) {
  if (q.answers.some(a => a.type === 'professor')) return 'ANSWERED'
  const ai = q.answers.find(a => a.type === 'ai')
  if (ai) return (ai.confidence ?? 0) >= 70 ? 'AI_ANSWERED' : 'REVIEW'
  return 'AI_PENDING'
}

// ── Mock AI (RAG) 답변 생성 ────────────────────────────────
// 실제 연동 시 이 함수만 백엔드 호출로 교체한다. 질문 등록 → 잠시 후 AI 답변 → 신뢰도 낮으면 교수 검토 요청
const AI_NAME = 'aSkback AI'
const DISCLAIMER = '저는 강의자료와 과거 질문·답변을 참고해 먼저 답변을 드리고 있습니다. 현재 베타 기능이라 답변이 정확하지 않을 수 있으며, 신뢰도가 낮은 경우 교수님께 검토를 요청합니다.'
const TOPIC_HINTS = [
  { kw: /cors/i, text: 'CORS 는 브라우저가 막는 것이라 서버 설정이 핵심입니다. WebMvcConfigurer 의 addCorsMappings 에서 allowedOrigins 에 프론트 주소(http://localhost:5173)를 정확히 넣었는지, 그리고 Spring Security 를 함께 쓰고 있다면 Security 쪽에도 cors() 설정이 필요합니다. 설정 후 서버를 재시작해야 반영됩니다.', src: '강의자료 5주차 REST API p.27' },
  { kw: /jpa|n\+1|entity|영속/i, text: 'JPA 연관관계 조회 문제는 대부분 fetch 전략과 관련이 있습니다. 목록 조회에서 연관 엔티티를 함께 써야 한다면 fetch join 으로 한 번에 가져오고, 단건 조회는 지연 로딩을 그대로 두는 것이 기본입니다.', src: '강의자료 4주차 JPA 연관관계 p.18' },
  { kw: /docker|컨테이너/i, text: '컨테이너 간 통신은 같은 docker network 안에서 컨테이너 이름으로 접속해야 합니다. localhost 는 컨테이너 자기 자신을 가리킵니다.', src: '강의자료 7주차 컨테이너 네트워크 p.23' },
  { kw: /vue|v-model|ref|reactive/i, text: 'Vue 반응형은 ref 의 .value 접근과 reactive 객체의 교체 여부에서 문제가 생기는 경우가 많습니다. script 에서는 .value 를 통해 수정해야 화면이 갱신됩니다.', src: '강의자료 6주차 Vue 반응형 p.9' },
  { kw: /git|커밋|브랜치|rebase|merge/i, text: 'Git 문제는 현재 상태를 git status 와 git log --oneline --graph 로 먼저 확인하는 것이 출발점입니다. 진행 중인 작업을 취소하려면 --abort, 되돌리려면 reflog 를 활용합니다.', src: '강의자료 1주차 Git 브랜치 전략 p.14' },
]
function scheduleAi(id) {
  setTimeout(() => {
    const list = questions.all(); const q = list.find(q => q.id === id)
    if (!q || q.status !== 'AI_PENDING') return
    const text = `${q.title} ${q.content} ${(q.tags || []).join(' ')}`
    const hint = TOPIC_HINTS.find(h => h.kw.test(text))
    const confidence = hint ? 78 + Math.floor(Math.random() * 18) : 48 + Math.floor(Math.random() * 18)
    const body = hint
      ? hint.text
      : `질문 주신 내용과 정확히 일치하는 강의자료나 과거 질문을 찾지 못했습니다. 유사한 사례를 바탕으로 정리하면, 먼저 오류 메시지 전체와 실행 환경(버전·설정)을 함께 올려주시면 원인을 좁힐 수 있습니다. 정확한 답변을 위해 교수님께 검토를 요청드렸습니다.`
    q.answers.push({
      id: Date.now(), type: 'ai', author: AI_NAME, createdAt: new Date().toISOString(), confidence, likes: 0,
      content: `안녕하세요, ${AI_NAME}입니다. ${q.authorName}님.\n\n${body}`,
      sources: hint ? [{ type: 'lecture', label: hint.src }, { type: 'question', label: `과거 질문 · ${q.subject} 관련 유사 사례` }] : [{ type: 'question', label: `과거 질문 · ${q.subject} 유사 사례 없음` }],
      disclaimer: DISCLAIMER,
      reviewReason: confidence < 70 ? '강의자료 매칭 약함 · 유사 질문 부족' : undefined,
    })
    q.status = confidence >= 70 ? 'AI_ANSWERED' : 'REVIEW'
    questions.save(list)
  }, 1800)
}

// ── 다른 탭·창에서 저장소가 바뀌면 화면 갱신 (같은 브라우저 프로필 안에서 동작) ──
window.addEventListener('storage', (e) => {
  if (e.key === KEYS.questions || e.key === KEYS.users || e.key === null) bump()
})

// ── 최초 실행 시 목 데이터 심기 ──────────────────────────────
function seed() {
  const users = auth.users()
  const need = [
    { id: 'G000', password: 'G000', name: '이학생', role: 'student', classNo: 4 },
    { id: 'G001', password: 'G001', name: '김교수', role: 'professor', classNo: 4 },
  ]
  let changed = false
  for (const u of need) if (!users.some(x => x.id === u.id)) { users.push(u); changed = true }
  if (changed) write(KEYS.users, users)
  if (!localStorage.getItem(KEYS.questions)) write(KEYS.questions, mockQuestions)
  // 생성 중인 AI 답변이 남아 있으면 이어서 처리
  questions.all().filter(q => q.status === 'AI_PENDING').forEach(q => scheduleAi(q.id))
}
seed()
