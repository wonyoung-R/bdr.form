# 2025 서울 국제 유소년 농구 대회 참가신청서

2025 서울 국제 유소년 농구 대회 온라인 참가신청 시스템입니다.

## 주요 기능

- 팀 정보 입력 (팀명, 대표자 정보)
- 선수 명단 관리 (최소 5명, 최대 20명)
- 실시간 유효성 검사
- 제출 전 데이터 확인 모달
- 구글 시트 자동 연동
- 반응형 디자인 (모바일 최적화)

## 기술 스택

- HTML5
- CSS3
- Vanilla JavaScript
- Google Apps Script (데이터 저장)

## 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/wonyoung-R/bdr.git
cd bdr
```

2. 로컬 서버 실행
```bash
python3 -m http.server 8000
```

3. 브라우저에서 http://localhost:8000 접속

## 구글 시트 연동 설정

1. Google Sheets에서 Apps Script 열기
2. `google-apps-script.js` 내용 복사
3. 웹 앱으로 배포
4. 생성된 URL을 `script.js`의 `GOOGLE_SCRIPT_URL`에 설정

## 라이선스

MIT License