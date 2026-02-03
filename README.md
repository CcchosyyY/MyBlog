# MyBlog

Next.js 14 기반 개인 블로그 프로젝트

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Language**: TypeScript

## 주요 기능

- 블로그 글 작성/수정/삭제 (Admin UI)
- 5개 카테고리 분류 (일상/개발/요리/공부/운동)
- 태그 시스템
- 다크모드
- 검색 기능
- 목차(TOC) 자동 생성
- Quick Memo 위젯
- RSS 피드
- SEO 최적화

## 시작하기

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일에 Supabase 정보 입력

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인

## 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=your_admin_password
```

## 배포

Vercel에서 자동 배포 지원
