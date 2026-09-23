// ============================================================
// MAIN APPLICATION
// ============================================================

let selectedPeriod = "today";
let selectedChart = "calls";

let currentCalls = [];
let selectedCallIds = new Set();
let callComments = {};

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    initPeriodButtons();
    initChartButtons();
    initCustomPeriod();
    initExcelExport();

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

            // Закрываем окно выбора периода
            const modal = document.getElementById("custom-period-modal");

            if (modal && selectedPeriod !== "custom") {
                modal.classList.remove("open");
            }

            renderDashboard();

        });

    });

}

// ============================================================
// CUSTOM PERIOD
// ============================================================

function initCustomPeriod() {

    const button = document.getElementById("custom-period-btn");
    const modal = document.getElementById("custom-period-modal");
    const cancelButton = document.getElementById("custom-period-cancel");
    const applyButton = document.getElementById("custom-period-apply");

    const fromInput = document.getElementById("custom-from-date");
    const toInput = document.getElementById("custom-to-date");


    if (!button || !modal || !cancelButton || !applyButton) {
        return;
    }


    // Открыть окно

    button.addEventListener("click", () => {

        const today = new Date();
        const todayString = today.toISOString().split("T")[0];

        if (!fromInput.value) {
            fromInput.value = todayString;
        }

        if (!toInput.value) {
            toInput.value = todayString;
        }

        modal.classList.add("open");

    });


    // Отмена

    cancelButton.addEventListener("click", () => {

        modal.classList.remove("open");

    });


    // Клик по затемнённому фону

    modal.addEventListener("click", (event) => {

        if (event.target === modal) {
            modal.classList.remove("open");
        }

    });


    // Применить

    applyButton.addEventListener("click", () => {

        const from = fromInput.value;
        const to = toInput.value;


        if (!from || !to) {

            alert("Выберите обе даты.");

            return;

        }


        if (from > to) {

            alert("Дата начала не может быть позже даты окончания.");

            return;

        }


        // Сохраняем выбранные даты

        window.customPeriodFrom = from;
        window.customPeriodTo = to;


        selectedPeriod = "custom";


        // Закрываем окно

        modal.classList.remove("open");


        // Обновляем данные

        renderDashboard();

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

async function getCallsForCurrentPage() {

    const today = new Date();

    const formatDate = (date) => {
        return date.toISOString().split("T")[0];
    };

    let toDate = formatDate(today);

    let fromDate = toDate;


    // ========================================================
    // ПЕРИОД
    // ========================================================

    if (selectedPeriod === "7") {

        const date = new Date(today);
        date.setDate(date.getDate() - 6);

        fromDate = formatDate(date);

    }

    else if (selectedPeriod === "30") {

        const date = new Date(today);
        date.setDate(date.getDate() - 29);

        fromDate = formatDate(date);

    }

    else if (selectedPeriod === "month") {

        const date = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        fromDate = formatDate(date);

    }

    else if (selectedPeriod === "custom") {

    fromDate = window.customPeriodFrom || toDate;
    toDate = window.customPeriodTo || toDate;

}


    // ========================================================
    // API
    // ========================================================

    const response = await fetch(
        `/api/yandex/calls?from_date=${fromDate}&to_date=${toDate}`
    );

    if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
    }

    const data = await response.json();


    // ========================================================
    // ПРЕОБРАЗУЕМ API В ФОРМАТ СТАРОГО UI
    // ========================================================

    let calls = (data.calls || []).map(call => ({

        id: call.id,

        date: call.timestamp
            ? call.timestamp.substring(0, 10)
            : "",

        time: call.timestamp
            ? call.timestamp.substring(11, 16)
            : "",

        project: call.projectName || "",

        phone: call.incomingPhone || "",

        waitDuration: call.waitDuration || 0,

        callDuration: call.callDuration || 0,

        cost: Number(call.currentRevenue) || 0,

        status: mapAPIStatusToUI(call.displayStatus),

        objectName: call.objectName || "",

        objectType: call.objectType || "",

        incomingPhone: call.incomingPhone || "",

        internalPhone: call.internalPhone || "",

        campaignTariff: call.campaignTariff || "",

        clientTariff: call.clientTariff || "",

        originalRevenue:
            Number(call.originalRevenue) || 0,

        currentRevenue:
            Number(call.currentRevenue) || 0,

        yandexComplaintStatus:
            call.yandexComplaintStatus || null,

        yandexRefundAmount:
            Number(call.yandexRefundAmount) || 0

    }));


    // ========================================================
    // ФИЛЬТР ПРОЕКТА
    // ========================================================

    if (currentPage === "barsa") {

        calls = calls.filter(
            call => call.project === "Барса"
        );

    }

    else if (currentPage === "stolitsyno") {

        calls = calls.filter(
            call => call.project === "Столицыно"
        );

    }


    return calls;
}

// ============================================================
// PERIOD FILTER
// ============================================================

function mapAPIStatusToUI(status) {

    switch (status) {

        case "qualified":
            return "qualified";

        case "pending":
            return "pending";

        case "returned":
            return "returned";

        case "rejected":
            return "rejected";

        case "free":
            return "free";

        default:
            return "free";

    }

}

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

async function renderDashboard() {

    try {

        const calls =
            await getCallsForCurrentPage();

        currentCalls = calls;


        renderStats(calls);

        renderDailyTable(calls);

        renderCallsTable(calls);

        renderChart();


    } catch (error) {

        console.error(
            "Ошибка загрузки данных Яндекса:",
            error
        );

        currentCalls = [];

        renderStats([]);

        renderDailyTable([]);

        renderCallsTable([]);

        renderChart();

    }

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

	// ============================================================
// CALLS TABLE
// ============================================================

function renderCallsTable(calls) {

    const tbody =
        document.getElementById("calls-table");

    if (!tbody) return;

    tbody.innerHTML = "";

    // Сбрасываем выбор при перерисовке таблицы
    selectedCallIds.clear();

    updateSelectionUI();


    if (!calls.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9">
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
                new Date(`${b.date} ${b.time}`) -
                new Date(`${a.date} ${a.time}`)
        )
        .forEach(call => {

            const row =
                document.createElement("tr");

            const callId =
                String(call.id);


            row.innerHTML = `

                <td class="call-select-cell">

                    <input
                        type="checkbox"
                        class="call-checkbox"
                        data-call-id="${callId}"
                    >

                </td>


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
                    ${formatDuration(call.waitDuration)}
                </td>


                <td>
                    ${formatDuration(call.callDuration)}
                </td>


                <td>
                    <strong>
                        ${formatMoney(call.cost)}
                    </strong>
                </td>


                <td>
                    ${renderStatus(call.status)}
                </td>


                <td class="call-actions-cell">

                    <button
                        class="action-btn"
                        onclick="openCall('${call.id}')"
                    >
                        Подробнее
                    </button>


                    <button
                        class="action-btn comment-btn"
                        data-comment-id="${callId}"
                        style="display: none;"
                    >
                        Добавить комментарий
                    </button>

                </td>

            `;


            tbody.appendChild(row);


            // ====================================================
            // CHECKBOX
            // ====================================================

            const checkbox =
                row.querySelector(".call-checkbox");


            const commentButton =
                row.querySelector(".comment-btn");


            checkbox.addEventListener("change", () => {

                if (checkbox.checked) {

                    selectedCallIds.add(callId);

                    row.classList.add("selected");

                    // Показываем кнопку комментария
                    commentButton.style.display =
                        "inline-flex";

                } else {

                    selectedCallIds.delete(callId);

                    row.classList.remove("selected");

                    // Скрываем кнопку комментария
                    commentButton.style.display =
                        "none";

                }


                updateSelectionUI();

            });


            // ====================================================
            // COMMENT BUTTON
            // ====================================================

            commentButton.addEventListener("click", () => {

                openCommentEditor(
                    callId,
                    row,
                    commentButton
                );

            });

        });

}

// ============================================================
// COMMENT EDITOR
// ============================================================

function openCommentEditor(
    callId,
    row,
    commentButton
) {

    // Если редактор уже существует — не создаём второй
    if (row.querySelector(".comment-editor")) {
        return;
    }


    const currentComment =
        callComments[callId] || "";


    const editor =
        document.createElement("div");

    editor.className =
        "comment-editor";


    editor.innerHTML = `

        <textarea
            class="comment-input"
            placeholder="Введите комментарий..."
        >${escapeHtml(currentComment)}</textarea>

        <div class="comment-editor-actions">

            <button
                type="button"
                class="comment-save-btn"
            >
                Сохранить
            </button>

            <button
                type="button"
                class="comment-cancel-btn"
            >
                Отмена
            </button>

        </div>

    `;


    // Добавляем редактор после строки
    row.after(editor);


    const textarea =
        editor.querySelector(".comment-input");


    textarea.focus();


    // ========================================================
    // СОХРАНИТЬ
    // ========================================================

    editor
        .querySelector(".comment-save-btn")
        .addEventListener("click", () => {

            callComments[callId] =
                textarea.value.trim();


            editor.remove();


            commentButton.textContent =
                callComments[callId]
                    ? "Изменить комментарий"
                    : "Добавить комментарий";

        });


    // ========================================================
    // ОТМЕНА
    // ========================================================

    editor
        .querySelector(".comment-cancel-btn")
        .addEventListener("click", () => {

            editor.remove();

        });

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// SELECTION
// ============================================================

function updateSelectionUI() {

    const countElement =
        document.getElementById("selected-calls-count");

    const exportButton =
        document.getElementById("export-excel-btn");

    const count =
        selectedCallIds.size;

    if (countElement) {
        countElement.textContent =
            `${count} выбрано`;
    }

    if (exportButton) {
        exportButton.style.display =
            count > 0 ? "inline-flex" : "none";
    }

}

// ============================================================
// EXPORT SELECTED CALLS TO EXCEL
// ============================================================

function initExcelExport() {

    const exportButton =
        document.getElementById("export-excel-btn");

    if (!exportButton) {
        return;
    }

    exportButton.addEventListener("click", async () => {

        if (!selectedCallIds.size) {
            return;
        }

        // Берём только выбранные звонки
        const selectedCalls =
            currentCalls.filter(call =>
                selectedCallIds.has(String(call.id))
            );

        if (!selectedCalls.length) {
            alert("Не удалось найти выбранные звонки.");
            return;
        }

        const callIds = selectedCalls.map(call => Number(call.id));

try {
    const response = await fetch(
        "/api/yandex/calls/mark-pending",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(callIds)
        }
    );

    if (!response.ok) {
        throw new Error("Не удалось обновить статус");
    }

    selectedCalls.forEach(call => {
        call.status = "pending";
    });

} catch (error) {
    console.error(error);
    alert("Не удалось обновить статус звонков.");
    return;
}

        // Формируем строки для Excel
        const rows = selectedCalls.map(call => ({

    "Дата":
        formatDate(call.date),

    "Время":
        call.time || "",

    "Проект":
        call.project || "",

    "Телефон":
        call.phone || "",

    "Ожидание":
        formatDuration(call.waitDuration),

    "Разговор":
        formatDuration(call.callDuration),

    "Стоимость":
        Number(call.cost) || 0,

    "Статус":
        STATUS_NAMES[call.status] || call.status || "",

    "Комментарий застройщика":
    callComments[String(call.id)] || ""

}));


        // Создаём Excel-книгу
        const worksheet =
            XLSX.utils.json_to_sheet(rows);

        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Звонки"
        );


        // Ширина колонок
        worksheet["!cols"] = [
    { wch: 14 }, // Дата
    { wch: 8 },  // Время
    { wch: 18 }, // Проект
    { wch: 18 }, // Телефон
    { wch: 12 }, // Ожидание
    { wch: 12 }, // Разговор
    { wch: 14 }, // Стоимость
    { wch: 18 }, // Статус
    { wch: 45 }  // Комментарий
];


        // Имя файла
        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        const fileName =
            `yandex-zvonki-${today}.xlsx`;


        // Скачиваем Excel
        XLSX.writeFile(
            workbook,
            fileName
        );

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

// ============================================================
// DURATION
// ============================================================

function formatDuration(value) {

    if (value === null || value === undefined || value === "") {
        return "00:00";
    }

    // API Яндекса уже может отдавать HH:MM:SS
    if (typeof value === "string" && value.includes(":")) {

        const parts = value.split(":").map(Number);

        if (parts.some(Number.isNaN)) {
            return "00:00";
        }

        // HH:MM:SS
        if (parts.length === 3) {

            const hours = parts[0];
            const minutes = parts[1];
            const seconds = parts[2];

            if (hours > 0) {
                return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
            }

            return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }

        // MM:SS
        if (parts.length === 2) {

            return `${String(parts[0]).padStart(2, "0")}:${String(parts[1]).padStart(2, "0")}`;

        }

    }

    // Если API когда-нибудь отдаст количество секунд
    const secondsTotal = Number(value);

    if (!Number.isFinite(secondsTotal) || secondsTotal < 0) {
        return "00:00";
    }

    const hours = Math.floor(secondsTotal / 3600);
    const minutes = Math.floor((secondsTotal % 3600) / 60);
    const seconds = Math.floor(secondsTotal % 60);

    if (hours > 0) {

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
