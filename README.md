# 출장·회의비 증빙 점검

출장비와 회의비 신청 전에 필수 증빙 누락을 확인하는 웹 도구입니다.

## 주요 기능

- 여러 회차의 출장일, 출발지, 도착지, 거리, 유가 관리
- `거리 ÷ 복합연비 × 유가` 기준 회차별·전체 예상 유류비 계산
- 회차별 현장 사진, 영수증, 네이버 지도, 오피넷 자료 누락 점검
- 차량 공인연비 자료와 회의비 증빙 점검
- 네이버 지도, 오피넷, 한국에너지공단 공식 확인 페이지 연결
- 가상 테스트 서류, JSON 저장, 인쇄·PDF 출력

외부 API 인증키 없이 동작합니다. 첨부 파일은 서버로 전송하거나 저장하지 않으며 현재 화면에서 파일명과 첨부 여부만 확인합니다.

## 배포 사이트

[GitHub Pages에서 실행하기](https://kimchoungmin-create.github.io/trip-receipt-checker/)

`main` 브랜치에 변경사항을 올리면 GitHub Actions가 정적 사이트를 다시 빌드해 Pages에 자동 배포합니다.

## 로컬 실행

```bash
pnpm install
pnpm dev
```

## 검증

```bash
pnpm build
pnpm test
```

GitHub Pages용 정적 빌드는 다음 명령을 사용합니다.

```bash
pnpm build:pages
```
