/**
 * 성과 데이터를 바탕으로 차트를 업데이트하는 함수.
 * @param {Object} performances - ETF별 성과 데이터를 담고 있는 객체.
 * @param {Array} selectedEtfs - 선택된 ETF 목록.
 * @param {String} startDate - 성과 계산의 시작 날짜.
 * @param {String} endDate - 성과 계산의 종료 날짜.
 */
function updateChart(etfReturns, selectedEtfs, startDate, endDate) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if (window.portfolioChart) window.portfolioChart.destroy(); // 기존 차트 제거

    // 모든 선택된 ETF의 날짜별 수익률 평균 계산
    const dates = Object.keys(etfReturns[selectedEtfs[0]]); // 날짜 배열
    const portfolioReturns = dates.map(date => {
        let totalReturn = 0;
        selectedEtfs.forEach(etf => {
            totalReturn += parseFloat(etfReturns[etf][date]); // 날짜별 수익률을 더함
        });
        return (totalReturn / selectedEtfs.length).toFixed(2); // ETF 수로 나누어 평균 계산
    });

    // 누적 수익률 계산
    const cumulativeReturns = portfolioReturns.map((ret, index) => 
        index === 0 ? ret : (parseFloat(ret) + parseFloat(cumulativeReturns[index - 1])).toFixed(2)
    );

    // 차트 데이터 설정
    const data = {
        labels: dates,
        datasets: [{
            label: `Portfolio Cumulative Return (%) from ${startDate} to ${endDate}`,
            data: cumulativeReturns,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: false,
        }]
    };

    // 차트 생성
    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}
