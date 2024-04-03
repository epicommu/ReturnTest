// price.csv 파일의 URL
const csvUrl = 'https://raw.githubusercontent.com/epicommu/ReturnTest/main/price.csv';

// CSV 데이터를 로드하고 파싱하는 함수
async function loadCsvData(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    return csvText.split('\n').map(row => row.split(','));
}

// 성과를 계산하는 함수
function calculatePerformance(data, selectedEtfs, allocation, period) {
    // 이 함수는 선택된 ETF들, 할당 비율, 선택된 기간에 따라 성과를 계산합니다.
    // 계산된 성과는 라인 차트로 표시될 수 있는 데이터 형태로 반환됩니다.
    // 주의: 이 예시는 실제 로직 구현을 위한 기본 구조를 제공합니다. 실제 데이터와 비즈니스 로직에 맞게 수정이 필요합니다.
    
    // TODO: 실제 데이터에 기반한 성과 계산 로직 구현
    console.log("성과 계산 로직 구현 필요", selectedEtfs, allocation, period);

    // 임시로 성과 데이터 생성
    const performanceData = {
        labels: ['2020', '2021', '2022'],
        data: [10, 15, 20] // 예시 데이터
    };

    return performanceData;
}

// 차트를 업데이트하는 함수
function updateChart(performanceData) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if (window.myPortfolioChart) {
        window.myPortfolioChart.destroy();
    }
    window.myPortfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: performanceData.labels,
            datasets: [{
                label: '포트폴리오 성과',
                data: performanceData.data,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
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

