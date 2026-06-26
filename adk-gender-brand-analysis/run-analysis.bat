@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"

echo ============================================================
echo ADK 性別 x ラグジュアリーブランド分析
echo ============================================================
echo.
echo 作業ディレクトリ: %CD%
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo [エラー] Python が見つかりません。
    echo Python 3 をインストールし、PATH に追加してください。
    echo https://www.python.org/downloads/
    pause
    exit /b 1
)

echo 依存パッケージを確認しています...
python -c "import pandas, scipy" >nul 2>&1
if errorlevel 1 (
    echo pandas / scipy をインストールします...
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [エラー] パッケージのインストールに失敗しました。
        pause
        exit /b 1
    )
)

echo CSVが未配置の場合はファイル選択ダイアログが表示されます。
echo.
python analyze_gender_brand.py
set EXIT_CODE=%ERRORLEVEL%

echo.
if %EXIT_CODE% neq 0 (
    echo 処理がエラーで終了しました（終了コード: %EXIT_CODE%）
) else (
    echo 処理が正常に完了しました。
)

pause
exit /b %EXIT_CODE%
