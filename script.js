let playerCount = 0;
const MAX_PLAYERS = 20;

// Google Apps Script Web App URL (구글 시트 연동용)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvGR4t-wlV1m3apOdXWQ87fiSExwiIAvuv6qaVMADY7TLSJY945ErBLmCCqr1LOJZyXg/exec';

// 페이지 로드 시 초기 설정
document.addEventListener('DOMContentLoaded', function() {
    // SNS 썸네일 메타태그 생성
    createSocialThumbnail();
    // 초기 5명의 선수 입력 행 추가
    for (let i = 0; i < 5; i++) {
        addPlayerRow();
    }
    
    // 이벤트 리스너 설정
    document.getElementById('addPlayerBtn').addEventListener('click', addPlayerRow);
    document.getElementById('applicationForm').addEventListener('submit', handleSubmit);
    
    // 실시간 유효성 검사
    document.getElementById('category').addEventListener('blur', validateTeamInfo);
    document.getElementById('teamName').addEventListener('blur', validateTeamInfo);
    document.getElementById('representativeName').addEventListener('blur', validateTeamInfo);
    document.getElementById('representativeContact').addEventListener('blur', validateTeamInfo);
});

// 선수 행 추가
function addPlayerRow() {
    if (playerCount >= MAX_PLAYERS) {
        alert('최대 20명까지만 등록 가능합니다.');
        return;
    }
    
    playerCount++;
    
    // 데스크톱용 테이블 행 추가
    const tbody = document.getElementById('playersTableBody');
    const row = document.createElement('tr');
    row.setAttribute('data-player-index', playerCount);
    
    row.innerHTML = `
        <td>${playerCount}</td>
        <td><input type="text" name="playerName" class="player-name"></td>
        <td><input type="date" name="playerBirthdate" class="player-birthdate"></td>
        <td><input type="number" name="playerNumber" class="player-number" min="0" max="99"></td>
        <td>
            <select name="playerPosition" class="player-position">
                <option value="">선택</option>
                <option value="PG">PG (포인트가드)</option>
                <option value="SG">SG (슈팅가드)</option>
                <option value="SF">SF (스몰포워드)</option>
                <option value="PF">PF (파워포워드)</option>
                <option value="C">C (센터)</option>
            </select>
        </td>
        <td><button type="button" class="delete-btn" onclick="deletePlayerRow(this)">삭제</button></td>
    `;
    
    tbody.appendChild(row);
    
    // 모바일용 카드 추가
    const playerCards = document.getElementById('playerCards');
    const card = document.createElement('div');
    card.className = 'player-card';
    card.setAttribute('data-player-index', playerCount);
    
    card.innerHTML = `
        <div class="player-card-header">
            <div class="player-number-badge">${playerCount}</div>
            <button type="button" class="mobile-delete-btn" onclick="deletePlayerCard(this)">×</button>
        </div>
        <div class="form-row">
            <label>이름 <span class="required">*</span></label>
            <input type="text" name="playerName" class="player-name">
        </div>
        <div class="form-row">
            <label>생년월일 <span class="required">*</span></label>
            <input type="date" name="playerBirthdate" class="player-birthdate">
        </div>
        <div class="form-row">
            <label>등번호 <span class="required">*</span></label>
            <input type="number" name="playerNumber" class="player-number" min="0" max="99">
        </div>
        <div class="form-row">
            <label>포지션 <span class="required">*</span></label>
            <select name="playerPosition" class="player-position">
                <option value="">선택</option>
                <option value="PG">PG (포인트가드)</option>
                <option value="SG">SG (슈팅가드)</option>
                <option value="SF">SF (스몰포워드)</option>
                <option value="PF">PF (파워포워드)</option>
                <option value="C">C (센터)</option>
            </select>
        </div>
    `;
    
    playerCards.appendChild(card);
    
    updatePlayerCount();
    
    // 새로 추가된 입력 필드에 이벤트 리스너 추가
    const tableInputs = row.querySelectorAll('input, select');
    const cardInputs = card.querySelectorAll('input, select');
    
    tableInputs.forEach((input, index) => {
        input.addEventListener('blur', function() {
            validatePlayerField(this);
            // 테이블과 카드 동기화
            syncPlayerData(playerCount, index);
        });
        input.addEventListener('input', function() {
            syncPlayerData(playerCount, index);
        });
    });
    
    cardInputs.forEach((input, index) => {
        input.addEventListener('blur', function() {
            validatePlayerField(this);
            // 카드와 테이블 동기화
            syncPlayerData(playerCount, index);
        });
        input.addEventListener('input', function() {
            syncPlayerData(playerCount, index);
        });
    });
}

// 선수 행 삭제 (테이블)
function deletePlayerRow(button) {
    const row = button.closest('tr');
    const playerIndex = row.getAttribute('data-player-index');
    
    // 테이블 행 삭제
    row.remove();
    
    // 해당 카드도 삭제
    const card = document.querySelector(`.player-card[data-player-index="${playerIndex}"]`);
    if (card) card.remove();
    
    playerCount--;
    
    // 순번 재정렬
    updatePlayerNumbers();
    updatePlayerCount();
}

// 선수 카드 삭제 (모바일)
function deletePlayerCard(button) {
    const card = button.closest('.player-card');
    const playerIndex = card.getAttribute('data-player-index');
    
    // 카드 삭제
    card.remove();
    
    // 해당 테이블 행도 삭제
    const row = document.querySelector(`#playersTableBody tr[data-player-index="${playerIndex}"]`);
    if (row) row.remove();
    
    playerCount--;
    
    // 순번 재정렬
    updatePlayerNumbers();
    updatePlayerCount();
}

// 순번 재정렬
function updatePlayerNumbers() {
    const rows = document.querySelectorAll('#playersTableBody tr');
    const cards = document.querySelectorAll('.player-card');
    
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
        row.setAttribute('data-player-index', index + 1);
    });
    
    cards.forEach((card, index) => {
        card.querySelector('.player-number-badge').textContent = index + 1;
        card.setAttribute('data-player-index', index + 1);
    });
}

// 테이블과 카드 데이터 동기화
function syncPlayerData(playerIndex, inputIndex) {
    const row = document.querySelector(`#playersTableBody tr[data-player-index="${playerIndex}"]`);
    const card = document.querySelector(`.player-card[data-player-index="${playerIndex}"]`);
    
    if (!row || !card) return;
    
    const tableInputs = row.querySelectorAll('input, select');
    const cardInputs = card.querySelectorAll('input, select');
    
    // 현재 포커스된 요소 확인
    const activeElement = document.activeElement;
    const isTableActive = row.contains(activeElement);
    
    if (isTableActive) {
        // 테이블에서 카드로 동기화
        cardInputs[inputIndex].value = tableInputs[inputIndex].value;
        if (tableInputs[inputIndex].classList.contains('error')) {
            cardInputs[inputIndex].classList.add('error');
        } else {
            cardInputs[inputIndex].classList.remove('error');
        }
    } else {
        // 카드에서 테이블로 동기화
        tableInputs[inputIndex].value = cardInputs[inputIndex].value;
        if (cardInputs[inputIndex].classList.contains('error')) {
            tableInputs[inputIndex].classList.add('error');
        } else {
            tableInputs[inputIndex].classList.remove('error');
        }
    }
}

// 선수 수 업데이트
function updatePlayerCount() {
    const filledRows = countFilledPlayerRows();
    document.getElementById('currentPlayerCount').textContent = filledRows;
    
    // 선수 추가 버튼 활성화/비활성화
    const addBtn = document.getElementById('addPlayerBtn');
    addBtn.disabled = playerCount >= MAX_PLAYERS;
}

// 작성된 선수 수 계산
function countFilledPlayerRows() {
    const rows = document.querySelectorAll('#playersTableBody tr');
    let count = 0;
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input, select');
        const isFilled = Array.from(inputs).every(input => input.value.trim() !== '');
        if (isFilled) count++;
    });
    
    return count;
}

// 팀 정보 유효성 검사
function validateTeamInfo() {
    const category = document.getElementById('category');
    const teamName = document.getElementById('teamName');
    const representativeName = document.getElementById('representativeName');
    const representativeContact = document.getElementById('representativeContact');
    
    validateField(category);
    validateField(teamName);
    validateField(representativeName);
    validateField(representativeContact);
    
    // 전화번호 형식 검사
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (representativeContact.value && !phoneRegex.test(representativeContact.value)) {
        representativeContact.classList.add('error');
    }
}

// 선수 필드 유효성 검사
function validatePlayerField(field) {
    const container = field.closest('tr') || field.closest('.player-card');
    const inputs = container.querySelectorAll('input, select');
    const hasAnyValue = Array.from(inputs).some(input => input.value.trim() !== '');
    
    if (hasAnyValue) {
        inputs.forEach(input => {
            validateField(input);
        });
        
        // 카드에 에러 표시
        if (container.classList.contains('player-card')) {
            const hasError = Array.from(inputs).some(input => input.classList.contains('error'));
            if (hasError) {
                container.classList.add('error');
            } else {
                container.classList.remove('error');
            }
        }
    } else {
        inputs.forEach(input => {
            input.classList.remove('error');
        });
        if (container.classList.contains('player-card')) {
            container.classList.remove('error');
        }
    }
    
    updatePlayerCount();
}

// 개별 필드 유효성 검사
function validateField(field) {
    // required 속성 대신 클래스나 필드 타입으로 필수 여부 판단
    const isRequired = field.classList.contains('player-name') || 
                      field.classList.contains('player-birthdate') || 
                      field.classList.contains('player-number') || 
                      field.classList.contains('player-position') ||
                      field.id === 'category' ||
                      field.id === 'teamName' ||
                      field.id === 'representativeName' ||
                      field.id === 'representativeContact';
    
    if (isRequired && field.value.trim() === '') {
        field.classList.add('error');
    } else {
        field.classList.remove('error');
    }
}

// 폼 제출 처리
async function handleSubmit(e) {
    e.preventDefault();
    
    // 모든 에러 클래스 초기화
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    // 팀 정보 유효성 검사
    const category = document.getElementById('category');
    const teamName = document.getElementById('teamName');
    const representativeName = document.getElementById('representativeName');
    const representativeContact = document.getElementById('representativeContact');
    
    let hasTeamErrors = false;
    
    if (!category.value) {
        category.classList.add('error');
        hasTeamErrors = true;
    }
    if (!teamName.value.trim()) {
        teamName.classList.add('error');
        hasTeamErrors = true;
    }
    if (!representativeName.value.trim()) {
        representativeName.classList.add('error');
        hasTeamErrors = true;
    }
    if (!representativeContact.value.trim()) {
        representativeContact.classList.add('error');
        hasTeamErrors = true;
    } else {
        // 전화번호 형식 검사
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(representativeContact.value)) {
            representativeContact.classList.add('error');
            hasTeamErrors = true;
        }
    }
    
    // 선수 정보 유효성 검사
    const playerRows = document.querySelectorAll('#playersTableBody tr');
    const validPlayers = [];
    let hasPlayerErrors = false;
    
    playerRows.forEach(row => {
        const inputs = row.querySelectorAll('input, select');
        const rowData = {
            name: inputs[0].value.trim(),
            birthdate: inputs[1].value,
            number: inputs[2].value,
            position: inputs[3].value
        };
        
        const hasAnyValue = Object.values(rowData).some(value => value !== '');
        const hasAllValues = Object.values(rowData).every(value => value !== '');
        
        if (hasAnyValue) {
            if (!hasAllValues) {
                inputs.forEach((input, index) => {
                    if (input.value.trim() === '') {
                        input.classList.add('error');
                        hasPlayerErrors = true;
                    }
                });
            } else {
                validPlayers.push(rowData);
            }
        }
    });
    
    // 오류 체크
    if (hasTeamErrors || hasPlayerErrors) {
        alert('필수 입력 항목을 모두 입력해주세요.');
        return;
    }
    
    // 최소 선수 수 체크
    if (validPlayers.length < 5) {
        alert('선수는 최소 5명 이상 등록해야 합니다.');
        return;
    }
    
    // 확인 모달 표시
    showConfirmModal({
        category: document.getElementById('category').value,
        teamName: document.getElementById('teamName').value,
        representativeName: document.getElementById('representativeName').value,
        representativeContact: document.getElementById('representativeContact').value,
        players: validPlayers
    });
}

// 확인 모달 표시
function showConfirmModal(data) {
    // 저장된 데이터를 전역 변수에 저장
    window.pendingFormData = {
        ...data,
        submittedAt: new Date().toISOString()
    };
    
    // 팀 정보 표시
    const categoryText = document.getElementById('category').options[document.getElementById('category').selectedIndex].text;
    document.getElementById('confirmCategory').textContent = categoryText;
    document.getElementById('confirmTeamName').textContent = data.teamName;
    document.getElementById('confirmRepName').textContent = data.representativeName;
    document.getElementById('confirmRepContact').textContent = data.representativeContact;
    document.getElementById('confirmPlayerCount').textContent = data.players.length;
    
    // 선수 목록 표시
    const playersList = document.getElementById('confirmPlayersList');
    playersList.innerHTML = '';
    
    data.players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-confirm-card';
        
        // 포지션 한글명 매핑
        const positionNames = {
            'PG': 'PG (포인트가드)',
            'SG': 'SG (슈팅가드)',
            'SF': 'SF (스몰포워드)',
            'PF': 'PF (파워포워드)',
            'C': 'C (센터)'
        };
        
        playerCard.innerHTML = `
            <div class="player-confirm-header">
                <div class="player-confirm-number">${index + 1}</div>
                <strong>${player.name}</strong>
            </div>
            <div class="player-confirm-details">
                <div><span class="info-label">생년월일:</span> ${formatDate(player.birthdate)}</div>
                <div><span class="info-label">등번호:</span> ${player.number}번</div>
                <div><span class="info-label">포지션:</span> ${positionNames[player.position] || player.position}</div>
            </div>
        `;
        
        playersList.appendChild(playerCard);
    });
    
    // 모달 표시
    document.getElementById('confirmModal').style.display = 'block';
}

// 날짜 포맷 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 모달 닫기
function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// 확인 후 제출
async function submitConfirmed() {
    const submitBtn = document.querySelector('.confirm-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '등록 중... <span class="loading"></span>';
    
    try {
        // 구글 시트로 데이터 전송
        await sendToGoogleSheet(window.pendingFormData);
        
        // 모달 닫기
        closeModal();
        
        alert('참가신청이 완료되었습니다!');
        
        // 폼 초기화
        document.getElementById('applicationForm').reset();
        document.getElementById('playersTableBody').innerHTML = '';
        document.getElementById('playerCards').innerHTML = '';
        playerCount = 0;
        
        // 초기 5개 행 다시 추가
        for (let i = 0; i < 5; i++) {
            addPlayerRow();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '등록하기';
    }
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeModal();
    }
}

// 구글 시트로 데이터 전송
async function sendToGoogleSheet(data) {
    // Google Apps Script Web App으로 데이터 전송
    // 실제 구현 시 Google Apps Script URL을 설정해야 합니다
    
    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        console.log('Google Sheet 데이터:', data);
        alert('⚠️ Google Apps Script URL이 설정되지 않았습니다.\n콘솔에서 데이터를 확인하세요.');
        return;
    }
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    // no-cors 모드에서는 response를 읽을 수 없으므로 성공으로 간주
    return true;
}

// SNS 썸네일 메타태그 생성
function createSocialThumbnail() {
    // Open Graph 메타태그 추가
    const ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', '2025 서울 국제 유소년 대회 참가신청서');
    document.head.appendChild(ogTitle);
    
    const ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', '2025 서울 국제 유소년 농구 대회 참가신청서');
    document.head.appendChild(ogDescription);
    
    const ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.setAttribute('content', window.location.href.replace(/[^\/]*$/, '') + 'images/image.png');
    document.head.appendChild(ogImage);
    
    // Twitter Card 메타태그 추가
    const twitterCard = document.createElement('meta');
    twitterCard.setAttribute('name', 'twitter:card');
    twitterCard.setAttribute('content', 'summary_large_image');
    document.head.appendChild(twitterCard);
    
    const twitterTitle = document.createElement('meta');
    twitterTitle.setAttribute('name', 'twitter:title');
    twitterTitle.setAttribute('content', '2025 서울 국제 유소년 대회 참가신청서');
    document.head.appendChild(twitterTitle);
    
    const twitterDescription = document.createElement('meta');
    twitterDescription.setAttribute('name', 'twitter:description');
    twitterDescription.setAttribute('content', '2025 서울 국제 유소년 농구 대회 참가신청서');
    document.head.appendChild(twitterDescription);
    
    const twitterImage = document.createElement('meta');
    twitterImage.setAttribute('name', 'twitter:image');
    twitterImage.setAttribute('content', window.location.href.replace(/[^\/]*$/, '') + 'images/image.png');
    document.head.appendChild(twitterImage);
}