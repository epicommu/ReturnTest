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

// 페이지 로드 시 실행되는 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    calculateBtn.addEventListener('click', async () => {
        // 사용자 입력 처리 및 성과 계산 로직을 여기에 구현합니다.
        // 예시 코드는 위에서 제공한 것을 참조하세요.
    });
});
