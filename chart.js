// 차트 업데이트 함수
function updateChart(performances, selectedEtfs, startDate, endDate) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if (window.portfolioChart) window.portfolioChart.destroy();

    // 차트 업데이트 로직 구현
    window.portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2020', '2021', '2022'], // 임시 라벨
            datasets: [{
                label: `${startDate} - ${endDate} 성과 (%)`,
                data: [10, 15, 20], // 임시 데이터
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
