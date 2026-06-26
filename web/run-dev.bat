@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo  恋愛シミュレーションゲーム - 開発サーバー起動
echo  （Anaconda Prompt から実行してください）
echo ========================================
echo.

conda env list | findstr /C:"kawasaki-story" >nul
if errorlevel 1 (
  echo 環境が未作成です。先に setup-conda.bat を実行してください。
  pause
  exit /b 1
)

call conda activate kawasaki-story
if errorlevel 1 (
  echo エラー: conda activate に失敗しました。Anaconda Prompt で実行してください。
  pause
  exit /b 1
)

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
echo   恋愛ストーリー: http://localhost:3000/story
echo   トップページ:   http://localhost:3000/
echo   ゲーム画面:     http://localhost:3000/play
echo.
echo 終了するには Ctrl+C を押してください。
echo ========================================
echo.

call npm run dev
