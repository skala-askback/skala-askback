<template>
  <div class="page" v-if="q">
    <div class="detail-grid">
      <!-- 왼쪽: 질문 + 답변 -->
      <div class="main">
        <div class="card q-card">
          <div class="q-course">
            <span class="q-course-icon"></span>
            <div><div class="q-course-name">{{ q.subject }}</div><div class="q-course-sub">{{ q.date ? q.date.slice(5).replace('-', '.') + ' 교육일정' : '교육과정' }}</div></div>
          </div>
          <h1 class="q-title">{{ q.title }}</h1>
          <div class="q-meta">{{ fmt(q.createdAt) }} 작성</div>
          <div class="q-content">
            <p class="q-text">{{ q.content }}</p>
            <div class="tags"><span v-for="t in q.tags" :key="t" class="tag">{{ t }}</span></div>
          </div>
        </div>

        <div class="card">
          <div class="ans-head">
            <div class="ans-title">답변 <b>{{ q.answers.length }}</b></div>
            <span class="status-chip" :class="STATUS[q.status].cls">{{ STATUS[q.status].label }}</span>
          </div>

          <div class="ans-input">
            <textarea v-model="draft" class="input" rows="2" :placeholder="isProf ? '교수 답변을 작성해보세요.' : '댓글이나 추가 질문을 작성해보세요.'"></textarea>
            <button class="primary-btn" @click="post">{{ isProf ? '답변 등록' : '댓글 등록' }}</button>
          </div>

          <div v-if="q.status === 'AI_PENDING'" class="ai-generating">
            <span class="spinner"></span> aSkback AI가 강의자료와 과거 질문을 찾아 답변을 준비하고 있습니다…
          </div>

          <div v-for="a in q.answers" :key="a.id" class="answer" :class="'answer--' + a.type">
            <div class="answer-body">
              <div class="answer-head">
                <div class="avatar" :class="'avatar--' + a.type">{{ a.type === 'ai' ? 'AI' : a.author.slice(0, 1) }}</div>
                <div>
                  <div class="author-row">
                    <span class="author">{{ a.author }}</span>
                    <span v-if="a.type === 'ai'" class="badge badge-ai">AI 답변</span>
                    <span v-if="a.type === 'ai' && a.confidence != null" class="badge" :class="a.confidence >= 70 ? 'badge-conf-hi' : 'badge-conf-lo'">신뢰도 {{ a.confidence }}</span>
                    <span v-if="a.type === 'professor'" class="badge badge-prof">교수</span>
                  </div>
                  <div class="answer-date">{{ fmt(a.createdAt) }}<span v-if="a.editedAt" class="edited">(수정됨 · {{ fmt(a.editedAt) }})</span></div>
                </div>
                <div v-if="isMine(a) && editingId !== a.id" class="own-actions">
                  <button class="text-btn" @click="startEdit(a)">수정</button>
                  <button class="text-btn danger" @click="remove(a)">삭제</button>
                </div>
              </div>
              <div v-if="editingId === a.id" class="edit-box">
                <textarea v-model="editDraft" class="input" rows="4"></textarea>
                <div class="edit-actions">
                  <button class="ghost-btn" @click="editingId = null">취소</button>
                  <button class="primary-btn" @click="saveEdit(a)">저장</button>
                </div>
              </div>
              <p v-else class="answer-text">{{ a.content }}</p>
              <template v-if="a.type === 'ai'">
                <div v-if="a.sources && a.sources.length" class="sources">
                  <div class="sources-title">참고한 자료</div>
                  <ul>
                    <li v-for="(s, i) in a.sources" :key="i"><span class="src-kind">{{ s.type === 'lecture' ? '강의자료' : '과거 질문' }}</span><a class="src-link">{{ s.label }}</a></li>
                  </ul>
                </div>
                <div v-if="a.reviewReason" class="review-note">신뢰도가 낮아 교수님께 검토를 요청했습니다 — {{ a.reviewReason }}</div>
                <p class="disclaimer">{{ a.disclaimer }}<br>추가로 궁금한 점이 있으시면 이어서 질문해 주세요. 곧 교수님께서 답변해 주실 것입니다.</p>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 오른쪽 사이드 -->
      <div class="side">
        <div class="card author-card">
          <div class="avatar avatar--student big">{{ q.authorName.slice(0, 1) }}</div>
          <div><div class="author-name">{{ q.authorName }}</div><div class="author-sub">작성한 질문수 {{ authorCount }}</div></div>
        </div>
        <div class="card">
          <div class="side-head"><span class="side-title">이 글과 비슷한 Q&A</span><router-link to="/questions" class="side-link">전체 Q&A ›</router-link></div>
          <div v-if="!similar.length" class="side-empty">비슷한 질문이 아직 없습니다.</div>
          <router-link v-for="s in similar" :key="s.id" :to="'/questions/' + s.id" class="sim-row">
            <div class="sim-title">{{ s.title }}</div>
            <div class="sim-meta"><span>{{ fmt(s.createdAt) }}</span><span class="sim-stats">답변 {{ s.answers.length }}</span></div>
          </router-link>
        </div>
        <router-link v-if="!isProf" to="/questions/new" class="ask-big">질문하기</router-link>
        <router-link v-else to="/questions" class="ask-big outline">검토 목록으로</router-link>
      </div>
    </div>
  </div>
  <div v-else class="page"><div class="card empty">질문을 찾을 수 없습니다. <router-link to="/questions">목록으로</router-link></div></div>

  <Teleport to="body">
    <div v-if="confirmTarget" class="modal-backdrop" @click.self="confirmTarget = null">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-icon">🗑</div>
        <div class="modal-title">{{ confirmTarget.type === 'professor' ? '답변을 삭제할까요?' : '댓글을 삭제할까요?' }}</div>
        <div class="modal-desc">삭제하면 되돌릴 수 없습니다.<template v-if="confirmTarget.type === 'professor'"><br>교수 답변을 지우면 질문 상태가 이전 단계로 돌아갑니다.</template></div>
        <div class="modal-actions">
          <button class="ghost-btn" @click="confirmTarget = null">취소</button>
          <button class="danger-btn" @click="doRemove">삭제</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { session, questions, store, STATUS } from '../data/store'
const route = useRoute()
const isProf = computed(() => session.user?.role === 'professor')
const q = computed(() => { store.version; return questions.get(route.params.id) })
const authorCount = computed(() => q.value ? questions.all().filter(x => x.authorId === q.value.authorId).length : 0)
const similar = computed(() => {
  if (!q.value) return []
  const tags = new Set(q.value.tags || [])
  return questions.all()
    .filter(x => x.id !== q.value.id)
    .map(x => ({ x, score: (x.subject === q.value.subject ? 2 : 0) + (x.tags || []).filter(t => tags.has(t)).length }))
    .sort((a, b) => b.score - a.score || (b.x.createdAt > a.x.createdAt ? 1 : -1))
    .slice(0, 4).map(s => s.x)
})
const draft = ref('')
const editingId = ref(null); const editDraft = ref('')
const isMine = a => a.type !== 'ai' && session.user && (a.authorId ? a.authorId === session.user.id : a.author === session.user.name)
function startEdit(a) { editingId.value = a.id; editDraft.value = a.content }
function saveEdit(a) {
  const text = editDraft.value.trim(); if (!text) return
  questions.updateAnswer(q.value.id, a.id, text); editingId.value = null
}
const confirmTarget = ref(null)
function remove(a) { confirmTarget.value = a }
function doRemove() {
  if (!confirmTarget.value) return
  questions.deleteAnswer(q.value.id, confirmTarget.value.id)
  confirmTarget.value = null
}
const fmt = s => s ? new Date(s).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''
function post() {
  const text = draft.value.trim(); if (!text) return
  questions.addAnswer(q.value.id, { type: isProf.value ? 'professor' : 'student', author: session.user.name, authorId: session.user.id, content: text })
  draft.value = ''
}
onMounted(() => { if (q.value) questions.view(q.value.id) })
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }
.main, .side { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.empty { color: #94a3b8; font-size: 13px; }

.q-course { display: flex; align-items: center; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; margin-bottom: 16px; }
.q-course-icon { width: 8px; height: 32px; border-radius: 4px; background: linear-gradient(180deg, #6b35ff, #a78bfa); }
.q-course-name { font-size: 13px; font-weight: 700; color: #0f172a; }
.q-course-sub { font-size: 11.5px; color: #94a3b8; }
.q-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 6px; line-height: 1.35; }
.q-meta { font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
.q-content { min-width: 0; }
.q-text { font-size: 14px; color: #374151; line-height: 1.75; white-space: pre-wrap; margin: 0 0 12px; }
.tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tag { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; background: #f1f5f9; color: #475569; }

.ans-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ans-title { font-size: 16px; font-weight: 800; color: #0f172a; }
.ans-title b { color: #6b35ff; margin-left: 4px; }
.status-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.status-chip.gen { background: #ede9fe; color: #6b35ff; }
.status-chip.ai { background: #dbeafe; color: #1d4ed8; }
.status-chip.review { background: #fef3c7; color: #b45309; }
.status-chip.done { background: #dcfce7; color: #15803d; }
.ans-input { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; }
.ans-input .input { flex: 1; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; font-family: inherit; resize: vertical; outline: none; }
.ans-input .input:focus { border-color: #6b35ff; }
.primary-btn { padding: 10px 16px; background: #6b35ff; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; }

.ai-generating { display: flex; align-items: center; gap: 10px; padding: 14px 16px; margin-top: 10px; border-radius: 12px; background: #f5f3ff; color: #6b35ff; font-size: 13px; font-weight: 600; }
.spinner { width: 14px; height: 14px; border: 2px solid #c4b5fd; border-top-color: #6b35ff; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }

.answer { padding: 18px 0; border-top: 1px solid #f1f5f9; }
.answer--ai { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 18px 16px; margin-top: 10px; }
.answer-body { flex: 1; min-width: 0; }
.answer-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.own-actions { margin-left: auto; display: flex; gap: 4px; }
.text-btn { border: none; background: none; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; padding: 4px 6px; border-radius: 6px; font-family: inherit; }
.text-btn:hover { background: #f1f5f9; color: #0f172a; }
.text-btn.danger:hover { background: #fef2f2; color: #dc2626; }
.edited { margin-left: 6px; color: #a78bfa; font-weight: 600; }
.edit-box { display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; }
.edit-box .input { width: 100%; padding: 10px 12px; border: 1.5px solid #c4b5fd; border-radius: 10px; font-size: 13px; font-family: inherit; resize: vertical; outline: none; line-height: 1.6; }
.edit-actions { display: flex; justify-content: flex-end; gap: 6px; }
.ghost-btn { padding: 8px 14px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 10px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; font-family: inherit; }
.avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: #fff; flex-shrink: 0; }
.avatar--ai { background: linear-gradient(135deg, #7c3aed, #a78bfa); font-size: 11px; }
.avatar--professor { background: linear-gradient(135deg, #6b35ff, #4f46e5); }
.avatar--student { background: linear-gradient(135deg, #64748b, #94a3b8); }
.avatar.big { width: 48px; height: 48px; font-size: 16px; }
.author-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.author { font-size: 13.5px; font-weight: 700; color: #0f172a; }
.badge { font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 5px; }
.badge-ai { background: #6b35ff; color: #fff; }
.badge-conf-hi { background: #dbeafe; color: #1d4ed8; }
.badge-conf-lo { background: #fef3c7; color: #b45309; }
.badge-prof { background: #fef9c3; color: #92400e; }
.answer-date { font-size: 11.5px; color: #94a3b8; margin-top: 2px; }
.answer-text { font-size: 14px; color: #374151; line-height: 1.75; white-space: pre-wrap; margin: 0 0 12px; }
.answer--student .answer-text, .answer--professor .answer-text { margin-bottom: 0; }
.answer--ai .answer-text { color: #1e1b4b; }
.sources { background: #fff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 10px 14px; margin-bottom: 10px; }
.sources-title { font-size: 11.5px; font-weight: 700; color: #6b35ff; margin-bottom: 6px; }
.sources ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
.sources li { font-size: 12.5px; display: flex; gap: 8px; align-items: center; }
.src-kind { font-size: 10.5px; font-weight: 700; color: #6b35ff; background: #ede9fe; padding: 1px 6px; border-radius: 4px; white-space: nowrap; }
.src-link { color: #4f46e5; font-weight: 600; cursor: pointer; text-decoration: underline; text-decoration-color: #c7d2fe; }
.review-note { font-size: 12px; font-weight: 600; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; }
.disclaimer { font-size: 12px; color: #7c6fb0; line-height: 1.6; margin: 0; }

.author-card { display: flex; align-items: center; gap: 12px; }
.author-name { font-size: 15px; font-weight: 800; color: #0f172a; }
.author-sub { font-size: 12px; color: #64748b; }
.side-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.side-title { font-size: 14px; font-weight: 800; color: #6b35ff; }
.side-link { font-size: 12px; color: #64748b; font-weight: 600; }
.side-empty { font-size: 12.5px; color: #94a3b8; padding: 8px 0; }
.sim-row { display: block; padding: 10px 0; border-top: 1px solid #f1f5f9; }
.sim-title { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
.sim-meta { display: flex; justify-content: space-between; font-size: 11.5px; color: #94a3b8; }
.sim-stats { color: #64748b; }
.ask-big { display: block; text-align: center; padding: 14px; background: #6b35ff; color: #fff; border-radius: 12px; font-size: 15px; font-weight: 800; box-shadow: 0 4px 14px rgba(107,53,255,.3); }
.ask-big.outline { background: #fff; color: #6b35ff; border: 1.5px solid #6b35ff; box-shadow: none; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; animation: fade .15s ease-out; }
.modal { width: 100%; max-width: 400px; background: #fff; border-radius: 20px; padding: 28px 24px 22px; box-shadow: 0 24px 64px rgba(0,0,0,.28); display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; animation: pop .18s ease-out; }
.modal-icon { width: 52px; height: 52px; border-radius: 50%; background: #fef2f2; color: #dc2626; font-size: 22px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.modal-title { font-size: 17px; font-weight: 800; color: #0f172a; }
.modal-desc { font-size: 13px; color: #64748b; line-height: 1.6; }
.modal-actions { display: flex; gap: 8px; width: 100%; margin-top: 8px; }
.modal-actions .ghost-btn, .danger-btn { flex: 1; padding: 11px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
.danger-btn { background: #dc2626; color: #fff; border: none; }
.danger-btn:hover { background: #b91c1c; }
@keyframes fade { from { opacity: 0; } }
@keyframes pop { from { opacity: 0; transform: translateY(8px) scale(.97); } }
@media (max-width: 1000px) { .detail-grid { grid-template-columns: 1fr; } }
</style>
