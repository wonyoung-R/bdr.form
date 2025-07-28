// Google Apps Script 코드
// 이 코드를 Google Apps Script 에디터에 복사하여 사용하세요
// 1. Google Sheets를 열고 확장 프로그램 > Apps Script 클릭
// 2. 아래 코드를 붙여넣기
// 3. 배포 > 새 배포 > 웹 앱으로 배포
// 4. 생성된 URL을 script.js의 GOOGLE_SCRIPT_URL에 입력

function doPost(e) {
  try {
    // 스프레드시트 ID - 제공하신 URL에서 추출
    const SPREADSHEET_ID = '1V1a8FrpD8MpctneTu8jhT7S1ebbo3NAP0-2HoEzx_1M';
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    // POST 데이터 파싱
    const data = JSON.parse(e.postData.contents);
    
    // 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      const headers = [
        '제출일시',
        '팀명',
        '대표자 이름',
        '대표자 연락처',
        '선수 이름',
        '생년월일',
        '등번호',
        '포지션'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // 데이터 행 추가
    const timestamp = new Date(data.submittedAt).toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
    
    // 각 선수별로 행 추가
    data.players.forEach((player, index) => {
      const row = [
        timestamp,
        data.teamName,
        data.representativeName,
        data.representativeContact,
        player.name,
        player.birthdate,
        player.number,
        player.position
      ];
      
      sheet.appendRow(row);
    });
    
    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // 에러 응답
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'ready'}))
    .setMimeType(ContentService.MimeType.JSON);
}