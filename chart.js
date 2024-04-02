/**
 * 성과 데이터를 바탕으로 차트를 업데이트하는 함수.
 * @param {Object} performances - ETF별 성과 데이터를 담고 있는 객체.
 * @param {Array} selectedEtfs - 선택된 ETF 목록.
 * @param {String} startDate - 성과 계산의 시작 날짜.
 * @param {String} endDate - 성과 계산의 종료 날짜.
 */
function updateChart(performances, selectedEtfs, startDate, endDate) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if (window.portfolioChart) window.portfolioChart.destroy(); // 기존 차트가 있으면 제거

    const labels = selectedEtfs; // 선택된 ETF 목록을 라벨로 사용
    const performanceValues = labels.map(etf => parseFloat(performances[etf]));

    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${startDate} - ${endDate} 성과 (%)`,
                data: performanceValues,
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
