# work-log-frontend

React + TypeScript + Vite로 만드는 업무 관리·커리어 기록 서비스의 프론트엔드. 백엔드는 `work-log-backend`(같은 부모 폴더의 형제 프로젝트, `C:\workspace\side-projects\work-log\work-log-backend`)이고, 전체 기획서와 백엔드 진행 상황은 그 프로젝트의 CLAUDE.md에 있다. 여기서는 프론트엔드만 다룬다.

## 기술 스택과 세팅
- Vite + React + TypeScript (`npm create vite@latest . -- --template react-ts`), ESLint(오류 대신 Oxlint 아님, classic ESLint 선택)
- 라우팅: `react-router-dom`
- HTTP 요청: 별도 라이브러리 없이 브라우저 기본 `fetch` (필요해지면 axios 고려)
- 백엔드 주소: `http://localhost:8080` (`src/api/client.ts`의 `BASE_URL`)
- **개발 서버는 반드시 5173번 포트여야 한다.** 백엔드 CORS 설정이 `http://localhost:5173`만 허용한다. `npm run dev`를 두 번 실행하는 등으로 포트가 자동으로 5174로 밀리면 CORS 에러가 난다 — 이미 한 번 겪은 문제, 중복 실행된 터미널이 있는지 먼저 확인할 것.
- Windows PowerShell에서 `npm`, `git` 실행 시 "이 시스템에서 스크립트를 실행할 수 없다"는 에러가 나면 PowerShell 실행 정책 문제다. `npm.cmd`로 바꿔 쓰거나 VS Code 터미널을 Command Prompt로 바꾸면 된다. (`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`로 근본적으로 해결 가능하지만 사용자가 보류 중)

## 진행 방식
- **2026-09-23부터 방식 전환: 백엔드와 동일하게 진행한다.** Claude는 소스와 설명만 보여주고, 사용자가 직접 타이핑하고, Claude는 리뷰만 한다. (2026-09-22까지는 기획서 규칙 "React 화면은 초안을 더 많이 받아도 된다"에 따라 Claude가 대부분 직접 작성했는데, 사용자가 React를 하나도 이해 못 하겠다고 해서 전환을 요청함.) 처음부터 다시 천천히, 작은 단위로 설명하며 진행할 것 — 하루에 개념을 너무 많이 몰아서 주지 말 것(TS/JS/JSX 차이를 한꺼번에 설명했다가 사용자가 완전히 못 따라온 적 있음).
- 수정·삭제·추가는 먼저 뭘 할지 말하고 사용자 승인 후 진행한다(백엔드와 동일한 규칙).
- 화면 확인은 Claude가 내장 브라우저로 직접 클릭·입력해서 검증한다. 다만 **`window.confirm()`/`alert()` 같은 네이티브 브라우저 다이얼로그는 자동화 도구가 자동으로 닫아버려서 Claude가 재현할 수 없다** — 이런 상호작용(예: 보관 확인창)은 사용자가 직접 클릭해서 확인해야 한다.
- git은 VS Code 기본 Source Control 패널 사용. "Publish Branch"로 새 저장소를 만들려다 이미 저장소가 있으면 실패하니, 그럴 땐 `Ctrl+Shift+P` → `Git: Add Remote`로 기존 주소 연결 후 `Git: Push`.

## 폴더 구조
```
src/
├── api/
│   ├── client.ts       ← 공통 fetch 래퍼 (주소, 토큰 헤더 자동 첨부, 에러를 ApiError로 변환)
│   ├── auth.ts          ← signup, login, getMe
│   ├── projects.ts      ← getProjects, createProject, updateProject, archiveProject
│   ├── tags.ts           ← getTags, createTag, updateTag, deleteTag
│   ├── workSystems.ts     ← getWorkSystems, createWorkSystem, updateWorkSystem, deleteWorkSystem
│   ├── tasks.ts            ← getTasks, getTask, createTask, updateTask, changeTaskStatus, archiveTask
│   ├── taskResults.ts      ← getTaskResults, createTaskResult, updateTaskResult, deleteTaskResult (업무 밑에 걸린 성과 항목)
│   ├── dailyLogs.ts         ← getDailyLog, saveDailyLog (하루 회고 조회·저장)
│   └── taskLogs.ts          ← createTaskLog, updateTaskLog, deleteTaskLog (일일 기록 밑에 걸린 진행 메모)
├── auth/
│   ├── token.ts          ← localStorage 토큰 저장/조회/삭제 (saveToken, getToken, clearToken, isLoggedIn)
│   └── RequireAuth.tsx   ← 로그인 안 했으면 /login으로 리다이렉트하는 라우트 가드
├── components/
│   └── Layout.tsx        ← 로그인 후 공통 상단바(로고 + 프로젝트/태그/업무시스템/업무 메뉴 + 로그아웃) + <Outlet/>
├── types/
│   ├── auth.ts            ← 백엔드 DTO와 1:1 대응하는 타입(SignupRequest 등)
│   ├── project.ts
│   ├── tag.ts
│   ├── workSystem.ts
│   ├── task.ts             ← TaskStatus/TaskPriority(문자열 유니온), TaskRequest/TaskResponse/TaskStatusRequest
│   ├── taskResult.ts        ← TaskResultRequest/TaskResultResponse
│   ├── dailyLog.ts           ← DailyLogRequest/DailyLogResponse(taskLogs 목록 포함)
│   └── taskLog.ts            ← TaskLogRequest/TaskLogUpdateRequest/TaskLogResponse
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── ProjectsPage.tsx   ← 조회/등록/수정/보관. 등록 폼을 재사용해 수정 모드 지원(editingId)
│   ├── TagsPage.tsx        ← 조회/등록/수정(이름 클릭 → inline 편집, Enter 저장·Esc 취소)/삭제
│   ├── WorkSystemsPage.tsx  ← TagsPage와 거의 같은 구조(+ description 필드)
│   ├── TasksPage.tsx         ← 조회/등록/수정/보관, 태그·업무시스템 다중 선택(체크박스), 카드에서 바로 상태 변경(드롭다운), 수정 모드일 때만 보이는 성과 항목(TaskResult) 목록·추가·수정·삭제
│   └── DailyLogPage.tsx       ← 하루 일지 화면. 날짜 이동(이전/다음/오늘), 회고 저장(upsert), 그날의 진행 메모 목록·추가·수정·삭제
├── styles/
│   └── common.css         ← 재사용 디자인 부품(.page-center, .card, .field, .btn-primary, .btn-secondary, .btn-danger, .page, .list, .list-item, .nav-link, .chip, .chip-toggle, .status-select 등)
├── index.css               ← CSS 변수(색상, 라이트/다크 모드), Vite 기본 랜딩페이지 레이아웃은 제거함
├── App.tsx                 ← 라우팅. "/"는 RequireAuth+Layout으로 감싸고 그 안에 중첩 라우트(index=ProjectsPage, tags=TagsPage, systems=WorkSystemsPage, tasks=TasksPage)
└── main.tsx                ← BrowserRouter로 App 감쌈
```

## 완료 (2026-09-22)
- 프로젝트 세팅, `react-router-dom` 설치
- `api/client.ts`: 공통 API 클라이언트 (토큰 자동 첨부, `ApiError`로 에러 통일, 204 처리)
- 로그인 화면(`LoginPage`), 회원가입 화면(`SignupPage`, 가입 성공 시 완료 안내 후 로그인 유도)
- `RequireAuth`로 인증 보호, `Layout` 공통 상단바(프로젝트/태그 메뉴, `NavLink`로 현재 페이지 강조) + 중첩 라우팅 구조
- 프로젝트 화면(`ProjectsPage`): 조회, 등록(폼 토글, 시작일 기본값 오늘 날짜), **수정**(등록 폼을 재사용, `editingId`로 등록/수정 모드 분기), 보관 처리(확인창)
- 태그 화면(`TagsPage`): 조회, 등록(이름 중복 시 409 메시지 표시), **수정**(이름 텍스트를 클릭하면 그 자리가 입력창으로 바뀌는 inline 편집 — Enter 저장, Esc 취소, 편집 중엔 테두리로 구분되게 스타일 넣음), 삭제(보관 아니라 진짜 삭제, 확인창)
- 디자인 시스템: `index.css`의 CSS 변수로 라이트/다크 모드 색상 관리, accent 색상을 연한 파란색(`#60a5fa`/다크 모드 `#93c5fd`)으로 변경. `styles/common.css`에 재사용 가능한 카드·폼·버튼·메뉴 스타일
- 사용하지 않는 Vite 기본 템플릿 파일 정리(`App.css`, `assets/*.png,svg`, `public/icons.svg`) 및 `HomePage.tsx`(임시 인증 확인용, 이제 ProjectsPage가 대체) 삭제
- GitHub 저장소 연결 및 push 완료: https://github.com/jh-st97/work-log-frontend (커밋 메시지가 실제 범위보다 작게 적힌 적 있음 — 태그 화면 작업이 "프로젝트 수정 기능 추가" 커밋에 같이 묶여 올라감. 기능 단위로 커밋을 더 자주 하는 게 좋음)

## 완료 (2026-09-23)
- **업무 시스템 화면(`WorkSystemsPage`)**: `TagsPage`와 같은 패턴(조회/등록/수정/삭제).
- **업무(Task) 화면(`TasksPage`)**: 조회/등록/수정/보관. 프로젝트는 드롭다운, 태그·업무시스템은 다중 선택. 수정 시 기존 선택값이 체크박스에 정확히 반영되는지 확인함.
- **업무 카드에서 상태를 바로 바꾸는 드롭다운**: 원래는 "완료 처리" 버튼 하나뿐이라 완료로만 갈 수 있고 되돌릴 수 없었는데, 사용자가 "상태 수정 안 되냐"고 물어서 TODO/IN_PROGRESS/DONE 3가지를 고르는 `<select>`로 교체함(`.status-select`). 백엔드 `PATCH /api/tasks/{id}/status`는 이미 아무 상태나 받게 되어 있어서 프론트만 추가하면 됐음.
- **성과 항목(TaskResult) 화면**: 업무 수정 폼 안에(수정 모드일 때만) 목록·추가·수정·삭제 UI를 붙임. 목록 조회 API가 기획서에 없어서 백엔드에 `GET /api/tasks/{taskId}/results`를 새로 추가함(자세한 건 백엔드 CLAUDE.md 참고). 이걸로 **기획서 2단계가 화면까지 전부 끝남.**
- **태그·업무시스템 체크박스를 알약(pill) 토글 버튼처럼 스타일링**(`.chip-toggle`): 사용자가 "이쁘게 못 꾸미냐"고 요청. 실제 `<input type="checkbox">`는 그대로 두고 화면에서만 숨겨서 접근성은 유지. 선택 시 `--accent` 배경으로 채워짐.
- **버튼·드롭다운 높이 통일**: 상태 드롭다운을 처음 만들었을 때 `.btn-secondary`보다 작아서 "혼자 튀어 보인다"는 피드백을 받고 높이를 맞춤(41px). 맞추다 보니 `.btn-danger`(보관·삭제 버튼)가 원래 다른 버튼들보다 작게 디자인돼 있던 게 드러나서, 사용자 요청으로 `.btn-danger`도 `.btn-secondary`와 같은 크기로 통일함 — 이 변경은 보관·삭제 버튼을 쓰는 모든 화면(프로젝트·태그·업무시스템·업무)에 공통 적용됨.
- 테스트: `npx tsc --noEmit` 통과 + Claude의 내장 브라우저로 등록/수정/삭제/상태변경 실제 요청까지 확인. `window.confirm()` 확인창만은 자동화로 못 눌러서 `window.confirm`을 임시로 덮어써서 우회 확인함.

## 완료 (2026-09-23, 기획서 3단계 화면 — DailyLogPage)
- **하루 일지 화면(`DailyLogPage`)**: `<input type="date">`로 날짜를 고르면(이전 날/다음 날/오늘 버튼도 있음) 그날 일지를 불러온다. 회고는 textarea + 저장 버튼(`PUT`이 upsert라 저장 로직이 하나로 끝남). 진행 메모는 목록 + 업무 선택(드롭다운)·내용·소요 시간을 입력하는 추가/수정 폼.
- **아직 아무것도 기록 안 한 날(404) 처리**: `getDailyLog`가 404(`DAILY_LOG_NOT_FOUND`)를 던지면 에러로 취급하지 않고 회고·진행 메모 둘 다 빈 상태로 보여준다 — 기록 없는 날이 정상적인 상태라서.
- `common.css`에 `.field textarea`(회고·진행 메모 내용 입력칸), `.field-date`(날짜 이동 바의 날짜 입력, `.status-select`와 같은 41px 높이로 통일) 추가.
- App.tsx에 `/logs` 라우트, Layout.tsx에 "일일 기록" 메뉴 추가.
- **[도구 참고] Claude 브라우저의 `read_page`가 폼 아래쪽 요소(textarea, 등록 버튼)를 접근성 트리에서 못 잡는 경우가 있었음** — `get_page_text`로는 라벨이 다 보이는데 `read_page`만 누락됨. 이럴 땐 `document.getElementById(...)`로 직접 채우고 `find`로 버튼만 찾아 클릭하는 방식으로 우회함. 다음에 비슷한 증상 나오면 같은 방법 쓰면 됨.
- 테스트: `npx tsc --noEmit` 통과 + 실제 브라우저로 날짜 이동/회고 저장/진행 메모 등록·수정·삭제 전부 확인.

**이걸로 기획서 3단계(DailyLog, TaskLog)가 백엔드·화면 전부 완전히 끝났다.**

## 아직 안 한 것 (다음 단계)
1. 회원가입 시 이메일 형식/비밀번호 길이에 대한 프론트단 실시간 검증 메시지는 아직 없음(백엔드 400 에러 메시지에만 의존).
2. `window.confirm()` 기반 확인창은 Claude의 브라우저 자동화로 "확인" 클릭을 재현할 수 없다는 한계가 계속 있음 — 필요하면 나중에 직접 만든 모달로 바꾸는 것도 고려 가능(지금은 우선순위 낮음).
3. 업무 목록 필터링(상태·프로젝트·태그 등)과 페이징은 기획서 4단계 — 아직 손 안 댐.
4. `DailyLogPage`에서 업무를 고르는 드롭다운이 전체 업무 목록이라, 업무가 많아지면 찾기 어려워질 수 있음 — 4단계에서 검색/필터와 같이 다룰 만함.

## 테스트 계정
- `test@example.com` / `test-password-1234` (원래 백엔드 시험용, 계속 씀)
- `signup-test@example.com` / `signup-password-1234` (회원가입 화면 시험용으로 Claude가 만듦)
- 사용자 본인 계정은 아직 안 만듦(나중에 만들지 테스트 계정을 계속 쓸지는 사용자 선택)

## 정한 것 (대화 중 결정)
- 토큰 저장 위치: localStorage (백엔드 기획서 단계에서 이미 결정된 사항과 동일)
- accent 색상: 연한 파란색 (`#60a5fa` 라이트 / `#93c5fd` 다크)
- 프로젝트 보관 시 `window.confirm()`으로 한 번 확인받음, 태그 삭제도 동일
- 프로젝트 수정은 별도 화면/모달 대신 등록 폼을 그대로 재사용(상태값 `editingId`로 등록/수정 분기). 필드가 여러 개일 때(프로젝트)는 이 방식, 필드가 하나뿐일 때(태그 이름)는 inline 편집 방식으로 구분해서 쓰기로 함
