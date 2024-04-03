// CSV 데이터 URL
const csvUrl = 'https://raw.githubusercontent.com/epicommu/ReturnTest/main/price.csv';

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 성과 계산 버튼 이벤트 리스너
    document.getElementById('calculateBtn').addEventListener('click', calculateAndDisplayPerformance);

    // 비중 조절 슬라이더 이벤트 리스너
    document.getElementById('stockBondAllocation').addEventListener('input', function() {
        document.getElementById('stockPercentage').textContent = this.value + '%';
        // 여기에 비중 조절에 따른 추가적인 로직을 구현할 수 있습니다.
    });
});

// 성과 계산 및 차트 표시
async function calculateAndDisplayPerformance() {
    const data = await loadCsvData(csvUrl);
    // 여기에 사용자의 자산 선택과 비중 조절을 반영하는 로직을 추가합니다.
    // 예시로는 선택된 ETF, 비중, 기간을 바탕으로 성과를 계산하고 차트를 업데이트하는 코드를 포함할 수 있습니다.

    // 선택된 ETF들
    const selectedEtfs = getSelectedEtfs();
    
    // 선택된 기간 (기간 선택은 예시로 3년 고정)
    const period = '3'; // 실제 로직에서는 사용자 선택을 반영해야 합니다.

    // 임시로 생성된 성과 데이터로 차트 업데이트
    updateChart({}, selectedEtfs, '시작 날짜', '종료 날짜');
}

// CSV 데이터 로딩 함수
async function loadCsvData(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    return csvText.split('\n').map(row => row.split(','));
}

// 선택된 ETF 추출 함수
function getSelectedEtfs() {
    return Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
}

// 차트 업데이트 함수
function updateChart(performances, selectedEtfs, startDate, endDate) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if (window.portfolioChart) window.portfolioChart.destroy();

    // 차트 업데이트 로직 구현
    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2020', '2021', '2022'], // 임시 라벨
            datasets: [{
                label: `${startDate} - ${endDate} 성과 (%)`,
                data: [10, 15, 20], // 임시 데이터
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('calculateBtn').addEventListener('click', async () => {
        const data = await loadCsvData(csvUrl);
        const selectedEtfs = Array.from(document.querySelectorAll('input[name="stock"]:checked, input[name="bond"]:checked, input[name="alternative"]:checked')).map(el => el.value);
        const allocation = document.getElementById('stockBondAllocation').value;
        const period = document.querySelector('input[name="period"]:checked').value;

        const performanceData = calculatePerformance(data, selectedEtfs, allocation, period);
        updateChart(performanceData);
    });
});

