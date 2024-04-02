// price.csv 파일의 URL (예시 URL입니다. 실제 URL로 변경해주세요.)
const csvUrl = 'https://raw.githubusercontent.com/epicommu/ReturnTest/main/price.csv';

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

document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');

    calculateBtn.addEventListener('click', async () => {
        // 선택된 ETFs 추출
        const selectedEtfs = Array.from(document.querySelectorAll('input[name="stock"]:checked, input[name="bond"]:checked, input[name="alternative"]:checked')).map(input => input.value);

        // 각 자산군에서 최소 한 개의 ETF가 선택되었는지 확인
        if (!isSelectedFromEachCategory()) {
            alert("각 자산군에서 최소 한 개의 자산을 선택해야 합니다.");
            return;
        }

        // 기간 추출 및 날짜 계산
        const { startDateStr, endDateStr } = calculateDatesBasedOnSelection();

        // CSV 데이터 로드 및 성과 계산
        const data = await loadCsvData(csvUrl);
        const performances = calculatePerformance(data, selectedEtfs, startDateStr, endDateStr);

        // 차트 업데이트 로직은 별도의 chart.js 파일로 이동됩니다. (참조를 위해 여기에 남겨둡니다)
        updateChart(performances, selectedEtfs, startDateStr, endDateStr);
    });
});

// 각 자산군에서 최소 한 개의 ETF가 선택되었는지 확인하는 함수
function isSelectedFromEachCategory() {
    const hasStockSelected = Array.from(document.querySelectorAll('input[name="stock"]:checked')).length > 0;
    const hasBondSelected = Array.from(document.querySelectorAll('input[name="bond"]:checked')).length > 0;
    const hasAlternativeSelected = Array.from(document.querySelectorAll('input[name="alternative"]:checked')).length > 0;
    return hasStockSelected && hasBondSelected && hasAlternativeSelected;
}

// 사용자가 선택한 기간에 기반하여 시작 날짜와 종료 날짜를 계산하는 함수
function calculateDatesBasedOnSelection() {
    const selectedPeriod = document.querySelector('input[name="period"]:checked').value;
    const endDate = new Date();
    const startDate = new Date(endDate.setFullYear(endDate.getFullYear() - selectedPeriod));
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = new Date().toISOString().split('T')[0];
    return { startDateStr, endDateStr };
}


async function loadCsvData(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    const data = csvText.split('\n').map(row => row.split(','));
    return data;
}

function calculatePerformance(data, selectedEtfs, startDate, endDate) {
    const dateIndex = data.findIndex(row => row[0] === startDate);
    const endDateIndex = data.findIndex(row => row[0] === endDate) || data.length - 1; // endDate가 명시되지 않은 경우 마지막 인덱스 사용

    let performances = {};

    selectedEtfs.forEach(etf => {
        const etfIndex = data[0].findIndex(columnName => columnName === etf);
        const startPrice = parseFloat(data[dateIndex][etfIndex]);
        const endPrice = parseFloat(data[endDateIndex][etfIndex]);
        const performance = ((endPrice - startPrice) / startPrice) * 100;
        performances[etf] = performance.toFixed(2);
    });

    return performances;
}

function updateChart(performances, selectedEtfs, startDate, endDate) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if (window.portfolioChart) window.portfolioChart.destroy(); // 기존 차트가 있으면 제거

    const labels = Object.keys(performances);
    const data = Object.values(performances).map(perf => parseFloat(perf));

    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${startDate} - ${endDate} 성과 (%)`,
                data: data,
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
