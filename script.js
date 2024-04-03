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
    // 각 선택된 ETF가 데이터 내에 있는지 초기 검증을 수행합니다.
    for (const etf of Object.values(etfSelections)) {
        if (!data[etf]) {
            console.error(`선택된 ETF (${etf})에 대한 데이터가 누락되었습니다.`);
            return { labels: [], data: [] };
        }
    }

    const startDate = "2020-01-01"; // 예시 시작일
    const endDate = "2024-04-01"; // 예시 종료일
    let labels = [], performanceData = [];

    // 모든 ETF의 데이터가 동일한 날짜를 가지고 있다고 가정합니다.
    // 첫 번째 선택된 ETF의 이름을 사용하여 날짜 범위를 얻습니다.
    const etfName = etfSelections.stock; // 유효성 검사를 통과했으므로 어떤 ETF 이름이든 사용할 수 있습니다.
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

function updateAllocationLabel(value, type) {
    // 비중 값이 반영될 라벨 요소의 ID를 설정합니다. 예: 'stockPercentage', 'bondPercentage', 'alternativePercentage'
    const labelId = `${type}Percentage`;

    // 비중 값을 표시할 라벨 요소를 찾아 값을 업데이트합니다.
    document.getElementById(labelId).innerText = value;
}

function updateAllocationBar() {
    const stockAllocation = parseInt(document.getElementById('stockAllocation').value, 10);
    const bondAllocation = parseInt(document.getElementById('bondAllocation').value, 10);
    const alternativeAllocation = parseInt(document.getElementById('alternativeAllocation').value, 10);
    const totalAllocation = stockAllocation + bondAllocation + alternativeAllocation;

    // 비중에 따른 각 막대기의 너비 계산
    const stockFillWidth = (stockAllocation / totalAllocation) * 100;
    const bondFillWidth = (bondAllocation / totalAllocation) * 100;
    const alternativeFillWidth = (alternativeAllocation / totalAllocation) * 100;

    // 각 막대기의 너비 설정
    document.getElementById('stockFill').style.width = `${stockFillWidth}%`;
    document.getElementById('bondFill').style.width = `${bondFillWidth}%`;
    document.getElementById('alternativeFill').style.width = `${alternativeFillWidth}%`;

    // 총합 100% 초과 시 막대기 색상 변경
    const totalBar = document.getElementById('totalAllocationBar');
    if (totalAllocation > 100) {
        totalBar.classList.add('overLimit');
    } else {
        totalBar.classList.remove('overLimit');
    }
}

// 비중 조절 바의 이벤트 리스너에 updateAllocationBar 함수를 연결
document.getElementById('stockAllocation').addEventListener('input', updateAllocationBar);
document.getElementById('bondAllocation').addEventListener('input', updateAllocationBar);
document.getElementById('alternativeAllocation').addEventListener('input', updateAllocationBar);

// 페이지 로딩 시 비중 바 초기화를 위해 한 번 호출
updateAllocationBar();

