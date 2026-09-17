// ============================================================
// PROJECT NAVIGATION
// ============================================================

const projectButtons = document.querySelectorAll(
    ".menu-item[data-page]"
);


// Названия страниц

const PAGE_NAMES = {
    all: "Яндекс Недвижимость",
    barsa: "Барса",
    stolitsyno: "Столицыно"
};


// Фоны проектов

const PROJECT_BACKGROUNDS = {
    barsa: "https://feed.tw1.ru/Tochno_Arbitrage/Barsa_render.jpg",
    stolitsyno: "https://feed.tw1.ru/Tochno_Arbitrage/Stolicyno_render.jpg"
};


// Текущая страница

let currentPage = "all";


// Обработка клика по проекту

projectButtons.forEach(button => {

    button.addEventListener("click", () => {

        const page = button.dataset.page;

        openProject(page);

    });

});


// Открытие проекта

function openProject(page) {

    currentPage = page;


    // Убираем active у всех пунктов

    projectButtons.forEach(button => {

        button.classList.remove("active");

    });


    // Добавляем active выбранному

    const activeButton = document.querySelector(
        `.menu-item[data-page="${page}"]`
    );

    if (activeButton) {

        activeButton.classList.add("active");

    }


    // Меняем заголовок

    const title = document.getElementById("page-title");

    if (title) {

        title.textContent =
            PAGE_NAMES[page] || "Яндекс Недвижимость";

    }


    // Меняем фон проекта

    if (page === "all") {

        document.body.classList.remove("project-page");

        document.body.style.removeProperty("--project-bg");

    } else {

        document.body.classList.add("project-page");

        document.body.style.setProperty(
            "--project-bg",
            `url("${PROJECT_BACKGROUNDS[page]}")`
        );

    }


    // Обновляем данные

    if (typeof renderDashboard === "function") {

        renderDashboard();

    }

}