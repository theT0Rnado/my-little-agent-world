@echo off
chcp 65001 >nul

REM Установка переменных окружения для БД
set "DB_USERNAME=program"
set "DB_PASSWORD=yellow-granny-troll-boom"

echo ========================================
echo 🚀 Запуск My Little Agent World
echo ========================================
echo.

REM Проверка PostgreSQL
echo [1/9] Проверка PostgreSQL...
sc query postgresql-x64-18 | find "RUNNING" >nul
if errorlevel 1 (
    echo ❌ PostgreSQL не запущен! Запускаю...
    net start postgresql-x64-18
    if errorlevel 1 (
        echo.
        echo ❌ ОШИБКА: Не удалось запустить PostgreSQL!
        echo Запустите этот скрипт от имени администратора
        echo Или запустите вручную: start-postgresql.bat
        echo.
        pause
        exit /b 1
    )
    echo ⏳ Ждём инициализации PostgreSQL...
    timeout /t 10 /nobreak >nul
) else (
    echo ✅ PostgreSQL уже запущен
)
echo.

REM Проверка RabbitMQ
echo [2/9] Проверка RabbitMQ...
sc query RabbitMQ | find "RUNNING" >nul
if errorlevel 1 (
    echo ❌ RabbitMQ не запущен! Запускаю...
    net start RabbitMQ
    if errorlevel 1 (
        echo.
        echo ❌ ОШИБКА: Не удалось запустить RabbitMQ!
        echo Запустите этот скрипт от имени администратора
        echo.
        pause
        exit /b 1
    )
    echo ⏳ Ждём инициализации RabbitMQ...
    timeout /t 10 /nobreak >nul
) else (
    echo ✅ RabbitMQ уже запущен
)
echo.

REM Ждём 5 секунд для инициализации
echo ⏳ Ждём инициализации сервисов...
timeout /t 5 /nobreak >nul
echo.

REM Запуск Config Server
echo [3/9] Запуск Config Server (порт 8888)...
start "Config Server" cmd /k "set "DB_USERNAME=program" && set "DB_PASSWORD=yellow-granny-troll-boom" && cd /d %~dp0config-server && mvnw.cmd spring-boot:run"
timeout /t 15 /nobreak >nul
echo.

REM Запуск Service Discovery
echo [4/9] Запуск Service Discovery (порт 8761)...
start "Service Discovery" cmd /k "cd /d %~dp0service-discovery && mvnw.cmd spring-boot:run"
timeout /t 15 /nobreak >nul
echo.

REM Запуск API Gateway
echo [5/9] Запуск API Gateway (порт 8080)...
start "API Gateway" cmd /k "cd /d %~dp0api-gateway && mvnw.cmd spring-boot:run"
timeout /t 15 /nobreak >nul
echo.

REM Запуск Agent Service
echo [6/9] Запуск Agent Service (порт 8081)...
start "Agent Service" cmd /k "set "DB_USERNAME=program" && set "DB_PASSWORD=yellow-granny-troll-boom" && cd /d %~dp0agent-service && mvnw.cmd spring-boot:run"
timeout /t 15 /nobreak >nul
echo.

REM Запуск World Service
echo [7/9] Запуск World Service (порт 8082)...
start "World Service" cmd /k "cd /d %~dp0world-service && mvnw.cmd spring-boot:run"
timeout /t 15 /nobreak >nul
echo.

REM Запуск AI Service
echo [8/11] Запуск AI Service (порт 8083)...
start "AI Service" cmd /k "cd /d %~dp0ai-service && call .venv\Scripts\activate.bat && uvicorn main:app --reload --host 0.0.0.0 --port 8083"
timeout /t 10 /nobreak >nul
echo.

REM Запуск Celery Worker
echo [9/11] Запуск Celery Worker...
start "Celery Worker" cmd /k "cd /d %~dp0ai-service && call .venv\Scripts\activate.bat && celery -A celery_app worker --loglevel=info --pool=solo"
timeout /t 5 /nobreak >nul
echo.

REM Запуск Celery Beat
echo [10/11] Запуск Celery Beat (Scheduler)...
start "Celery Beat" cmd /k "cd /d %~dp0ai-service && call .venv\Scripts\activate.bat && celery -A celery_app beat --loglevel=info"
timeout /t 5 /nobreak >nul
echo.

REM Запуск Frontend
echo [11/11] Запуск Frontend (порт 5173)...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.

echo ========================================
echo ✅ Все сервисы запущены!
echo ========================================
echo.
echo 📊 Открываю панели мониторинга...
timeout /t 5 /nobreak >nul

REM Открыть браузер с нужными страницами
start http://localhost:8761
timeout /t 2 /nobreak >nul
start http://localhost:15672
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo 🌐 Открыты страницы:
echo   - Eureka Dashboard: http://localhost:8761
echo   - RabbitMQ Management: http://localhost:15672 (guest/guest)
echo   - Frontend: http://localhost:5173
echo.
echo 📝 Логи каждого сервиса в отдельных окнах
echo.
echo ⚠️  Для остановки всех сервисов запустите: stop-all.bat
echo.
pause
