# Smart Portfolio - 매도/물타기/매수 추천 웹앱

## 빠른 시작

### 1. Supabase 설정
1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. SQL Editor에서 `supabase_schema.sql` 실행
3. Settings > API에서 URL, anon key, service role key 복사

### 2. 환경변수 설정
```bash
cp .env.local.example .env.local
# .env.local 파일을 열어 값 채우기
```

### 3. 로컬 실행
```bash
npm install
npm run dev
```
http://localhost:3000 접속 → 비밀번호 입력 → 대시보드

### 4. Vercel 배포
1. GitHub에 코드 푸시
2. [vercel.com](https://vercel.com)에서 Import
3. Environment Variables에 .env.local 내용 모두 등록
4. Deploy!

## 주요 기능
- **매도 추천**: 수익률 5%+ 종목 스코어링 → 일일 20만원 목표 자동 배분
- **물타기 추천**: 손실 종목 중 반등 가능성 스코어링
- **관심종목 매수 추천**: 희망가 근접도 + 시총/업종 분석
- **가중치 커스터마이징**: 설정에서 스코어 가중치 자유 조절
