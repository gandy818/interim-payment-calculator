# 중도금 대출 이자 계산기

회차별 중도금 대출원금과 납부일, 연이자율을 입력하면 기준일까지 쌓이는
이자를 회차별로 계산해주는 Next.js 웹앱입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 배포용 빌드

```bash
npm run build
npm run start
```

## 계산 방식

각 회차의 이자는 단리(單利)로 계산됩니다.

```
이자 = 대출원금 × 연이자율 × (경과일수 ÷ 365)
```

경과일수는 각 회차의 납부일(대출 실행일)부터 계산 기준일(오늘 또는 직접
입력한 날짜, 예: 잔금 예정일)까지의 일수입니다.

실제 집단대출 상품은 월할 계산, 거치·상환 조건, 중도상환수수료 등에 따라
결과가 달라질 수 있으므로 이 계산기는 참고용으로만 사용해주세요.

## 주요 파일

- `src/lib/interest.ts` — 이자 계산 로직
- `src/components/Calculator.tsx` — 계산기 UI (입력 테이블 + 요약)
- `src/app/page.tsx`, `src/app/layout.tsx` — 페이지 뼈대
# interim-payment-calculator
