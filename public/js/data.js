// ============================================================
// TEST DATA
// Временные данные для разработки интерфейса.
// Позже этот файл будет заменён данными из API.
// ============================================================


const CALLS = [

    {
        id: "YND-00001",
        date: "2026-09-17",
        time: "09:42",

        project: "Барса",

        phone: "+7 900 ***-12-41",

        waitDuration: 18,
        callDuration: 164,

        cost: 15400,

        status: "qualified",

        objectName: "ЖК Барса",
        objectType: "Квартира",

        incomingPhone: "+7 900 ***-12-41",
        internalPhone: "+7 861 ***-22-11",

        campaignTariff: 15400,
        clientTariff: 15400
    },


    {
        id: "YND-00002",
        date: "2026-09-17",
        time: "10:15",

        project: "Столицыно",

        phone: "+7 901 ***-45-72",

        waitDuration: 9,
        callDuration: 247,

        cost: 12300,

        status: "qualified",

        objectName: "ЖК Столицыно",
        objectType: "Квартира",

        incomingPhone: "+7 901 ***-45-72",
        internalPhone: "+7 861 ***-31-15",

        campaignTariff: 12300,
        clientTariff: 12300
    },


    {
        id: "YND-00003",
        date: "2026-09-17",
        time: "11:31",

        project: "Барса",

        phone: "+7 902 ***-73-18",

        waitDuration: 4,
        callDuration: 41,

        cost: 15400,

        status: "disputed",

        objectName: "ЖК Барса",
        objectType: "Квартира",

        incomingPhone: "+7 902 ***-73-18",
        internalPhone: "+7 861 ***-22-11",

        campaignTariff: 15400,
        clientTariff: 15400
    },


    {
        id: "YND-00004",
        date: "2026-09-16",
        time: "09:18",

        project: "Барса",

        phone: "+7 903 ***-91-33",

        waitDuration: 23,
        callDuration: 318,

        cost: 15400,

        status: "qualified",

        objectName: "ЖК Барса",
        objectType: "Квартира",

        incomingPhone: "+7 903 ***-91-33",
        internalPhone: "+7 861 ***-22-11",

        campaignTariff: 15400,
        clientTariff: 15400
    },


    {
        id: "YND-00005",
        date: "2026-09-16",
        time: "12:47",

        project: "Столицыно",

        phone: "+7 904 ***-27-64",

        waitDuration: 12,
        callDuration: 192,

        cost: 12300,

        status: "returned",

        objectName: "ЖК Столицыно",
        objectType: "Квартира",

        incomingPhone: "+7 904 ***-27-64",
        internalPhone: "+7 861 ***-31-15",

        campaignTariff: 12300,
        clientTariff: 12300
    },


    {
        id: "YND-00006",
        date: "2026-09-16",
        time: "15:03",

        project: "Барса",

        phone: "+7 905 ***-48-21",

        waitDuration: 31,
        callDuration: 403,

        cost: 15400,

        status: "qualified",

        objectName: "ЖК Барса",
        objectType: "Квартира",

        incomingPhone: "+7 905 ***-48-21",
        internalPhone: "+7 861 ***-22-11",

        campaignTariff: 15400,
        clientTariff: 15400
    },


    {
        id: "YND-00007",
        date: "2026-09-15",
        time: "10:22",

        project: "Столицыно",

        phone: "+7 906 ***-55-17",

        waitDuration: 7,
        callDuration: 128,

        cost: 12300,

        status: "qualified",

        objectName: "ЖК Столицыно",
        objectType: "Квартира",

        incomingPhone: "+7 906 ***-55-17",
        internalPhone: "+7 861 ***-31-15",

        campaignTariff: 12300,
        clientTariff: 12300
    },


    {
        id: "YND-00008",
        date: "2026-09-15",
        time: "13:41",

        project: "Барса",

        phone: "+7 907 ***-62-88",

        waitDuration: 16,
        callDuration: 276,

        cost: 15400,

        status: "disputed",

        objectName: "ЖК Барса",
        objectType: "Квартира",

        incomingPhone: "+7 907 ***-62-88",
        internalPhone: "+7 861 ***-22-11",

        campaignTariff: 15400,
        clientTariff: 15400
    },


    {
        id: "YND-00009",
        date: "2026-09-14",
        time: "11:05",

        project: "Барса",

        phone: "+7 908 ***-34-09",

        waitDuration: 19,
        callDuration: 221,

        cost: 15400,

        status: "qualified",

        objectName: "ЖК Барса",
        objectType: "Квартира",

        incomingPhone: "+7 908 ***-34-09",
        internalPhone: "+7 861 ***-22-11",

        campaignTariff: 15400,
        clientTariff: 15400
    },


    {
        id: "YND-00010",
        date: "2026-09-14",
        time: "16:28",

        project: "Столицыно",

        phone: "+7 909 ***-76-52",

        waitDuration: 11,
        callDuration: 156,

        cost: 12300,

        status: "returned",

        objectName: "ЖК Столицыно",
        objectType: "Квартира",

        incomingPhone: "+7 909 ***-76-52",
        internalPhone: "+7 861 ***-31-15",

        campaignTariff: 12300,
        clientTariff: 12300
    },


    {
        id: "YND-00011",
        date: "2026-09-13",
        time: "09:52",

        project: "Барса",

        phone: "+7 910 ***-14-83",

        waitDuration: 26,
        callDuration: 351,

        cost: 15400,

        status: "qualified",

        objectName: "ЖК Барса",
        objectType: "Квартира",

        incomingPhone: "+7 910 ***-14-83",
        internalPhone: "+7 861 ***-22-11",

        campaignTariff: 15400,
        clientTariff: 15400
    },


    {
        id: "YND-00012",
        date: "2026-09-13",
        time: "14:16",

        project: "Столицыно",

        phone: "+7 911 ***-37-91",

        waitDuration: 5,
        callDuration: 67,

        cost: 12300,

        status: "disputed",

        objectName: "ЖК Столицыно",
        objectType: "Квартира",

        incomingPhone: "+7 911 ***-37-91",
        internalPhone: "+7 861 ***-31-15",

        campaignTariff: 12300,
        clientTariff: 12300
    }

];


// ============================================================
// PROJECTS
// ============================================================

const PROJECTS = [

    {
        id: "barsa",
        name: "Барса",
        active: true,
        cost: 15400
    },

    {
        id: "stolitsyno",
        name: "Столицыно",
        active: true,
        cost: 12300
    },

    {
        id: "patriki",
        name: "Патрики",
        active: false
    },

    {
        id: "rodnye-prostory",
        name: "Родные просторы",
        active: false
    },

    {
        id: "pervoe-mesto",
        name: "Первое место",
        active: false
    },

    {
        id: "svetskiy-les",
        name: "Светский лес",
        active: false
    },

    {
        id: "hozya-in-morey",
        name: "Хозяин Морей",
        active: false
    },

    {
        id: "royalta",
        name: "Роялта",
        active: false
    },

    {
        id: "tsvetnoy-bulvar",
        name: "Цветной бульвар",
        active: false
    },

    {
        id: "sober-bash",
        name: "Собер-Баш курорт",
        active: false
    },

    {
        id: "vasilevskiy-ostrov",
        name: "Васильевский Остров",
        active: false
    },

    {
        id: "kaderle",
        name: "Кадерле",
        active: false
    },

    {
        id: "art",
        name: "Арт",
        active: false
    }

];


// ============================================================
// STATUS NAMES
// ============================================================

const STATUS_NAMES = {

    qualified: "Квалифицирован",

    disputed: "Оспорен",

    returned: "Возвращено",

    rejected: "Отклонено"

};


// ============================================================
// HELPERS
// ============================================================

function getProjectName(projectId) {

    const project = PROJECTS.find(
        item => item.id === projectId
    );

    return project ? project.name : projectId;
}


function formatMoney(value) {

    return new Intl.NumberFormat("ru-RU").format(value) + " ₽";

}


function formatDuration(seconds) {

    if (!seconds) {
        return "—";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;

}