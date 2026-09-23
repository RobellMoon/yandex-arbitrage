async function loadCallsFromAPI(fromDate, toDate) {
    const url =
        `/api/yandex/calls?from_date=${encodeURIComponent(fromDate)}&to_date=${encodeURIComponent(toDate)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
    }

    const data = await response.json();

    return (data.calls || []).map(call => ({
        id: String(call.id),
        date: call.timestamp ? call.timestamp.slice(0, 10) : "",
        time: call.timestamp ? call.timestamp.slice(11, 16) : "",

        project: call.projectName || call.projectKey || "",

        phone: call.incomingPhone || "—",

        waitDuration: Number(call.waitDuration) || 0,
        callDuration: Number(call.callDuration) || 0,

        cost: Number(call.currentRevenue) || 0,

        status: mapAPIStatus(call.displayStatus),

        objectName: call.objectName || "",
        objectType: call.objectType || "",

        incomingPhone: call.incomingPhone || "",
        internalPhone: call.internalPhone || "",

        campaignTariff: Number(call.campaignTariff) || 0,
        clientTariff: Number(call.clientTariff) || 0,

        originalRevenue: Number(call.originalRevenue) || 0,
        currentRevenue: Number(call.currentRevenue) || 0,

        yandexComplaintStatus:
            call.yandexComplaintStatus || null,

        yandexRefundAmount:
            Number(call.yandexRefundAmount) || 0
    }));
}


function mapAPIStatus(status) {
    switch (status) {
        case "qualified":
            return "qualified";

        case "pending":
            return "disputed";

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
