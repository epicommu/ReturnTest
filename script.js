// price.csv 파일의 URL
const csvUrl = 'https://raw.githubusercontent.com/epicommu/ReturnTest/main/price.csv';

// CSV 데이터를 로드하고 파싱하는 함수
async function loadCsvData(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    return csvText.split('\n').map(row => row.split(','));
}

// 성과를 계산하는 함수
function calculatePerformance(data, selectedEtfs, startDate, endDate) {
    const dateIndex = data.findIndex(row => row[0] === startDate);
    const endDateIndex = data.findIndex(row => row[0] === endDate) || data.length - 1;

    return selectedEtfs.reduce((performances, etf) => {
        const etfIndex = data[0].findIndex(columnName => columnName === etf);
        const startPrice = parseFloat(data[dateIndex][etfIndex]);
        const endPrice = parseFloat(data[endDateIndex][etfIndex]);
        performances[etf] = (((endPrice - startPrice) / startPrice) * 100).toFixed(2);
        return performances;
    }, {});
}

// 각 자산군에서 최소 한 개의 ETF가 선택되었는지 확인하는 함수
function isSelectedFromEachCategory() {
    return ['stock', 'bond', 'alternative'].every(category => 
        Array.from(document.querySelectorAll(`input[name="${category}"]:checked`)).length > 0
    );
}

// 사용자가 선택한 기간에 기반하여 시작 날짜와 종료 날짜를 계산하는 함수
function calculateDatesBasedOnSelection() {
    const selectedPeriod = document.querySelector('input[name="period"]:checked').value;
    const endDate = new Date();
    const startDate = new Date(endDate.setFullYear(endDate.getFullYear() - parseInt(selectedPeriod, 10)));
    return {
        startDateStr: startDate.toISOString().split('T')[0],
        endDateStr: endDate.toISOString().split('T')[0]
    };
}

// 페이지가 로드될 때 실행되는 함수
document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');

    calculateBtn.addEventListener('click', async () => {
        if (!isSelectedFromEachCategory()) {
            alert("각 자산군에서 최소 한 개의 자산을 선택해야 합니다.");
            return;
        }

        const data = await loadCsvData(csvUrl);
        const selectedEtfs = Array.from(document.querySelectorAll('input:checked')).map(input => input.value);
        const { startDateStr, endDateStr } = calculateDatesBasedOnSelection();
        const performances = calculatePerformance(data, selectedEtfs, startDateStr, endDateStr);

        updateChart(performances, selectedEtfs, startDateStr, endDateStr);
    });
});

