# 이미지 아카이브 (Next.js + Supabase)

구글 로그인으로 여러 명이 사이트 하나를 함께 쓰는 갤러리입니다.
- `/` — 로그인
- `/dashboard` — 내 갤러리 관리 (로그인 필요)
- `/u/아이디` — 특정 사람의 갤러리 (누구나 열람 가능)

## 1. Supabase 프로젝트 만들기
1. https://supabase.com 에서 새 프로젝트 생성
2. 왼쪽 메뉴 **SQL Editor** → `supabase/schema.sql` 내용 전체 붙여넣고 실행
3. 왼쪽 메뉴 **Storage** → `images` 라는 이름의 **Public** 버킷 생성
   (버킷을 만든 뒤에 schema.sql 맨 아래 storage 정책 부분을 실행해야 해요. 버킷이 없으면 정책 생성이 실패해요.)
4. 왼쪽 메뉴 **Project Settings → API** 에서 `Project URL`, `anon public key` 복사

## 2. 구글 로그인(OAuth) 설정
1. Supabase 대시보드 → **Authentication → Providers → Google** 활성화
2. Google Cloud Console(https://console.cloud.google.com) 에서:
   - OAuth 동의 화면 설정
   - OAuth 클라이언트 ID 생성 (유형: 웹 애플리케이션)
   - **승인된 리디렉션 URI**에 Supabase가 알려주는 콜백 주소를 추가
     (Supabase Providers → Google 화면에 정확한 콜백 URL이 표시돼요, 보통
     `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`)
3. 발급받은 Client ID / Client Secret을 Supabase Google Provider 설정에 입력 후 저장

## 3. 로컬 환경변수
`.env.local.example` 파일을 복사해서 `.env.local`로 만들고 1번에서 복사한 값을 채워주세요.

```bash
cp .env.local.example .env.local
```

## 4. 로컬 실행
```bash
npm install
npm run dev
```

## 5. Vercel 배포
1. 이 프로젝트를 GitHub 저장소에 올리기
2. https://vercel.com 에서 New Project → 해당 저장소 선택
3. **Environment Variables**에 `.env.local`과 동일하게
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
4. 배포 완료되면 나온 주소를 Supabase Google Provider의 **Site URL / Redirect URLs**,
   그리고 Google Cloud Console의 승인된 리디렉션 URI에도 추가
   (예: `https://내사이트.vercel.app/auth/callback`)

## 지인 초대 방법
별도 가입 절차 없이, 지인이 사이트에 접속해서 **구글 계정으로 로그인**하면
자동으로 아이디를 만들고 자기 갤러리(`/u/자기아이디`)를 갖게 됩니다.
관리자가 따로 계정을 만들어줄 필요는 없어요.

## 지금 버전에 포함된 기능
- 구글 로그인 / 로그아웃
- 최초 로그인 시 아이디(username) 설정
- 이미지 등록/수정 (제목, 서브타이틀 태그, 카테고리, 외형/의상 태그, 메모, 디데이, 캐치프레이즈)
- 삭제, 고정(핀)
- 공개 갤러리 `/u/아이디` (디데이 뱃지, 카테고리/태그 표시)
- 프로필 설정: 이름, 소개글, 프로필 이미지, 헤더(커버) 이미지, 하트/디데이 색상
- 배경 커스터마이징: 단색 / 그라데이션(각도 조절) / 13종 패턴 / 배경 이미지(밝기·비네팅·크기·위치 조절)
- 이미지 여러 장(연관 이미지) 첨부 + 배너 이미지
- 검색(제목) + 카테고리 태그 필터
- 카테고리별 색상 지정 (프로필 전체에서 재사용됨)
- 이미지 상세 모달 (연관 이미지 확대보기 포함)
- 카드 순서 변경 (순서 변경 모드에서 ▲▼ 버튼으로 이동 후 저장)

`supabase/schema.sql`을 다시 한 번 Supabase SQL Editor에 실행해서 새로 추가된 컬럼들을 반영해주세요
(전부 `add column if not exists` 형태라 기존 데이터는 안전해요).
