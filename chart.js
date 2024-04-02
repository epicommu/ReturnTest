/**
 * 성과 데이터를 바탕으로 차트를 업데이트하는 함수.
 * @param {Object} performances - ETF별 성과 데이터를 담고 있는 객체.
 * @param {Array} selectedEtfs - 선택된 ETF 목록.
 * @param {String} startDate - 성과 계산의 시작 날짜.
 * @param {String} endDate - 성과 계산의 종료 날짜.
 */
function updateChart(performances, selectedEtfs, startDate, endDate) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');

    // 기존 차트가 있고, destroy 메서드가 존재하는 경우에만 destroy 호출
    if (window.portfolioChart && typeof window.portfolioChart.destroy === 'function') {
        window.portfolioChart.destroy();
    }

    const labels = selectedEtfs; // 선택된 ETF 목록을 라벨로 사용
    const performanceValues = labels.map(etf => parseFloat(performances[etf])); // 성과 데이터를 숫자로 변환

    // 차트 인스턴스를 window.portfolioChart에 할당
    window.portfolioChart = new Chart(ctx, {
        type: 'line', // 차트 유형: 선형
        data: {
            labels: labels, // X축에 표시될 라벨
            datasets: [{
                label: `${startDate} - ${endDate} 성과 (%)`, // 데이터셋 라벨
                data: performanceValues, // Y축에 표시될 데이터
                fill: false, // 선 아래를 채우지 않음
                borderColor: 'rgb(75, 192, 192)', // 선의 색상
                tension: 0.1 // 선의 곡선 정도
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true } // Y축이 0에서 시작하도록 설정
            }
        }
    });
}
