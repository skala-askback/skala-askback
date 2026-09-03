## 실행
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

`npm install` 중 esbuild 설치 스크립트 승인을 요구하며 멈추면 아래를 실행한 뒤 다시 `npm run dev`:

```bash
npm install-scripts approve esbuild fsevents
npm rebuild esbuild
```


## 구조
```
src/
├── layouts/PortalLayout.vue   사이드바 · 모바일 헤더 · 하단 탭 (포털 공통 껍데기)
├── pages/                     home · more/profile · attendance · certificate-request · schedule · more
├── data/schedule.json         교육일정 데이터 (엑셀에서 생성)
├── data/user.js               데모 사용자 (개인정보 커밋 금지 → 플레이스홀더)
└── styles/base.css            포털 디자인 토큰 (색·폰트·그림자)
```

## 새 페이지 추가
1. `src/pages/XxxPage.vue` 생성 (기존 페이지의 `.page` / `.card` 클래스 재사용)
2. `src/router.js` children 에 경로 추가
3. `PortalLayout.vue` 사이드바에 `<router-link>` 추가

## 로그인 · 질문 (로컬 스토리지 목업)

### 기본 계정 (앱 첫 실행 시 자동 생성)
| 역할 | 아이디 | 비밀번호 |
|---|---|---|
| 학생 | `G000` | `G000` |
| 교수 | `G001` | `G001` |

- `/login` 학생/교수 탭 로그인, `/signup` 회원가입 · 세션 없으면 `/login`으로
- 학생 홈 = 마이스페이스, **교수 홈 = 질문 관리**
- 질문 흐름: 학생 등록 → **AI(RAG 목업)가 약 2초 뒤 먼저 답변** → 신뢰도 70 미만이면 `교수 검토 대기` → 교수 답변 시 `교수 답변 완료`
- 상태 4종: `AI 답변 생성 중` · `AI 답변 완료` · `교수 검토 대기` · `교수 답변 완료`
- 질문 상세(`/questions/:id`): 질문 · 답변 목록(AI 답변은 연보라 강조 + 참고 자료 + 신뢰도) · 댓글/답변 입력 · 비슷한 Q&A
- 목 데이터 8건: `src/data/mockQuestions.js` (AI만 / AI+교수 / 검토 대기 / 생성 중 섞여 있음)
- 저장 위치: 사용자·질문 = `localStorage`(브라우저 공유) / 로그인 세션 = `sessionStorage`(**탭마다 따로 세션 잡음**) · 초기화: 콘솔에서 `localStorage.clear()` 후 새로고침

### 시연 방법 — 학생·교수 동시에
- **같은 브라우저에서 창(탭) 두 개**를 연다 → 한쪽은 `G000`, 다른 쪽은 `G001`로 로그인 (탭마다 세션이 따로라 서로 안 겹침)
- 교수 창에서 답변을 달면 학생 창이 **새로고침 없이 즉시** 바뀜 (`storage` 이벤트로 동기화 해두었음)
- **시크릿창으로 시연하지 말것!!!! 스토리지 이벤트 동기화 해놨는데 저장소가 분리되어 데이터를 공유하지 않음!** — 시크릿 모드로는 시연 불가
- 실제 연동 시 교체 지점: `src/data/store.js` 의 `scheduleAi()` (AI 호출) 와 `questions` 객체 (API) 교체 하면된다

## 학습 분석 · 대시보드 (Chart.js)
- 학생 `/weakness` **내 약점**: 내 질문의 태그를 개념으로 묶어 질문 수 · AI 신뢰도 · 퀴즈 정답률로 취약/개선 중/보완됨 판정. 차트: 개념별 질문 수, 주차별 추이, 과목별
- 학생 `/quiz` **약점 퀴즈**: 약점 개념(또는 특정 개념)으로 문항 구성 → 풀이 → 해설 → 결과가 `skala_quiz_attempts` 에 저장되어 약점 분석에 반영
- 교수 `/dashboard` **강의 대시보드** (교수 홈): 전체/검토 대기/AI 자동 처리율/평균 신뢰도, 과목별·주차별·상태·신뢰도 분포 차트, 반복 질문 개념, 검토 대기 큐, AI 커리큘럼 개선 제안
- 계산 로직: `src/data/analytics.js` · 개념 매핑과 문제 은행: `src/data/quizBank.js` · 차트 래퍼: `src/components/ChartCanvas.vue`

