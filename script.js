// price.csv 파일의 URL
const csvUrl = 'https://raw.githubusercontent.com/epicommu/ReturnTest/main/price.csv';

// CSV 데이터를 로드하고 파싱하는 함수
async function loadCsvData(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    return csvText.split('\n').map(row => row.split(','));
}

function calculatePerformance(data, selectedEtfs, allocations, period) {
    // CSV 데이터에서 날짜와 ETF 가격 정보 추출
    const dates = data.map(row => row[0]); // 첫 번째 열은 날짜
    const prices = data.slice(1).map(row => {
        return selectedEtfs.reduce((acc, etf, index) => {
            const etfIndex = data[0].indexOf(etf); // ETF 이름으로부터 해당 ETF의 컬럼 인덱스 찾기
            acc[etf] = parseFloat(row[etfIndex]); // ETF의 가격 정보 추출
            return acc;
        }, {});
    });

    // 선택된 기간에 따라 데이터 필터링
    const filteredPrices = prices.slice(-period); // 최근 'period' 일간의 데이터 선택

    // 포트폴리오의 일간 수익률 계산
    const dailyReturns = filteredPrices.map((prices, index, arr) => {
        if (index === 0) return 0; // 첫 번째 날은 이전 날짜가 없으므로 수익률 계산 불가
        const previousPrices = arr[index - 1];
        return selectedEtfs.reduce((acc, etf) => {
            const dailyReturn = (prices[etf] - previousPrices[etf]) / previousPrices[etf];
            return acc + (dailyReturn * allocations[etf]); // 가중 평균 수익률 계산
        }, 0);
    });

    // 일간 수익률을 누적하여 포트폴리오 수익률 계산
    const cumulativeReturns = dailyReturns.reduce((acc, curr) => {
        const last = acc.length > 0 ? acc[acc.length - 1] : 0;
        acc.push(last + curr);
        return acc;
    }, []);

    // 수익률 데이터 반환
    return {
        labels: dates.slice(-period), // 선택된 기간의 날짜
        data: cumulativeReturns // 누적 수익률
    };
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

