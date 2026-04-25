# FoMO 错失恐惧量表网站

这是一个可部署到 Vercel 的 `Next.js + TypeScript + Tailwind CSS` 前端问卷网站，使用 Supabase 保存答题记录并为反馈页提供实时刷新事件。

## 功能

- 用户输入用户名后开始答题。
- 16 道 1-5 分 Likert 题，按错失动机、错失认知、错失情绪、错失行为四个维度分段。
- 提交后生成个人报告，包含总分、维度分、维度解释和非诊断声明。
- `/feedback` 通过管理口令访问，实时显示所有用户记录。
- `/feedback/[id]` 查看单个用户的总分、维度分和每道题点击分数。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 环境变量

复制 `.env.example` 为 `.env.local`，填入：

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
ADMIN_PASSWORD="change-this-password"
ADMIN_SESSION_SECRET="optional-long-random-secret"
```

`SUPABASE_SERVICE_ROLE_KEY` 只能放在 Vercel 环境变量或本地 `.env.local`，不要暴露到浏览器端。

## Supabase 数据库

在 Supabase SQL Editor 中执行：

```sql
create extension if not exists pgcrypto;

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  username text not null check (char_length(trim(username)) between 1 and 40),
  answers jsonb not null,
  dimension_scores jsonb not null,
  total_score integer not null check (total_score between 16 and 80),
  report jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.response_events (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.responses enable row level security;
alter table public.response_events enable row level security;

drop policy if exists "response events are visible for realtime" on public.response_events;
create policy "response events are visible for realtime"
  on public.response_events
  for select
  to anon, authenticated
  using (true);

do $$
begin
  alter publication supabase_realtime add table public.response_events;
exception
  when duplicate_object then null;
end $$;
```

同一脚本也保存在 `supabase/schema.sql`。

## 部署到 Vercel

1. 将项目推送到 Git 仓库。
2. 在 Vercel 导入项目。
3. 在 Vercel Project Settings 中配置上述环境变量。
4. 构建命令使用默认 `npm run build`。

## 验证命令

```bash
npm run typecheck
npm test
npm run build
```

如果没有配置 Supabase 环境变量，页面仍可打开，但提交和反馈读取会提示需要配置服务端环境变量。
