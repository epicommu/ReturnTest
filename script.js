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
function calculatePortfolioPerformance(data, etfSelections, allocations) {
    // 유효성 검사: 모든 ETF가 선택되었는지 확인
    if (!etfSelections.stock || !etfSelections.bond || !etfSelections.alternative) {
        console.error("모든 ETF가 선택되지 않았습니다.");
        return { labels: [], data: [] };
    }
    
    // 시작일과 종료일을 기준으로 데이터 필터링
    const startDate = "2020-01-01";
    const endDate = "2022-12-31";
    let labels = [], performanceData = [];

    // 가정: 모든 ETF의 가격 데이터는 동일한 날짜를 가집니다.
    const etfName = etfSelections.stock; // 유효성 검사를 통과했으므로 아무 ETF 이름이나 사용 가능
    if (!data[etfName]) {
        console.error("선택된 ETF에 대한 데이터가 없습니다.");
        return { labels: [], data: [] };
    }

    const dates = Object.keys(data[etfName]).filter(date => date >= startDate && date <= endDate);
    labels = dates;

    dates.forEach(date => {
        let totalPerformance = 0;
        for (const [assetType, etfName] of Object.entries(etfSelections)) {
            if (!data[etfName] || !data[etfName][date]) {
                console.error(`데이터가 누락되었습니다: ${etfName}`);
                continue; // 누락된 데이터를 위해 이번 반복을 건너뜁니다.
            }
            const allocation = allocations[assetType] / 100;
            const priceChange = data[etfName][date] / data[etfName][startDate] - 1;
            totalPerformance += priceChange * allocation;
        }
        performanceData.push(totalPerformance * 100); // 변화율을 퍼센트로 표시
    });

    return { labels, data: performanceData };
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

