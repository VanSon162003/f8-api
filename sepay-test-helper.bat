@echo off
REM Sepay Testing Helper Script for Windows
REM Usage: sepay-test-helper.bat [command]

setlocal enabledelayedexpansion

REM Colors (using ANSI escape codes)
set "GREEN=[0;32m"
set "BLUE=[0;34m"
set "YELLOW=[1;33m"
set "RED=[0;31m"
set "NC=[0m"

REM Database credentials
set "DB_USER=root"
set "DB_NAME=f8_dev"
set "DB_HOST=127.0.0.1"

echo [32m========================================[0m
echo [32m     SEPAY TESTING HELPER (Windows)[0m
echo [32m========================================[0m
echo.

if "%1"=="" goto help
if "%1"=="pretest" goto pretest
if "%1"=="users" goto users
if "%1"=="courses" goto courses
if "%1"=="payments" goto payments
if "%1"=="complete" goto complete
if "%1"=="cleanup" goto cleanup
if "%1"=="api-test" goto api_test
if "%1"=="help" goto help

:help
cls
echo [34m========== SEPAY TESTING HELPER ==========[0m
echo.
echo [33mUsage: sepay-test-helper.bat [command][0m
echo.
echo [33mCommands:[0m
echo   pretest              Run all pre-test checks
echo   users                Show available test users
echo   courses              Show available pro courses
echo   payments             Show recent payment records
echo   complete [id]        Mark payment as completed
echo   cleanup              Delete test data
echo   api-test             Test API endpoints
echo   help                 Show this help message
echo.
echo [33mExamples:[0m
echo   sepay-test-helper.bat pretest
echo   sepay-test-helper.bat courses
echo   sepay-test-helper.bat complete 1
echo   sepay-test-helper.bat payments
echo.
goto end

:pretest
cls
echo [34m========== PRE-TEST CHECKS ==========[0m
echo.
echo [33m1. Testing Backend Connectivity...[0m
timeout /t 1 /nobreak > nul
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/courses' -UseBasicParsing; echo '[32m^+OK Backend running on http://localhost:3000[0m' } catch { echo '[31m^-ERROR Backend not responding[0m'; echo 'Start backend with: cd f8-api ^&^& npm start' }"
echo.
echo [33m2. Checking Database Connection...[0m
mysql -u %DB_USER% %DB_NAME% -e "SELECT 1;" > nul 2>&1
if %errorlevel% equ 0 (
    echo [32m^+OK Database connected[0m
) else (
    echo [31m^-ERROR Database connection failed[0m
    exit /b 1
)
echo.
echo [32m========== All checks passed! ==========[0m
goto end

:users
cls
echo [34m========== TEST USERS ==========[0m
echo.
mysql -u %DB_USER% %DB_NAME% -e "SELECT id, email, name FROM users LIMIT 5;"
echo.
goto end

:courses
cls
echo [34m========== PRO COURSES ==========[0m
echo.
mysql -u %DB_USER% %DB_NAME% -e "SELECT id, title, price, slug, is_pro FROM courses WHERE is_pro = 1 LIMIT 5;"
echo.
goto end

:payments
cls
echo [34m========== RECENT PAYMENTS ==========[0m
echo.
mysql -u %DB_USER% %DB_NAME% -e "SELECT id, user_id, course_id, amount, status, payment_method, reference_code, created_at FROM payments ORDER BY created_at DESC LIMIT 5;"
echo.
goto end

:complete
cls
if "%2"=="" (
    echo [31m^-ERROR: Please provide payment ID[0m
    echo Usage: sepay-test-helper.bat complete [payment_id]
    goto end
)

echo [34m========== MARKING PAYMENT AS COMPLETED ==========[0m
echo.

REM Check if payment exists
for /f %%i in ('mysql -u %DB_USER% %DB_NAME% -se "SELECT id FROM payments WHERE id = %2;"') do set PAYMENT_ID=%%i

if "%PAYMENT_ID%"=="" (
    echo [31m^-ERROR: Payment ID %2 not found[0m
    goto end
)

REM Update payment status
mysql -u %DB_USER% %DB_NAME% -e "UPDATE payments SET status = 'completed', sepay_transaction_id = 'TEST_TXN_%2' WHERE id = %2;"

echo [32m^+OK Payment %2 marked as completed[0m
echo.
mysql -u %DB_USER% %DB_NAME% -e "SELECT id, user_id, course_id, status, reference_code, created_at FROM payments WHERE id = %2;"
echo.
goto end

:cleanup
cls
echo [34m========== CLEANUP TEST DATA ==========[0m
echo.
set /p USER_ID="Enter user ID to clean (or press Enter to skip): "

if not "%USER_ID%"=="" (
    mysql -u %DB_USER% %DB_NAME% -e "DELETE FROM user_courses WHERE user_id = %USER_ID% AND course_id IN (SELECT course_id FROM payments WHERE user_id = %USER_ID%);"
    mysql -u %DB_USER% %DB_NAME% -e "DELETE FROM payments WHERE user_id = %USER_ID%;"
    echo [32m^+OK Cleaned up test data for user %USER_ID%[0m
)
echo.
goto end

:api_test
cls
echo [34m========== API TESTS ==========[0m
echo.
echo [33m1. Testing GET /api/courses[0m
powershell -Command "Invoke-RestMethod -Uri 'http://localhost:3000/api/courses' | ConvertTo-Json | head -20"
echo.
echo [33m2. Checking if migration applied[0m
mysql -u %DB_USER% %DB_NAME% -e "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'payments' AND COLUMN_NAME IN ('reference_code', 'qr_code', 'payment_method', 'sepay_transaction_id') ORDER BY COLUMN_NAME;"
echo.
goto end

:end
endlocal
