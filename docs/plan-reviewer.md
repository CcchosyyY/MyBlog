# 의존성 취약점 수정 계획

## 현재 상태

`npm audit` 결과 **HIGH 4건**의 보안 취약점이 발견되었다.

| # | 패키지 | 현재 버전 | 취약점 | 심각도 | CVE/Advisory |
|---|--------|----------|--------|--------|-------------|
| 1 | `next` | 14.2.35 | Image Optimizer DoS (remotePatterns) | HIGH (CVSS 5.9) | GHSA-9g9p-9gw9-jx7f |
| 2 | `next` | 14.2.35 | HTTP request deserialization DoS (RSC) | HIGH (CVSS 7.5) | GHSA-h25m-26qc-wcjf |
| 3 | `glob` | 10.2.0-10.4.5 | CLI command injection via -c/--cmd | HIGH (CVSS 7.5) | GHSA-5j98-mcp5-4vw2 |
| 4 | `eslint-config-next` | 14.2.35 | glob 취약점에 간접 영향 | HIGH | (glob 경유) |

---

## 취약점 상세 분석

### 취약점 1: Next.js Image Optimizer DoS (GHSA-9g9p-9gw9-jx7f)
- **영향 범위**: `next >=10.0.0 <15.5.10`
- **패치 버전**: `next >=15.5.10` (14.x에는 패치 없음)
- **설명**: self-hosted 환경에서 Image Optimizer의 remotePatterns 설정을 악용한 DoS 공격 가능
- **현재 프로젝트 영향**: `next.config.mjs`에 `images.remotePatterns` 미설정 → 직접적 위험은 낮으나 패치 권고

### 취약점 2: Next.js HTTP Deserialization DoS (GHSA-h25m-26qc-wcjf)
- **영향 범위**: `next >=13.0.0 <15.0.8`
- **패치 버전**: `next >=15.0.8`
- **설명**: React Server Components 사용 시 HTTP 요청 역직렬화를 통한 DoS 공격 가능
- **현재 프로젝트 영향**: RSC를 사용하고 있으므로 **직접 영향을 받음**. 가장 심각한 취약점.

### 취약점 3: glob CLI Command Injection (GHSA-5j98-mcp5-4vw2)
- **영향 범위**: `glob >=10.2.0 <10.5.0`
- **패치 버전**: `glob >=10.5.0`
- **설명**: glob CLI의 -c/--cmd 옵션에서 shell:true로 매치 결과를 실행하는 command injection
- **현재 프로젝트 영향**: `@next/eslint-plugin-next`의 간접 의존성으로만 사용됨. 빌드 시 lint 과정에서만 호출되므로 프로덕션 런타임 위험은 낮음. 단, devDependency를 통한 공급망 공격 가능성 존재.

### 취약점 4: eslint-config-next (glob 경유)
- `eslint-config-next@14.2.35` → `@next/eslint-plugin-next` → `glob@10.x (취약)` 의존 체인
- eslint-config-next 업그레이드로 해결

---

## 업그레이드 전략

### 권고안: Next.js 15.0.8 이상으로 메이저 업그레이드

14.x 라인에는 두 취약점 모두 패치가 제공되지 않으므로 **Next.js 15로의 메이저 업그레이드가 필수**이다.

#### 목표 버전

| 패키지 | 현재 | 목표 | 비고 |
|--------|-----|------|-----|
| `next` | 14.2.35 | **15.5.12** | 두 취약점 모두 패치된 최신 안정 버전 |
| `eslint-config-next` | 14.2.35 | **15.5.12** | next 버전과 일치시킴. glob 취약점 해결 |
| `@next/mdx` | ^16.1.6 | **15.5.12** | next 메이저 버전과 일치시킴 |
| `react` / `react-dom` | ^18 | ^18 (유지) | Next.js 15는 React 18 호환 |

> **참고**: next@15.0.8이 취약점 2의 최소 패치 버전이고, next@15.5.10이 취약점 1의 최소 패치 버전이다. 15.5.12는 두 취약점 모두 해결하는 최신 안정 버전이다.

#### 대안: 최소 패치 버전 (15.5.10)
- 가장 보수적인 선택. 두 취약점 모두 해결되는 최소 버전.
- 단, 최신 15.5.12와 비교해 버그 수정이 빠져 있을 수 있음.

---

## Breaking Change 분석 (Next.js 14 → 15)

### 이미 호환되는 부분 (수정 불필요)
코드 검토 결과, 프로젝트가 이미 Next.js 15 패턴을 사용하고 있다:
- `params`를 `Promise<>` 타입으로 선언하고 `await params` 사용 중 (**호환**)
- `cookies()`를 `await cookies()`로 호출 중 (**호환**)
- `searchParams`는 `new URL(request.url)`에서 추출하는 방식 사용 (**호환**)

### 확인/수정이 필요한 부분

1. **`@next/mdx` 버전 호환**: 현재 `@next/mdx@^16.1.6`으로 설정되어 있는데, 이는 Next.js 16용이다. Next.js 15로 업그레이드 시 `@next/mdx@15.5.12`로 다운그레이드해야 한다.

2. **`next-mdx-remote` 호환성**: `next-mdx-remote@^5.0.0`이 Next.js 15와 호환되는지 확인 필요. (대부분 호환됨)

3. **`next-themes` 호환성**: `next-themes@^0.4.6`은 Next.js 15에서 정상 동작 확인 필요.

4. **Middleware 변경사항**: Next.js 15에서 middleware API 변경은 없으나, 동작 세부사항 확인 필요.

5. **Caching 기본값 변경**: Next.js 15에서 fetch 캐싱 기본값이 `force-cache` → `no-store`로 변경되었다. Supabase 데이터 fetch 성능에 영향을 줄 수 있으므로, 필요 시 명시적으로 `cache: 'force-cache'` 또는 `revalidate` 설정 추가가 필요할 수 있다.

---

## 수정할 파일

| 파일 | 수정 내용 |
|------|----------|
| `package.json` | `next`, `eslint-config-next`, `@next/mdx` 버전 업데이트 |
| `package-lock.json` | `npm install` 후 자동 갱신 |

### package.json 변경 사항

```diff
 "dependencies": {
-  "@next/mdx": "^16.1.6",
+  "@next/mdx": "^15.5.12",
-  "next": "14.2.35",
+  "next": "15.5.12",
 },
 "devDependencies": {
-  "eslint-config-next": "14.2.35",
+  "eslint-config-next": "15.5.12",
 }
```

---

## 실행 절차

### Step 1: 의존성 업데이트
```bash
npm install next@15.5.12 @next/mdx@15.5.12 eslint-config-next@15.5.12
```

### Step 2: 빌드 테스트
```bash
npm run build
```
- Supabase 환경변수 설정 후 빌드가 정상 통과하는지 확인
- 정적 페이지 생성이 완료되는지 확인

### Step 3: 린트 테스트
```bash
npm run lint
```
- ESLint 규칙 변경으로 인한 새 경고/에러 확인

### Step 4: npm audit 재확인
```bash
npm audit
```
- 4건의 HIGH 취약점이 모두 해결되었는지 확인

### Step 5: 런타임 테스트
- `npm run dev`로 개발 서버 실행
- 주요 페이지 접근 테스트: `/`, `/blog`, `/blog/[slug]`, `/blog/category/[category]`, `/admin`
- 캐싱 동작 변경 여부 확인 (데이터 fetch 성능)

### Step 6: 추가 정리 (선택)
```bash
npm uninstall puppeteer
```
- 미사용 puppeteer 제거로 node_modules 크기 절감 및 보안 표면 축소

---

## 위험 평가

| 항목 | 위험도 | 설명 |
|------|-------|------|
| 빌드 실패 | 낮음 | 코드가 이미 Next.js 15 패턴(async params/cookies) 적용됨 |
| 런타임 에러 | 낮음 | React 18 유지, API 호환 |
| 캐싱 동작 변경 | 중간 | fetch 기본값 변경으로 Supabase 데이터 로딩 성능 영향 가능 |
| @next/mdx 호환 | 낮음 | 동일 메이저 버전으로 맞춤 |
| third-party 호환 | 낮음 | next-mdx-remote, next-themes 모두 Next.js 15 지원 |

**전체 위험도: 낮음~중간** — 코드가 이미 Next.js 15 호환 패턴을 사용하고 있어 업그레이드 난이도가 낮다. 주요 주의점은 캐싱 기본값 변경뿐이다.
