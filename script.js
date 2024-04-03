// CSV 데이터 로드 및 파싱
async function loadCsvData(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    const rows = csvText.split('\n').map(row => row.split(','));
    return rows.reduce((acc, row) => {
        acc[row[0]] = row.slice(1); // 첫 번째 열을 키로, 나머지를 값으로 저장
        return acc;
    }, {});
}

// 선택된 ETF와 비중에 따른 포트폴리오 성과 계산
function calculatePortfolioPerformance(data, etfSelections, allocations) {
    // 이 함수에서는 선택된 ETF들과 비중을 기반으로 포트폴리오 성과를 계산합니다.
    // 계산된 성과는 차트로 표시될 수 있도록 데이터를 반환해야 합니다.
    // 차트를 위한 데이터 구조 예시: { labels: ['2020-01', '2020-02', ...], data: [0.5, 1.2, ...] }
    
    // TODO: 실제 성과 계산 로직 구현
    console.log("성과 계산 필요", etfSelections, allocations);
    
    // 임시 성과 데이터
    const performanceData = {
        labels: ['2020-01', '2020-02', '2020-03'],
        data: [0, 10, 20] // 예시 데이터: 지난 3개월간의 성과
    };
    return performanceData;
}

// 성과 데이터를 바탕으로 차트 업데이트
function updateChart(performanceData) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: performanceData.labels,
            datasets: [{
                label: 'Portfolio Performance',
                data: performanceData.data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    const calculateBtn = document.getElementById('calculatePerformance');
    const data = await loadCsvData('https://raw.githubusercontent.com/epicommu/ReturnTest/main/price.csv'); // 실제 CSV 파일 경로로 변경 필요

    calculateBtn.addEventListener('click', function() {
        const etfSelections = {
            stock: document.getElementById('stockEtf').value,
            bond: document.getElementById('bondEtf').value,
            alternative: document.getElementById('alternativeEtf').value,
        };
        const allocations = {
            stock: parseInt(document.getElementById('stockAllocation').value, 10),
            bond: parseInt(document.getElementById('bondAllocation').value, 10),
            alternative: parseInt(document.getElementById('alternativeAllocation').value, 10),
        };

        const performanceData = calculatePortfolioPerformance(data, etfSelections, allocations);
        updateChart(performanceData);
    });
});
