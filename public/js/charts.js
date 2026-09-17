// ============================================================
// CHARTS
// ============================================================

let callsChart = null;


// ============================================================
// MAIN CHART
// ============================================================

function renderCallsChart(dailyData, type = "calls") {

    const canvas = document.getElementById("calls-chart");

    if (!canvas) return;


    // Уничтожаем предыдущий график
    if (callsChart) {
        callsChart.destroy();
        callsChart = null;
    }


    const labels = dailyData.map(item =>
        formatChartDate(item.date)
    );


    const values = dailyData.map(item => {

        if (type === "expense") {
            return item.expense;
        }

        return item.calls;

    });


    const label =
        type === "expense"
            ? "Расходы"
            : "Звонки";


    const yAxisFormat =
        type === "expense"
            ? value => formatShortMoney(value)
            : value => value;


    callsChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [

                {
                    label: label,
                    data: values,

                    borderWidth: 2,
                    tension: 0.35,

                    pointRadius: 3,
                    pointHoverRadius: 5,

                    fill: true
                }

            ]

        },


        options: {

            responsive: true,
            maintainAspectRatio: false,


            interaction: {

                intersect: false,
                mode: "index"

            },


            plugins: {

                legend: {
                    display: false
                },


                tooltip: {

                    displayColors: false,

                    callbacks: {

                        label: function(context) {

                            const value =
                                context.parsed.y;


                            if (type === "expense") {

                                return (
                                    " " +
                                    formatMoney(value)
                                );

                            }


                            return (
                                " " +
                                value +
                                " звонков"
                            );

                        }

                    }

                }

            },


            scales: {

                x: {

                    grid: {
                        display: false
                    },

                    ticks: {

                        color: "#999ca3",

                        font: {
                            size: 10
                        }

                    }

                },


                y: {

                    beginAtZero: true,

                    grid: {
                        color: "#eeeeef"
                    },

                    border: {
                        display: false
                    },

                    ticks: {

                        color: "#999ca3",

                        font: {
                            size: 10
                        },

                        callback: yAxisFormat

                    }

                }

            }

        }

    });

}


// ============================================================
// DATE FORMAT FOR CHART
// ============================================================

function formatChartDate(dateString) {

    const date =
        new Date(`${dateString}T12:00:00`);


    return date.toLocaleDateString(

        "ru-RU",

        {
            day: "2-digit",
            month: "2-digit"
        }

    );

}


// ============================================================
// SHORT MONEY FORMAT
// ============================================================

function formatShortMoney(value) {

    if (value >= 1000000) {

        return (

            (value / 1000000)
                .toFixed(1)
                .replace(".0", "") +

            " млн"

        );

    }


    if (value >= 1000) {

        return (

            Math.round(value / 1000) +

            " тыс."

        );

    }


    return value + " ₽";

}