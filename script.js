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

function calculatePortfolioPerformance(data, etfSelections, allocations) {
    // 시작일과 종료일을 기준으로 데이터 필터링
    const startDate = "2020-01-01"; // 예시 시작일
    const endDate = "2022-12-31"; // 예시 종료일
    let labels = [], performanceData = [];

    Object.keys(data[Object.keys(etfSelections)[0]]).forEach(date => {
        if (date >= startDate && date <= endDate) {
            labels.push(date);
            let totalPerformance = 0;
            Object.keys(etfSelections).forEach(assetType => {
                const etf = etfSelections[assetType];
                const allocation = allocations[assetType] / 100;
                const priceChange = (data[etf][date] / data[etf][startDate]) - 1;
                totalPerformance += priceChange * allocation;
            });
            performanceData.push(totalPerformance * 100); // 변화율을 퍼센트로 표시
        }
    });

    return { labels, data: performanceData };
}

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
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: { beginAtZero: true }
                }]
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const calculateBtn = document.getElementById('calculatePerformance');
    const prices = await loadCsvData('https://raw.githubusercontent.com/epicommu/ReturnTest/main/price.csv');

    calculateBtn.addEventListener('click', () => {
        const etfSelections = {
            stock: document.querySelector('input[name="stock"]:checked').value,
            bond: document.querySelector('input[name="bond"]:checked').value,
            alternative: document.querySelector('input[name="alternative"]:checked').value,
        };
        const allocations = {
            stock: document.getElementById('stockAllocation').value,
            bond: document.getElementById('bondAllocation').value,
            alternative: document.getElementById('alternativeAllocation').value,
        };

        const performance = calculatePortfolioPerformance(prices, etfSelections, allocations);
        updateChart(performance);
    });
});

