@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo  野球成績記録 - 開発サーバー起動
echo ========================================
echo.

if not exist node_modules (
  echo node_modules が見つかりません。npm install を実行します...
  call npm install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)

echo.
echo 起動中... ブラウザで次の URL を開いてください:
echo.
echo   http://localhost:5173/
echo.
echo 終了するには Ctrl+C を押してください。
echo ========================================
echo.

call npm run dev
