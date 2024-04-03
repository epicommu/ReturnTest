// CSV 데이터 로드 및 파싱
async function loadCsvData(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const headers = lines.shift().split(',');
    const data = lines.map(line => line.split(','));

    let prices = {};
    data.forEach(row => {
        const date = row[0];
        headers.slice(1).forEach((header, index) => {
            if (!prices[header]) prices[header] = {};
            prices[header][date] = parseFloat(row[index + 1]);
        });
    });
    return prices;
}

// 포트폴리오 성과 계산
function calculatePortfolioPerformance(prices, etfSelections, allocations) {
    const startDate = "2020-01-01";
    const endDate = "2022-12-31";
    let labels = [];
    let performanceData = [];

    // 가정: 모든 ETF의 가격 데이터는 동일한 날짜를 가집니다.
    const dates = Object.keys(prices[Object.keys(etfSelections)[0]]).filter(date => date >= startDate && date <= endDate);
    labels = dates;
    let cumulativePerformance = new Array(dates.length).fill(0);

    dates.forEach((date, i) => {
        Object.entries(etfSelections).forEach(([assetType, etfName]) => {
            const allocation = allocations[assetType] / 100;
            const priceChange = prices[etfName][date] / prices[etfName][startDate] - 1;
            cumulativePerformance[i] += priceChange * allocation;
        });
    });

    return { labels, data: cumulativePerformance.map(perf => perf * 100) };
}

// 차트 업데이트 함수
function updateChart({ labels, data }) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    if (window.portfolioChart) window.portfolioChart.destroy();
    
    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Portfolio Performance (%)',
                data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });
}

// 이벤트 리스너 등록 및 성과 계산 실행
document.addEventListener('DOMContentLoaded', async () => {
    const calculateBtn = document.getElementById('calculatePerformance');
    const prices = await loadCsvData('https://raw.githubusercontent.com/epicommu/ReturnTest/main/price.csv');

    calculateBtn.addEventListener('click', () => {
        const etfSelections = {
            stock: document.querySelector('input[name="stock"]:checked')?.value,
            bond: document.querySelector('input[name="bond"]:checked')?.value,
            alternative: document.querySelector('input[name="alternative"]:checked')?.value,
        };
        const allocations = {
            stock: parseInt(document.getElementById('stockAllocation').value, 10),
            bond: parseInt(document.getElementById('bondAllocation').value, 10),
            alternative: parseInt(document.getElementById('alternativeAllocation').value, 10),
        };

        const performanceData = calculatePortfolioPerformance(prices, etfSelections, allocations);
        updateChart(performanceData);
    });
});

