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
- 백엔드와 달리 프론트엔드는 기획서 규칙("React 화면은 초안을 더 많이 받아도 된다")에 따라 **Claude가 대부분 파일을 직접 작성하고 설명**하는 방식으로 진행 중이다. 사용자가 직접 고친 부분도 있다(예: 시작일 기본값 로직).
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
│   └── tags.ts           ← getTags, createTag, updateTag, deleteTag
├── auth/
│   ├── token.ts          ← localStorage 토큰 저장/조회/삭제 (saveToken, getToken, clearToken, isLoggedIn)
│   └── RequireAuth.tsx   ← 로그인 안 했으면 /login으로 리다이렉트하는 라우트 가드
├── components/
│   └── Layout.tsx        ← 로그인 후 공통 상단바(로고 + 프로젝트/태그 메뉴 + 로그아웃) + <Outlet/>
├── types/
│   ├── auth.ts            ← 백엔드 DTO와 1:1 대응하는 타입(SignupRequest 등)
│   ├── project.ts
│   └── tag.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── ProjectsPage.tsx   ← 조회/등록/수정/보관. 등록 폼을 재사용해 수정 모드 지원(editingId)
│   └── TagsPage.tsx        ← 조회/등록/수정(이름 클릭 → inline 편집, Enter 저장·Esc 취소)/삭제
├── styles/
│   └── common.css         ← 재사용 디자인 부품(.page-center, .card, .field, .btn-primary, .btn-secondary, .btn-danger, .page, .list, .list-item, .nav-link 등)
├── index.css               ← CSS 변수(색상, 라이트/다크 모드), Vite 기본 랜딩페이지 레이아웃은 제거함
├── App.tsx                 ← 라우팅. "/"는 RequireAuth+Layout으로 감싸고 그 안에 중첩 라우트(index=ProjectsPage, tags=TagsPage)
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

## 아직 안 한 것 (다음 단계)
1. **업무 시스템 목록 화면** — 백엔드 `/api/systems` API 완성되어 있음. `TagsPage`와 구조가 거의 같음(+ description 필드).
2. **업무(Task) 화면** — 백엔드에 Task API가 아직 없어서(다음 백엔드 작업), 그게 먼저 필요함.
3. 회원가입 시 이메일 형식/비밀번호 길이에 대한 프론트단 실시간 검증 메시지는 아직 없음(백엔드 400 에러 메시지에만 의존).
4. `window.confirm()` 기반 확인창은 Claude의 브라우저 자동화로 "확인" 클릭을 재현할 수 없다는 한계가 계속 있음 — 필요하면 나중에 직접 만든 모달로 바꾸는 것도 고려 가능(지금은 우선순위 낮음).

## 테스트 계정
- `test@example.com` / `test-password-1234` (원래 백엔드 시험용, 계속 씀)
- `signup-test@example.com` / `signup-password-1234` (회원가입 화면 시험용으로 Claude가 만듦)
- 사용자 본인 계정은 아직 안 만듦(나중에 만들지 테스트 계정을 계속 쓸지는 사용자 선택)

## 정한 것 (대화 중 결정)
- 토큰 저장 위치: localStorage (백엔드 기획서 단계에서 이미 결정된 사항과 동일)
- accent 색상: 연한 파란색 (`#60a5fa` 라이트 / `#93c5fd` 다크)
- 프로젝트 보관 시 `window.confirm()`으로 한 번 확인받음, 태그 삭제도 동일
- 프로젝트 수정은 별도 화면/모달 대신 등록 폼을 그대로 재사용(상태값 `editingId`로 등록/수정 분기). 필드가 여러 개일 때(프로젝트)는 이 방식, 필드가 하나뿐일 때(태그 이름)는 inline 편집 방식으로 구분해서 쓰기로 함
