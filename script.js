// price.csv 파일의 URL (예시 URL입니다. 실제 URL로 변경해주세요.)
const csvUrl = 'https://raw.githubusercontent.com/username/repository/branch/price.csv';

// CSV 데이터를 로드하고 파싱하는 함수
async function loadCsvData(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    const data = csvText.split('\n').map(row => row.split(','));
    return data;
}

function calculatePerformance(data, selectedEtfs, startDate, endDate) {
    // 날짜와 ETF 이름을 인덱스로 변환합니다.
    const dateIndex = data.findIndex(row => row[0] === startDate);
    const endDateIndex = data.findIndex(row => row[0] === endDate);

    // 선택된 ETF들에 대한 성과를 저장할 객체를 초기화합니다.
    let performances = {};

    // 각 ETF에 대해 반복하며 성과를 계산합니다.
    selectedEtfs.forEach(etf => {
        // ETF의 컬럼 인덱스를 찾습니다.
        const etfIndex = data[0].findIndex(columnName => columnName === etf);

        // 시작 날짜와 종료 날짜에 해당하는 가격을 찾습니다.
        const startPrice = parseFloat(data[dateIndex][etfIndex]);
        const endPrice = parseFloat(data[endDateIndex][etfIndex]);

        // 수익률을 계산합니다. ((종가 - 시작가) / 시작가) * 100
        const performance = ((endPrice - startPrice) / startPrice) * 100;

        // 계산된 수익률을 performances 객체에 저장합니다.
        performances[etf] = performance.toFixed(2); // 소수점 둘째 자리까지 반올림
    });

    return performances;
}


// 예시 데이터 로드 함수 호출
loadCsvData(csvUrl).then(data => {
    // 선택된 ETFs, 시작 날짜, 종료 날짜
    const selectedEtfs = ['ACWI', 'HYG'];
    const startDate = '2021-01-01';
    const endDate = '2022-01-01';

    // 성과 계산
    const performance = calculatePerformance(data, selectedEtfs, startDate, endDate);
    console.log(performance);
});



document.addEventListener('DOMContentLoaded', function() {
    // 요소 참조 및 이벤트 리스너 설정
    document.getElementById('calculateButton').addEventListener('click', async () => {
        const data = await loadCsvData(csvUrl);
        const selectedEtf = /* 사용자가 선택한 ETF의 티커 */;
        const startDate = /* 시작 날짜 */;
        const endDate = /* 종료 날짜 */;
        
        const performance = calculatePerformance(data, selectedEtf, startDate, endDate);
        
        updateChart(performance); // 성과에 따라 차트 업데이트
    });
});

function updateChart(performance) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if (window.portfolioChart) {
        window.portfolioChart.destroy(); // 이전 차트가 있다면 제거
    }
    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: performance.labels, // 날짜 라벨
            datasets: [{
                label: '포트폴리오 성과',
                data: performance.data, // 계산된 성과 데이터
                borderColor: 'rgba(54, 162, 235, 1)',
                fill: false,
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
