-- ============ profiles (유저 프로필 = /u/아이디 의 "아이디") ============
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text default '',
  bio text default '',
  avatar_url text default '',
  header_image_url text default '',
  heart_color text default '#c9184a',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "프로필은 누구나 열람 가능"
  on profiles for select
  using (true);

create policy "본인 프로필만 생성 가능"
  on profiles for insert
  with check (auth.uid() = id);

create policy "본인 프로필만 수정 가능"
  on profiles for update
  using (auth.uid() = id);

-- username은 영문/숫자/밑줄만, 3~20자
alter table profiles
  add constraint username_format check (username ~ '^[a-z0-9_]{3,20}$');

-- ============ posts (갤러리에 올라가는 이미지 카드 1개) ============
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default '',
  subtitle_tags text[] default '{}',
  category text[] default '{}',
  category_color text default 'purple',
  tags_appearance text[] default '{}',
  tags_outfit text[] default '{}',
  memo text default '',
  profile_text text default '',
  dday_date date,
  catchphrase text default '',
  catchphrase_enabled boolean default false,
  image_url text not null,
  banner_image_url text default '',
  pinned boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table posts enable row level security;

create policy "게시물은 누구나 열람 가능"
  on posts for select
  using (true);

create policy "본인 게시물만 생성 가능"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "본인 게시물만 수정 가능"
  on posts for update
  using (auth.uid() = user_id);

create policy "본인 게시물만 삭제 가능"
  on posts for delete
  using (auth.uid() = user_id);

create index if not exists posts_user_id_idx on posts(user_id);

-- ============ 배경/테마/추가이미지 커스터마이징 (추가 컬럼) ============
-- 기존에 이미 schema.sql을 한 번 실행한 프로젝트도 안전하게 다시 실행할 수 있도록
-- 전부 "add column if not exists" 형태로 작성했어요. 아래 블록을 SQL Editor에서 실행하세요.

alter table profiles add column if not exists bg_type text default 'color';               -- 'color' | 'image' | 'pattern'
alter table profiles add column if not exists bg_color_mode text default 'solid';         -- 'solid' | 'gradient'
alter table profiles add column if not exists bg_color text default '#ffffff';
alter table profiles add column if not exists bg_color2 text default '#f0e9ff';
alter table profiles add column if not exists bg_gradient_angle integer default 135;
alter table profiles add column if not exists bg_pattern text default 'dots';
alter table profiles add column if not exists bg_image_url text default '';
alter table profiles add column if not exists bg_image_brightness integer default 100;
alter table profiles add column if not exists bg_image_vignette integer default 0;
alter table profiles add column if not exists bg_image_size integer default 100;
alter table profiles add column if not exists bg_image_pos_x integer default 50;
alter table profiles add column if not exists bg_image_pos_y integer default 50;
alter table profiles add column if not exists category_colors jsonb default '{}'::jsonb; -- { "카테고리이름": "purple" }

alter table posts add column if not exists extra_images text[] default '{}';   -- 연관 이미지 여러 장
alter table posts add column if not exists heart_color text default '';       -- 게시물별 하트/디데이 색상 (빈 값이면 프로필 기본값)
alter table posts add column if not exists catchphrase_style text default 'normal'; -- 'normal' | 'italic'

-- ============ storage: 이미지 저장용 버킷 ============
-- Supabase 대시보드 > Storage 에서 "images" 버킷을 Public 으로 생성한 뒤 아래 정책을 적용하세요.
-- 파일 경로 규칙: {user_id}/{파일명}  ← 정책이 이 규칙을 전제로 함

create policy "이미지는 누구나 열람 가능"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "본인 폴더에만 업로드 가능"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "본인 폴더 파일만 삭제 가능"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
