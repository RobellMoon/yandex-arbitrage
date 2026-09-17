// ============================================================
// MAIN APPLICATION
// ============================================================

let selectedPeriod = "today";
let selectedChart = "calls";

let currentCalls = [];


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    initPeriodButtons();
    initChartButtons();

    renderDashboard();

});


// ============================================================
// PERIOD
// ============================================================

function initPeriodButtons() {

    const buttons = document.querySelectorAll(".period-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            selectedPeriod = button.dataset.period;

            renderDashboard();

        });

    });

}


// ============================================================
// CHART TYPE
// ============================================================

function initChartButtons() {

    const buttons = document.querySelectorAll(".chart-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            selectedChart = button.dataset.chart;

            renderChart();

        });

    });

}


// ============================================================
// GET CALLS FOR CURRENT PAGE
// ============================================================

function getCallsForCurrentPage() {

    let calls = [...CALLS];


    // Яндекс Недвижимость
    // Показываем все проекты

    if (currentPage === "all") {

        return calls;

    }


    // Конкретный проект

    if (currentPage === "barsa") {

        return calls.filter(
            call => call.project === "Барса"
        );

    }


    if (currentPage === "stolitsyno") {

        return calls.filter(
            call => call.project === "Столицыно"
        );

    }


    return calls;

}


// ============================================================
// PERIOD FILTER
// ============================================================

// ============================================================
// PERIOD FILTER
// ============================================================

function filterCallsByPeriod(calls) {

    const today = new Date("2026-09-17T23:59:59");


    // ========================================================
    // СЕГОДНЯ
    // ========================================================

    if (selectedPeriod === "today") {

        const todayString =
            today.toISOString().split("T")[0];

        return calls.filter(
            call => call.date === todayString
        );

    }


    // ========================================================
    // ПОЛЬЗОВАТЕЛЬСКИЙ ПЕРИОД
    // ========================================================

    if (selectedPeriod === "custom") {

        // Пока пользовательский период
        // не подключён.

        return calls;

    }


    // ========================================================
    // ТЕКУЩИЙ МЕСЯЦ
    // ========================================================

    if (selectedPeriod === "month") {

        const currentMonth =
            today.getMonth();

        const currentYear =
            today.getFullYear();


        return calls.filter(call => {

            const date =
                new Date(`${call.date}T12:00:00`);

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );

        });

    }


    // ========================================================
    // 7 / 30 ДНЕЙ
    // ========================================================

    const days = Number(selectedPeriod);

    const startDate =
        new Date(today);

    startDate.setDate(
        startDate.getDate() - days + 1
    );


    return calls.filter(call => {

        const date =
            new Date(`${call.date}T23:59:59`);

        return (
            date >= startDate &&
            date <= today
        );

    });

}


// ============================================================
// MAIN DASHBOARD RENDER
// ============================================================

function renderDashboard() {

    let calls = getCallsForCurrentPage();

    calls = filterCallsByPeriod(calls);

    currentCalls = calls;


    renderStats(calls);

    renderDailyTable(calls);

    renderCallsTable(calls);

    renderChart();

}


// ============================================================
// STATISTICS
// ============================================================

function renderStats(calls) {

    const totalCalls =
        calls.length;


    const totalExpense =
        calls.reduce(
            (sum, call) => sum + call.cost,
            0
        );


    const disputed =
        calls.filter(
            call => call.status === "disputed"
        ).length;


    const returned =
        calls
            .filter(
                call => call.status === "returned"
            )
            .reduce(
                (sum, call) => sum + call.cost,
                0
            );


    document.getElementById(
        "total-calls"
    ).textContent = totalCalls;


    document.getElementById(
        "total-expense"
    ).textContent = formatMoney(totalExpense);


    document.getElementById(
        "total-disputed"
    ).textContent = disputed;


    document.getElementById(
        "total-returned"
    ).textContent = formatMoney(returned);

}


// ============================================================
// DAILY DATA
// ============================================================

function getDailyData(calls) {

    const days = {};


    calls.forEach(call => {

        if (!days[call.date]) {

            days[call.date] = {

                calls: 0,

                expense: 0

            };

        }


        days[call.date].calls++;

        days[call.date].expense += call.cost;

    });


    return Object.entries(days)

        .sort(
            (a, b) =>
                new Date(a[0]) -
                new Date(b[0])
        )

        .map(([date, data]) => ({

            date,

            calls: data.calls,

            expense: data.expense

        }));

}


// ============================================================
// DAILY TABLE
// ============================================================

function renderDailyTable(calls) {

    const tbody =
        document.getElementById("daily-table");


    if (!tbody) return;


    const daily =
        getDailyData(calls);


    tbody.innerHTML = "";


    if (!daily.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    Нет данных за выбранный период
                </td>
            </tr>
        `;

        return;

    }


    daily

        .slice()
        .reverse()

        .forEach(day => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${formatDate(day.date)}
                </td>

                <td>
                    <strong>${day.calls}</strong>
                </td>

                <td>
                    ${formatMoney(day.expense)}
                </td>

            `;


            tbody.appendChild(row);

        });

}


// ============================================================
// CALLS TABLE
// ============================================================

function renderCallsTable(calls) {

    const tbody =
        document.getElementById("calls-table");


    if (!tbody) return;


    tbody.innerHTML = "";


    if (!calls.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    Нет звонков за выбранный период
                </td>
            </tr>
        `;

        return;

    }


    calls

        .slice()
        .sort(
            (a, b) =>
                new Date(
                    `${b.date} ${b.time}`
                ) -
                new Date(
                    `${a.date} ${a.time}`
                )
        )

        .forEach(call => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${formatDate(call.date)}
                    <span class="call-time">
                        ${call.time}
                    </span>
                </td>

                <td>
                    ${call.project}
                </td>

                <td>
                    ${call.phone}
                </td>

                <td>
                    ${formatDuration(
                        call.waitDuration
                    )}
                </td>

                <td>
                    ${formatDuration(
                        call.callDuration
                    )}
                </td>

                <td>
                    <strong>
                        ${formatMoney(call.cost)}
                    </strong>
                </td>

                <td>
                    ${renderStatus(call.status)}
                </td>

                <td>
                    <button
                        class="action-btn"
                        onclick="openCall('${call.id}')"
                    >
                        Подробнее
                    </button>
                </td>

            `;


            tbody.appendChild(row);

        });

}


// ============================================================
// STATUS
// ============================================================

function renderStatus(status) {

    const name =
        STATUS_NAMES[status] || status;


    return `
        <span class="status ${status}">
            ${name}
        </span>
    `;

}


// ============================================================
// DATE
// ============================================================

function formatDate(dateString) {

    const date =
        new Date(`${dateString}T12:00:00`);


    return date.toLocaleDateString(
        "ru-RU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// ============================================================
// OPEN CALL
// ============================================================

function openCall(callId) {

    const call =
        CALLS.find(
            item => item.id === callId
        );


    if (!call) return;


    alert(

        `Звонок ${call.id}\n\n` +

        `Дата: ${formatDate(call.date)} ${call.time}\n` +

        `Проект: ${call.project}\n` +

        `Телефон: ${call.phone}\n` +

        `Ожидание: ${formatDuration(call.waitDuration)}\n` +

        `Разговор: ${formatDuration(call.callDuration)}\n` +

        `Стоимость: ${formatMoney(call.cost)}\n\n` +

        `Статус: ${STATUS_NAMES[call.status]}`

    );

}


// ============================================================
// CHART
// ============================================================

function renderChart() {

    if (
        typeof renderCallsChart !== "function"
    ) {
        return;
    }


    renderCallsChart(
        getDailyData(currentCalls),
        selectedChart
    );

}