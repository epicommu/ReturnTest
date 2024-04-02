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
    // 시작 날짜와 종료 날짜에 해당하는 인덱스 찾기
    const startIndex = data.findIndex(row => row[0] === startDate);
    const endIndex = data.findIndex(row => row[0] === endDate);

    // 선택된 ETF들의 날짜별 수익률을 저장할 객체 초기화
    const etfReturns = selectedEtfs.reduce((acc, etf) => {
        acc[etf] = [];
        return acc;
    }, {});

    // 각 ETF에 대해 날짜별 수익률 계산
    for (let i = startIndex + 1; i <= endIndex; i++) {
        selectedEtfs.forEach(etf => {
            const etfIndex = data[0].findIndex(columnName => columnName === etf);
            const previousPrice = parseFloat(data[i - 1][etfIndex]);
            const currentPrice = parseFloat(data[i][etfIndex]);
            const returnRate = ((currentPrice - previousPrice) / previousPrice) * 100;
            etfReturns[etf].push(returnRate.toFixed(2));
        });
    }

    return etfReturns;
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

