import os
import json
import sqlite3
from datetime import datetime, date
from typing import Optional

import requests
from fastapi import FastAPI, HTTPException, Query, Request, Form
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv


# ============================================================
# CONFIG
# ============================================================

load_dotenv()

YANDEX_API_URL = "https://api.realty.yandex.net/2.0/publicPartner/calls"

YANDEX_OAUTH_TOKEN = os.getenv("YANDEX_OAUTH_TOKEN")
YANDEX_X_AUTHORIZATION = os.getenv("YANDEX_X_AUTHORIZATION")

DB_PATH = os.getenv(
    "DATABASE_PATH",
    "/app/data/arbitrage.db"
)

AUTH_LOGIN = os.getenv("AUTH_LOGIN")
AUTH_PASSWORD = os.getenv("AUTH_PASSWORD")
SESSION_SECRET = os.getenv("SESSION_SECRET")

# ============================================================
# PROJECTS
# ============================================================

PROJECTS = {
    "barsa": {
        "key": "barsa",
        "name": "Барса",
        "client_id": "109207081",
        "agency_id": "472729",
        "object_id": "3826204",
    },
    "stolitsyno": {
        "key": "stolitsyno",
        "name": "Столицыно",
        "client_id": "109207139",
        "agency_id": "472729",
        "object_id": "4065490",
    },
}


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="Yandex Arbitrage",
    version="1.0.0"
)

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    session_cookie="arbitrage_session",
    max_age=60 * 60 * 24 * 30,
    https_only=True,
    same_site="lax",
)

# ============================================================
# AUTHORIZATION
# ============================================================

sessions = set()


def is_authenticated(request: Request) -> bool:
    session_id = request.cookies.get("session_id")

    if not session_id:
        return False

    return session_id in sessions

# ============================================================
# LOGIN
# ============================================================

@app.get("/login", response_class=HTMLResponse)
def login_page():
    return """
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Вход — Yandex Arbitrage</title>
        <style>
            body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
            }

            .login-wrapper {
    width: 424px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.login-logo {
    width: 150px;
    height: auto;
    display: block;
    margin: 0 auto 25px auto;
}

            .login-box {
                width: 360px;
                padding: 32px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,.08);
                text-align: center;
            }

            h1 {
                margin: 0 0 24px;
                font-size: 24px;
            }

            input {
                width: 100%;
                box-sizing: border-box;
                padding: 13px;
                margin-bottom: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 15px;
            }

            button {
                width: 100%;
                padding: 13px;
                border: 0;
                border-radius: 8px;
                background: #111;
                color: white;
                font-size: 15px;
                cursor: pointer;
            }

            .error {
                color: #d00;
                margin-bottom: 12px;
                font-size: 14px;
            }
        </style>
    </head>

    <body>
    <div class="login-wrapper">

        <img
            src="https://feed.tw1.ru/Tochno_Arbitrage/tochno-favicon.png"
            class="login-logo"
            alt="ТОЧНО"
        >

        <div class="login-box">
            <h1>ТОЧНО Арбитраж</h1>

    <form method="post" action="/login">
                <input
                    type="text"
                    name="login"
                    placeholder="Логин"
                    required
                >

                <input
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    required
                >

                <button type="submit">
                    Войти
                </button>
            </form>
        </div>
    </body>
    </html>
    """


@app.post("/login")
def login(
    login: str = Form(...),
    password: str = Form(...)
):
    if (
        login != AUTH_LOGIN
        or password != AUTH_PASSWORD
    ):
        raise HTTPException(
            status_code=401,
            detail="Неверный логин или пароль"
        )

    import secrets

    session_id = secrets.token_urlsafe(32)
    sessions.add(session_id)

    response = RedirectResponse(
        url="/",
        status_code=303
    )

    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        samesite="lax"
    )

    return response



# ============================================================
# DATABASE
# ============================================================

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    return conn


def add_column_if_missing(
    conn,
    table_name: str,
    column_name: str,
    column_type: str
):
    columns = conn.execute(
        f"PRAGMA table_info({table_name})"
    ).fetchall()

    existing = {
        row["name"]
        for row in columns
    }

    if column_name not in existing:
        conn.execute(
            f"""
            ALTER TABLE {table_name}
            ADD COLUMN {column_name} {column_type}
            """
        )


def init_db():
    conn = get_connection()

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS calls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            call_key TEXT NOT NULL UNIQUE,

            project_key TEXT NOT NULL,
            project_name TEXT NOT NULL,

            timestamp TEXT,

            incoming_phone TEXT,
            internal_phone TEXT,

            wait_duration TEXT,
            call_duration TEXT,

            object_name TEXT,
            object_type TEXT,

            campaign_tariff TEXT,
            client_tariff TEXT,

            original_revenue INTEGER NOT NULL DEFAULT 0,
            current_revenue INTEGER NOT NULL DEFAULT 0,

            dispute_status TEXT NOT NULL DEFAULT 'none',

            developer_comment TEXT,

            dispute_created_at TEXT,
            dispute_updated_at TEXT,

            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # Дополнительные поля для статусов арбитража,
    # которые приходят от Яндекса через API.
    add_column_if_missing(
        conn,
        "calls",
        "yandex_complaint_status",
        "TEXT"
    )

    add_column_if_missing(
        conn,
        "calls",
        "yandex_refund_amount",
        "INTEGER DEFAULT 0"
    )

    # Когда звонок попал в Excel на отправку Яндексу.
    add_column_if_missing(
        conn,
        "calls",
        "dispute_exported_at",
        "TEXT"
    )

    # Идентификатор партии Excel.
    add_column_if_missing(
        conn,
        "calls",
        "dispute_batch_id",
        "TEXT"
    )

    conn.commit()
    conn.close()


init_db()


# ============================================================
# HELPERS
# ============================================================

def get_yandex_headers():
    headers = {
        "accept": "application/json",
    }

    if YANDEX_OAUTH_TOKEN:
        headers["Authorization"] = (
            f"OAuth {YANDEX_OAUTH_TOKEN}"
        )

    if YANDEX_X_AUTHORIZATION:
        headers["X-Authorization"] = (
            YANDEX_X_AUTHORIZATION
        )

    return headers


def parse_revenue(value) -> int:
    """
    revenue от Яндекса может прийти числом,
    строкой или null.
    """

    if value is None:
        return 0

    try:
        return int(float(value))
    except (TypeError, ValueError):
        return 0


def normalize_complaint(complaint):
    """
    Приводим complaint к понятной структуре.

    Если complaint отсутствует — возвращаем None.
    """

    if not complaint:
        return None

    if isinstance(complaint, dict):
        return complaint

    return None


def build_call_key(project_key: str, call: dict) -> str:
    """
    Формируем стабильный ключ звонка.

    Если у Яндекса есть id — используем его.
    Иначе собираем ключ из основных полей.
    """

    call_id = (
        call.get("id")
        or call.get("callId")
        or call.get("uuid")
    )

    if call_id:
        return f"{project_key}:{call_id}"

    timestamp = call.get("timestamp", "")
    incoming_phone = call.get("incomingPhone", "")
    internal_phone = call.get("internalPhone", "")

    return (
        f"{project_key}:"
        f"{timestamp}:"
        f"{incoming_phone}:"
        f"{internal_phone}"
    )


def get_complaint_status(complaint):
    if not complaint:
        return None

    return (
        complaint.get("status")
        or complaint.get("state")
    )


def get_refund_amount(complaint):
    if not complaint:
        return 0

    return parse_revenue(
        complaint.get("refundAmount")
    )


# ============================================================
# SAVE CALLS
# ============================================================

def save_calls_to_db(
    project_key: str,
    calls: list
):
    project = PROJECTS[project_key]

    conn = get_connection()

    for call in calls:

        call_key = build_call_key(
            project_key,
            call
        )

        timestamp = call.get("timestamp")

        incoming_phone = call.get(
            "incomingPhone"
        )

        internal_phone = call.get(
            "internalPhone"
        )

        wait_duration = call.get(
            "waitDuration"
        )

        call_duration = call.get(
            "callDuration"
        )

        object_name = call.get(
            "objectName"
        )

        object_type = call.get(
            "objectType"
        )

        campaign_tariff = call.get(
            "campaignTariff"
        )

        client_tariff = call.get(
            "clientTariff"
        )

        current_revenue = parse_revenue(
            call.get("revenue")
        )

        complaint = normalize_complaint(
            call.get("complaint")
        )

        complaint_status = get_complaint_status(
            complaint
        )

        refund_amount = get_refund_amount(
            complaint
        )

        # ----------------------------------------------------
        # Проверяем, существует ли звонок
        # ----------------------------------------------------

        existing = conn.execute(
            """
            SELECT *
            FROM calls
            WHERE call_key = ?
            """,
            (call_key,)
        ).fetchone()

        if existing is None:

            # ВАЖНО:
            # original_revenue сохраняем только при первом
            # появлении звонка.
            #
            # Это позволяет потом понять,
            # сколько звонок стоил изначально,
            # даже если Яндекс вернул revenue = 0.

            conn.execute(
                """
                INSERT INTO calls (
                    call_key,
                    project_key,
                    project_name,
                    timestamp,
                    incoming_phone,
                    internal_phone,
                    wait_duration,
                    call_duration,
                    object_name,
                    object_type,
                    campaign_tariff,
                    client_tariff,
                    original_revenue,
                    current_revenue,
                    dispute_status,
                    yandex_complaint_status,
                    yandex_refund_amount,
                    updated_at
                )
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, 'none', ?, ?, CURRENT_TIMESTAMP
                )
                """,
                (
                    call_key,
                    project_key,
                    project["name"],
                    timestamp,
                    incoming_phone,
                    internal_phone,
                    wait_duration,
                    call_duration,
                    object_name,
                    object_type,
                    campaign_tariff,
                    client_tariff,
                    current_revenue,
                    current_revenue,
                    complaint_status,
                    refund_amount,
                )
            )

        else:

            # ------------------------------------------------
            # Существующий звонок
            # ------------------------------------------------
            #
            # original_revenue НЕ трогаем.
            #
            # Обновляем только текущее revenue.
            # Это важно для арбитража.
            #

            conn.execute(
                """
                UPDATE calls
                SET
                    project_name = ?,
                    timestamp = ?,
                    incoming_phone = ?,
                    internal_phone = ?,
                    wait_duration = ?,
                    call_duration = ?,
                    object_name = ?,
                    object_type = ?,
                    campaign_tariff = ?,
                    client_tariff = ?,
                    current_revenue = ?,
                    yandex_complaint_status = ?,
                    yandex_refund_amount = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE call_key = ?
                """,
                (
                    project["name"],
                    timestamp,
                    incoming_phone,
                    internal_phone,
                    wait_duration,
                    call_duration,
                    object_name,
                    object_type,
                    campaign_tariff,
                    client_tariff,
                    current_revenue,
                    complaint_status,
                    refund_amount,
                    call_key,
                )
            )

    conn.commit()
    conn.close()


# ============================================================
# DISPLAY STATUS
# ============================================================

def calculate_display_status(row):

    complaint_status = (
        row["yandex_complaint_status"]
    )

    dispute_status = (
        row["dispute_status"]
    )

    original_revenue = (
        row["original_revenue"] or 0
    )

    current_revenue = (
        row["current_revenue"] or 0
    )

    # --------------------------------------------------------
    # Яндекс подтвердил возврат
    # --------------------------------------------------------

    if complaint_status == "accepted":
        return "returned"

    # --------------------------------------------------------
    # Яндекс отклонил арбитраж
    # --------------------------------------------------------

    if complaint_status == "rejected":
        return "rejected"

    # --------------------------------------------------------
    # Яндекс рассматривает
    # --------------------------------------------------------

    if complaint_status in (
        "in_review",
        "pending",
        "review",
    ):
        return "pending"

    # --------------------------------------------------------
    # Наш внутренний статус:
    # звонок уже отправлен в арбитраж
    # --------------------------------------------------------

    if dispute_status == "pending":
        return "pending"

    # --------------------------------------------------------
    # Наши старые внутренние статусы
    # --------------------------------------------------------

    if dispute_status == "returned":
        return "returned"

    if dispute_status == "rejected":
        return "rejected"

    # --------------------------------------------------------
    # Обычный оплачиваемый звонок
    # --------------------------------------------------------

    if current_revenue > 0:
        return "qualified"

    # --------------------------------------------------------
    # revenue = 0 сам по себе НЕ означает возврат.
    #
    # Если арбитража не было — просто бесплатный звонок.
    # --------------------------------------------------------

    if original_revenue > 0:
        return "free"

    return "free"


# ============================================================
# SERIALIZE
# ============================================================

def serialize_call(row):

    status = calculate_display_status(row)

    return {
        "id": row["id"],
        "callKey": row["call_key"],

        "projectKey": row["project_key"],
        "projectName": row["project_name"],

        "timestamp": row["timestamp"],

        "incomingPhone": row["incoming_phone"],
        "internalPhone": row["internal_phone"],

        "waitDuration": row["wait_duration"],
        "callDuration": row["call_duration"],

        "objectName": row["object_name"],
        "objectType": row["object_type"],

        "campaignTariff": row["campaign_tariff"],
        "clientTariff": row["client_tariff"],

        # Самое важное:
        "originalRevenue": row["original_revenue"],
        "currentRevenue": row["current_revenue"],

        "disputeStatus": row["dispute_status"],
        "displayStatus": status,

        "developerComment": row["developer_comment"],

        "disputeCreatedAt": row["dispute_created_at"],
        "disputeUpdatedAt": row["dispute_updated_at"],
        "disputeExportedAt": row["dispute_exported_at"],
        "disputeBatchId": row["dispute_batch_id"],

        # Ответ Яндекса
        "yandexComplaintStatus": (
            row["yandex_complaint_status"]
        ),

        "yandexRefundAmount": (
            row["yandex_refund_amount"] or 0
        ),
    }


# ============================================================
# YANDEX API
# ============================================================

def fetch_project_calls(
    project_key: str,
    from_date: str,
    to_date: str
):

    if project_key not in PROJECTS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown project: {project_key}"
        )

    project = PROJECTS[project_key]

    all_calls = []

    page_num = 0
    page_size = 100

    while True:

        # ====================================================
        # ВАЖНОЕ ИСПРАВЛЕНИЕ
        #
        # Яндекс ожидает:
        # fromDate
        # toDate
        #
        # А НЕ:
        # dates
        # ====================================================

        params = {
            "clientId": project["client_id"],
            "agencyId": project["agency_id"],

            "fromDate": from_date,
            "toDate": to_date,

            "pageNum": page_num,
            "pageSize": page_size,
        }

        try:

            response = requests.get(
                YANDEX_API_URL,
                headers=get_yandex_headers(),
                params=params,
                timeout=60,
            )

        except requests.RequestException as e:

            raise HTTPException(
                status_code=502,
                detail=(
                    "Failed to connect to Yandex API: "
                    f"{str(e)}"
                )
            )

        if response.status_code != 200:

            try:
                error_data = response.json()
                error_text = json.dumps(
                    error_data,
                    ensure_ascii=False
                )
            except Exception:
                error_text = response.text

            raise HTTPException(
                status_code=502,
                detail=(
                    f"Yandex API returned "
                    f"{response.status_code}: "
                    f"{error_text}"
                )
            )

        try:
            data = response.json()

        except ValueError:

            raise HTTPException(
                status_code=502,
                detail=(
                    "Yandex API returned invalid JSON"
                )
            )

        # ----------------------------------------------------
        # В зависимости от ответа API список звонков может
        # лежать в calls.
        # ----------------------------------------------------

        calls = data.get("calls", [])

        if not isinstance(calls, list):
            calls = []

        all_calls.extend(calls)

        # ----------------------------------------------------
        # Определяем наличие следующей страницы.
        # ----------------------------------------------------

        if len(calls) < page_size:
            break

        page_num += 1

        # Защита от бесконечного цикла.
        if page_num > 1000:
            break

    # Сохраняем ВСЕ звонки, включая revenue = 0.
    save_calls_to_db(
        project_key,
        all_calls
    )

    return all_calls


# ============================================================
# API: ALL CALLS
# ============================================================

@app.get("/api/yandex/calls/{project_key}")
def get_project_calls(
    request: Request,
    project_key: str,
    from_date: str = Query(...),
    to_date: str = Query(...)
):
    if not is_authenticated(request):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )
    if not is_authenticated(request):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    # Синхронизируем оба проекта.
    for project_key in PROJECTS:

        fetch_project_calls(
            project_key,
            from_date,
            to_date
        )

    conn = get_connection()

    rows = conn.execute(
        """
        SELECT *
        FROM calls
        WHERE
            date(timestamp) >= date(?)
            AND date(timestamp) <= date(?)
        ORDER BY timestamp DESC
        """,
        (
            from_date,
            to_date,
        )
    ).fetchall()

    conn.close()

    calls = [
        serialize_call(row)
        for row in rows
    ]

    # ========================================================
    # СТАТИСТИКА
    # ========================================================

    total_calls = len(calls)

    total_expense = sum(
        call["currentRevenue"]
        for call in calls
        if call["currentRevenue"] > 0
    )

    pending_disputes = sum(
        1
        for call in calls
        if call["displayStatus"] == "pending"
    )

    returned_calls = sum(
        1
        for call in calls
        if call["displayStatus"] == "returned"
    )

    returned_amount = sum(
        (
            call["yandexRefundAmount"]
            or call["originalRevenue"]
        )
        for call in calls
        if call["displayStatus"] == "returned"
    )

    rejected_disputes = sum(
        1
        for call in calls
        if call["displayStatus"] == "rejected"
    )

    return {
        "fromDate": from_date,
        "toDate": to_date,

        "totalCalls": total_calls,

        "totalExpense": total_expense,

        "pendingDisputes": pending_disputes,

        "returnedCalls": returned_calls,
        "returnedAmount": returned_amount,

        "rejectedDisputes": rejected_disputes,

        "calls": calls,
    }


# ============================================================
# API: PROJECT CALLS
# ============================================================

@app.get("/api/yandex/calls/{project_key}")
def get_project_calls(
    request: Request,
    project_key: str,
    from_date: str = Query(...),
    to_date: str = Query(...)
):
    if not is_authenticated(request):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    if project_key not in PROJECTS:
        raise HTTPException(
            status_code=404,
            detail="Unknown project"
        )

    fetch_project_calls(
        project_key,
        from_date,
        to_date
    )

    conn = get_connection()

    rows = conn.execute(
        """
        SELECT *
        FROM calls
        WHERE
            project_key = ?
            AND date(timestamp) >= date(?)
            AND date(timestamp) <= date(?)
        ORDER BY timestamp DESC
        """,
        (
            project_key,
            from_date,
            to_date,
        )
    ).fetchall()

    conn.close()

    calls = [
        serialize_call(row)
        for row in rows
    ]

    total_expense = sum(
        call["currentRevenue"]
        for call in calls
        if call["currentRevenue"] > 0
    )

    pending_disputes = sum(
        1
        for call in calls
        if call["displayStatus"] == "pending"
    )

    returned_calls = sum(
        1
        for call in calls
        if call["displayStatus"] == "returned"
    )

    returned_amount = sum(
        (
            call["yandexRefundAmount"]
            or call["originalRevenue"]
        )
        for call in calls
        if call["displayStatus"] == "returned"
    )

    return {
        "project": PROJECTS[project_key]["name"],

        "fromDate": from_date,
        "toDate": to_date,

        "totalCalls": len(calls),
        "totalExpense": total_expense,

        "pendingDisputes": pending_disputes,

        "returnedCalls": returned_calls,
        "returnedAmount": returned_amount,

        "calls": calls,
    }


# ============================================================
# DEBUG YANDEX API
# ============================================================

@app.get("/api/debug/yandex/calls/{project_key}")
def debug_yandex_calls(
    request: Request,
    project_key: str
):

    if not is_authenticated(request):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    if project_key not in PROJECTS:
        raise HTTPException(
            status_code=404,
            detail="Unknown project"
        )

    project = PROJECTS[project_key]

    # Последние 30 дней.
    from datetime import timedelta

    today = date.today()
    start_date = today - timedelta(days=30)

    params = {
        "clientId": project["client_id"],
        "agencyId": project["agency_id"],

        # И здесь тоже fromDate / toDate.
        "fromDate": start_date.isoformat(),
        "toDate": today.isoformat(),

        "pageNum": 0,
        "pageSize": 100,
    }

    try:

        response = requests.get(
            YANDEX_API_URL,
            headers=get_yandex_headers(),
            params=params,
            timeout=60,
        )

    except requests.RequestException as e:

        raise HTTPException(
            status_code=502,
            detail=str(e)
        )

    try:
        data = response.json()
    except Exception:
        data = {
            "raw": response.text
        }

    return {
        "httpStatus": response.status_code,
        "project": project_key,
        "requestParams": {
            "clientId": project["client_id"],
            "agencyId": project["agency_id"],
            "fromDate": params["fromDate"],
            "toDate": params["toDate"],
            "pageNum": params["pageNum"],
            "pageSize": params["pageSize"],
        },
        "response": data,
    }


# ============================================================
# HEALTH
# ============================================================

@app.post("/api/yandex/calls/mark-pending")
def mark_calls_pending(
    request: Request,
    call_ids: list[int]
):
    if not is_authenticated(request):
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    if not call_ids:
        return {
            "success": True,
            "updated": 0
        }

    conn = get_connection()

    now = datetime.now().isoformat(
        timespec="seconds"
    )

    updated = 0

    for call_id in call_ids:

        cursor = conn.execute(
            """
            UPDATE calls
            SET
                dispute_status = 'pending',
                dispute_exported_at = ?,
                dispute_updated_at = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                now,
                now,
                call_id
            )
        )

        updated += cursor.rowcount

    conn.commit()
    conn.close()

    return {
        "success": True,
        "updated": updated
    }

@app.get("/api/health")
def health():

    return {
        "status": "ok",
        "service": "yandex-arbitrage",
        "database": DB_PATH,
        "projects": list(PROJECTS.keys()),
    }


# ============================================================
# FRONTEND
# ============================================================

# ============================================================
# LOGIN
# ============================================================

@app.get("/login")
def login_page():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Авторизация</title>
        <style>
            body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
            }

            .login-box {
                width: 320px;
                padding: 30px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,.08);
            }

            .login-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.login-logo {
    width: 150px;
    height: auto;
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 25px;
}

            h2 {
                margin: 0 0 24px;
            }

            input {
                box-sizing: border-box;
                width: 100%;
                padding: 12px;
                margin-bottom: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 14px;
            }

            button {
                width: 100%;
                padding: 12px;
                border: 0;
                border-radius: 8px;
                background: #111;
                color: white;
                cursor: pointer;
                font-size: 14px;
            }

            .error {
                color: #d00;
                margin-bottom: 12px;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="login-box">
            <h2>Вход</h2>

            <form method="post" action="/login">
                <input
                    type="text"
                    name="login"
                    placeholder="Логин"
                    required
                >

                <input
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    required
                >

                <button type="submit">
                    Войти
                </button>
            </form>
        </div>
    </div>
</body>
    </html>
    """)


@app.post("/login")
def login(
    request: Request,
    login: str = Form(...),
    password: str = Form(...)
):
    if (
        login != AUTH_LOGIN
        or password != AUTH_PASSWORD
    ):
        return HTMLResponse(
            """
            <h3>Неверный логин или пароль</h3>
            <a href="/login">Назад</a>
            """,
            status_code=401
        )

    session_id = os.urandom(32).hex()
    sessions.add(session_id)

    response = RedirectResponse(
        url="/",
        status_code=303
    )

    response.set_cookie(
        "session_id",
        session_id,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 30
    )

    return response

@app.get("/")
def index(request: Request):

    if not is_authenticated(request):
        return RedirectResponse(
            url="/login",
            status_code=303
        )

    index_path = "/app/public/index.html"

    if not os.path.exists(index_path):
        raise HTTPException(
            status_code=404,
            detail="Frontend not found"
        )

    return FileResponse(index_path)

# ============================================================
# STATIC FRONTEND
# ============================================================

app.mount(
    "/css",
    StaticFiles(directory="/app/public/css"),
    name="css"
)

app.mount(
    "/js",
    StaticFiles(directory="/app/public/js"),
    name="js"
)
