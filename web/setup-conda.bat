@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo  川崎鬼ごっこ2 - 初回セットアップ
echo  （Anaconda Prompt から実行してください）
echo ========================================
echo.

conda env list | findstr /C:"kawasaki-story" >nul
if errorlevel 1 (
  echo [1/3] conda 環境を作成しています...
  conda env create -f environment.yml
  if errorlevel 1 (
    echo.
    echo エラー: 環境の作成に失敗しました。
    pause
    exit /b 1
  )
) else (
  echo [1/3] conda 環境 kawasaki-story は既に存在します（スキップ）
)

echo.
echo [2/3] 環境を有効化しています...
call conda activate kawasaki-story
if errorlevel 1 (
  echo エラー: conda activate に失敗しました。Anaconda Prompt で実行してください。
  pause
  exit /b 1
)

echo.
echo [3/3] npm パッケージをインストールしています...
call npm install
if errorlevel 1 (
  echo エラー: npm install に失敗しました。
  pause
  exit /b 1
)

echo.
echo ========================================
echo  セットアップ完了！
echo  次回からは run-dev.bat を実行してください。
echo  ゲームURL: http://localhost:3000/play
echo ========================================
pause
