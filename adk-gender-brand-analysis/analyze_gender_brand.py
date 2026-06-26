"""
ADKデータ分析：性別（AAF1）とラグジュアリーブランド嗜好（CBAA_1）の関係
Windows環境でそのまま実行可能（CSV未配置時はファイル選択ダイアログを表示）
"""

import argparse
import shutil
import sys
from pathlib import Path

# Windows環境でも日本語が正しく表示されるようUTF-8出力に設定
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import pandas as pd
from scipy.stats import chi2_contingency

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
CSV_FILENAME = "gender&brand2019.csv"
CSV_PATH = SCRIPT_DIR / CSV_FILENAME
REQUIRED_COLUMNS = ["AAF1", "CBAA_1"]

GENDER_LABELS = {1: "男性", 2: "女性"}
ANSWER_LABELS = {
    1: "非常にあてはまる",
    2: "あてはまる",
    3: "あまりあてはまらない",
    4: "全くあてはまらない",
}
GENDER_ORDER = [1, 2]
ANSWER_ORDER = [1, 2, 3, 4]
GROUP_LABELS = {
    1: "好意層（非常にあてはまる＋あてはまる）",
    2: "非好意層（あまりあてはまらない＋全くあてはまらない）",
}
GROUP_ORDER = [1, 2]
FAVORABLE_ANSWERS = [1, 2]
UNFAVORABLE_ANSWERS = [3, 4]
ALPHA = 0.05


def print_section(title: str) -> None:
    print()
    print("=" * 60)
    print(title)
    print("=" * 60)


def show_environment() -> None:
    cwd = Path.cwd()
    print_section("環境情報")
    print(f"現在の作業ディレクトリ：{cwd}")
    print(f"プロジェクトフォルダ：{SCRIPT_DIR}")

    print_section(f"プロジェクトフォルダ内のファイル一覧（{SCRIPT_DIR}）")
    entries = sorted(SCRIPT_DIR.iterdir(), key=lambda p: p.name.lower())
    if not entries:
        print("（ファイルがありません）")
    else:
        for entry in entries:
            kind = "DIR " if entry.is_dir() else "FILE"
            size = f"{entry.stat().st_size:,} bytes" if entry.is_file() else ""
            print(f"  [{kind}] {entry.name}  {size}")


def print_folder_guidance() -> None:
    print_section("CSVが見つからない場合に確認するフォルダ")
    home = Path.home()
    candidates = [
        home / "Downloads",
        home / "Desktop",
        home / "Documents",
        home / "OneDrive",
        PROJECT_ROOT,
        SCRIPT_DIR,
    ]
    for folder in candidates:
        exists = "存在" if folder.exists() else "未確認"
        print(f"  - {folder}  （{exists}）")
    print()
    print("授業用ZIP・LMSの資料ダウンロード先・USBメモリ内も確認してください。")
    print(f"配置後のファイル名：{CSV_FILENAME}")
    print(f"配置先：{SCRIPT_DIR}")


def select_csv_via_dialog() -> Path | None:
    """Windowsのファイル選択ダイアログでCSVを指定する"""
    try:
        import tkinter as tk
        from tkinter import filedialog
    except ImportError:
        print("ファイル選択ダイアログを利用できません（tkinter未インストール）。")
        return None

    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)

    selected = filedialog.askopenfilename(
        title="分析用CSVファイルを選択してください（gender&brand2019.csv など）",
        filetypes=[("CSVファイル", "*.csv"), ("すべてのファイル", "*.*")],
        initialdir=str(Path.home() / "Downloads"),
    )
    root.destroy()

    if not selected:
        return None
    return Path(selected)


def read_csv_preview(csv_path: Path) -> pd.DataFrame:
    try:
        return pd.read_csv(csv_path, encoding="utf-8")
    except UnicodeDecodeError:
        return pd.read_csv(csv_path, encoding="cp932")


def validate_columns(df: pd.DataFrame, csv_path: Path) -> None:
    print_section("CSVの列名確認")
    columns = [str(c) for c in df.columns.tolist()]
    print(f"ファイル：{csv_path}")
    print(f"列数：{len(columns)}")
    print("列名一覧：")
    for col in columns:
        marker = " ← 分析に使用" if col in REQUIRED_COLUMNS else ""
        print(f"  - {col}{marker}")

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        print_section("エラーの説明")
        print(f"必要な列が見つかりません：{', '.join(missing)}")
        print()
        print("AAF1 = 性別（1=男性, 2=女性）")
        print("CBAA_1 = ラグジュアリーブランド嗜好（1〜4）")
        sys.exit(1)

    print()
    print("✓ AAF1（性別）と CBAA_1（ラグジュアリー嗜好）の両方が存在します。")


def copy_csv_to_project(source: Path) -> Path:
    """指定されたCSVをプロジェクトフォルダへコピーする"""
    print_section("CSVのコピー")
    print(f"コピー元：{source}")
    print(f"コピー先：{CSV_PATH}")

    if source.resolve() == CSV_PATH.resolve():
        print("既にプロジェクトフォルダに配置されています。コピーはスキップします。")
        return CSV_PATH

    shutil.copy2(source, CSV_PATH)
    print("✓ プロジェクトフォルダへコピーしました。")
    return CSV_PATH


def find_csv_in_project() -> list[Path]:
    found: list[Path] = []
    for path in PROJECT_ROOT.rglob("*.csv"):
        if path.name.lower() == CSV_FILENAME.lower():
            found.append(path)
    return found


def resolve_csv_path(cli_csv: str | None) -> Path:
    """CSVの所在を確認し、必要ならダイアログで選択・コピーする"""
    show_environment()

    print_section("CSVファイルの確認")
    if CSV_PATH.exists():
        print(f"✓ プロジェクトフォルダに {CSV_FILENAME} が存在します。")
        print(f"  パス：{CSV_PATH}")
        return CSV_PATH

    print(f"× プロジェクトフォルダに {CSV_FILENAME} は存在しません。")

    if cli_csv:
        source = Path(cli_csv)
        if not source.exists():
            print_section("エラーの説明")
            print(f"指定されたCSVが見つかりません：{source}")
            print_folder_guidance()
            sys.exit(1)
        print(f"コマンドラインで指定されたファイルを使用します：{source}")
        preview = read_csv_preview(source)
        validate_columns(preview, source)
        return copy_csv_to_project(source)

    project_candidates = find_csv_in_project()
    if project_candidates:
        source = project_candidates[0]
        print(f"プロジェクト内の別場所で見つかりました：{source}")
        preview = read_csv_preview(source)
        validate_columns(preview, source)
        return copy_csv_to_project(source)

    print()
    print("ファイル選択ダイアログを表示します...")
    print("（ダイアログが表示されない場合は run-analysis.bat をダブルクリックしてください）")
    print()

    selected = select_csv_via_dialog()
    if selected is None:
        print_section("エラーの説明")
        print("CSVファイルが選択されませんでした。分析を中止します。")
        print_folder_guidance()
        sys.exit(1)

    if not selected.exists():
        print_section("エラーの説明")
        print(f"選択されたファイルが見つかりません：{selected}")
        sys.exit(1)

    preview = read_csv_preview(selected)
    validate_columns(preview, selected)
    return copy_csv_to_project(selected)


def load_data(csv_path: Path) -> pd.DataFrame:
    df = read_csv_preview(csv_path)
    validate_columns(df, csv_path)

    analysis_df = df[REQUIRED_COLUMNS].dropna()
    if len(analysis_df) == 0:
        print_section("エラーの説明")
        print("CSVに有効なデータ行がありません（AAF1・CBAA_1がすべて欠損）。")
        sys.exit(1)

    return analysis_df


def add_group_column(df: pd.DataFrame) -> pd.DataFrame:
    """回答を2グループ（好意層・非好意層）に分類する"""
    result = df.copy()
    result["GROUP"] = result["CBAA_1"].apply(
        lambda x: 1 if x in FAVORABLE_ANSWERS else 2
    )
    return result


def create_group_cross_table(df: pd.DataFrame) -> pd.DataFrame:
    """性別 × 2グループのクロス集計表（度数）"""
    grouped = add_group_column(df)
    cross_table = pd.crosstab(
        grouped["AAF1"],
        grouped["GROUP"],
        margins=True,
        margins_name="合計",
    )
    cross_table = cross_table.reindex(index=GENDER_ORDER + ["合計"], columns=GROUP_ORDER + ["合計"], fill_value=0)

    labeled = cross_table.copy()
    labeled.index = [
        GENDER_LABELS.get(idx, idx) if idx != "合計" else "合計"
        for idx in labeled.index
    ]
    labeled.columns = [
        GROUP_LABELS.get(col, col) if col != "合計" else "合計"
        for col in labeled.columns
    ]
    return labeled


def create_group_row_ratio_table(df: pd.DataFrame) -> pd.DataFrame:
    """性別 × 2グループの行パーセント表"""
    grouped = add_group_column(df)
    count_table = pd.crosstab(grouped["AAF1"], grouped["GROUP"])
    count_table = count_table.reindex(index=GENDER_ORDER, columns=GROUP_ORDER, fill_value=0)
    row_ratio = count_table.div(count_table.sum(axis=1), axis=0) * 100

    row_ratio.index = [GENDER_LABELS[g] for g in row_ratio.index]
    row_ratio.columns = [GROUP_LABELS[c] for c in row_ratio.columns]
    return row_ratio


def run_group_chi_square_test(df: pd.DataFrame) -> tuple[float, int, float]:
    """2グループ分類でのカイ二乗検定"""
    grouped = add_group_column(df)
    contingency = pd.crosstab(grouped["AAF1"], grouped["GROUP"])
    contingency = contingency.reindex(index=GENDER_ORDER, columns=GROUP_ORDER, fill_value=0)
    chi2, p_value, dof, _expected = chi2_contingency(contingency)
    return chi2, dof, p_value


def create_cross_table(df: pd.DataFrame) -> pd.DataFrame:
    cross_table = pd.crosstab(
        df["AAF1"],
        df["CBAA_1"],
        margins=True,
        margins_name="合計",
    )
    row_index = [g for g in GENDER_ORDER if g in cross_table.index] + ["合計"]
    col_index = [a for a in ANSWER_ORDER if a in cross_table.columns] + ["合計"]
    cross_table = cross_table.reindex(index=row_index, columns=col_index, fill_value=0)

    labeled_table = cross_table.copy()
    labeled_table.index = [
        GENDER_LABELS.get(idx, idx) if idx != "合計" else "合計"
        for idx in labeled_table.index
    ]
    labeled_table.columns = [
        ANSWER_LABELS.get(col, col) if col != "合計" else "合計"
        for col in labeled_table.columns
    ]
    return labeled_table


def create_row_ratio_table(df: pd.DataFrame) -> pd.DataFrame:
    count_table = pd.crosstab(df["AAF1"], df["CBAA_1"])
    count_table = count_table.reindex(index=GENDER_ORDER, columns=ANSWER_ORDER, fill_value=0)
    row_ratio = count_table.div(count_table.sum(axis=1), axis=0) * 100
    row_ratio.index = [GENDER_LABELS[g] for g in row_ratio.index]
    row_ratio.columns = [ANSWER_LABELS[a] for a in row_ratio.columns]
    return row_ratio


def run_chi_square_test(df: pd.DataFrame) -> tuple[float, int, float]:
    contingency_table = pd.crosstab(df["AAF1"], df["CBAA_1"])
    contingency_table = contingency_table.reindex(
        index=GENDER_ORDER, columns=ANSWER_ORDER, fill_value=0
    )
    chi2, p_value, dof, _expected = chi2_contingency(contingency_table)
    return chi2, dof, p_value


def describe_group_difference(group_row_ratio: pd.DataFrame) -> str:
    """2グループ分類における男女差を記述する"""
    fav_col = GROUP_LABELS[1]
    male_fav = group_row_ratio.loc["男性", fav_col]
    female_fav = group_row_ratio.loc["女性", fav_col]

    if abs(male_fav - female_fav) < 3:
        return (
            f"好意層は男性{male_fav:.1f}%、女性{female_fav:.1f}%と、大きな差はみられなかった"
        )
    if male_fav > female_fav:
        return (
            f"好意層は男性{male_fav:.1f}%、女性{female_fav:.1f}%と、男性の方が高い傾向がみられた"
        )
    return (
        f"好意層は男性{male_fav:.1f}%、女性{female_fav:.1f}%と、女性の方が高い傾向がみられた"
    )


def generate_interpretation(
    group_row_ratio: pd.DataFrame,
    chi2: float,
    p_value: float,
) -> tuple[str, str]:
    ratio_diff = describe_group_difference(group_row_ratio)

    if p_value < ALPHA:
        significance_text = "有意な関連がある"
        judgment = "有意差あり"
        detail = (
            f"p値（{p_value:.6f}）が有意水準0.05未満であるため、"
            "性別とラグジュアリーブランドへの好意層・非好意層の分類には統計的に有意な関連がある。"
        )
    else:
        significance_text = "有意な関連はない"
        judgment = "有意差なし"
        detail = (
            f"p値（{p_value:.6f}）が有意水準0.05以上であるため、"
            "性別と好意層・非好意層の分類に統計的に有意な関連は認められない。"
        )

    interpretation = (
        f"{detail}\n"
        f"2グループに分けたクロス集計では、{ratio_diff}。\n"
        f"カイ二乗値は {chi2:.4f} であり、5％水準では「{judgment}」と判断できる。"
    )

    kousatsu = (
        "【考察】\n"
        "性別と「ラグジュアリー（最高級）ブランドが好きだ」への回答について、"
        "「非常にあてはまる・あてはまる」を好意層、「あまりあてはまらない・全くあてはまらない」を"
        "非好意層として2グループに分けてクロス集計を行った。"
        f"その結果、男女で回答割合に{ratio_diff}。"
        f"さらにカイ二乗検定を行ったところ、χ²={chi2:.4f}、p={p_value:.6f}であった。"
        f"したがって5％水準で{significance_text}と判断した。"
    )

    return interpretation, kousatsu


def generate_report(
    df: pd.DataFrame,
    cross_table: pd.DataFrame,
    row_ratio_table: pd.DataFrame,
    group_cross_table: pd.DataFrame,
    group_row_ratio_table: pd.DataFrame,
    chi2: float,
    dof: int,
    p_value: float,
    csv_path: Path,
) -> None:
    print_section("ADKデータ分析レポート")
    print("分析テーマ：性別（AAF1）と「ラグジュアリー（最高級）ブランドが好きだ」（CBAA_1）の関係")
    print("グループ分け：好意層（1・2）／非好意層（3・4）")
    print(f"データファイル：{csv_path}")
    print(f"有効回答数：{len(df)} 件")

    print_section("1. クロス集計表（度数）※2グループ")
    print(group_cross_table.to_string())

    print_section("2. 行パーセント表（%）※2グループ")
    print(group_row_ratio_table.round(1).to_string())

    print_section("3. カイ二乗検定の結果（2グループ）")
    print(f"カイ二乗値：{chi2:.4f}")
    print(f"自由度：{dof}")
    print(f"p値：{p_value:.6f}")

    print_section("4. 有意差の有無（有意水準 α = 0.05）")
    if p_value < ALPHA:
        print("判定結果：有意差あり（有意な関連がある）")
    else:
        print("判定結果：有意差なし（有意な関連はない）")

    interpretation, kousatsu = generate_interpretation(group_row_ratio_table, chi2, p_value)

    print_section("5. 結果の日本語による解釈")
    print(interpretation)

    print_section("6. 大学提出用の考察文")
    print(kousatsu)

    print_section("参考：4カテゴリのクロス集計表（度数）")
    print(cross_table.to_string())

    print_section("参考：4カテゴリの行パーセント表（%）")
    print(row_ratio_table.round(1).to_string())

    print()
    print("=" * 60)
    print("分析完了")
    print("=" * 60)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="性別とラグジュアリーブランド嗜好の分析")
    parser.add_argument(
        "--csv",
        type=str,
        default=None,
        help="CSVファイルのパス（未指定時はダイアログで選択）",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    try:
        csv_path = resolve_csv_path(args.csv)
        df = load_data(csv_path)
        cross_table = create_cross_table(df)
        row_ratio_table = create_row_ratio_table(df)
        group_cross_table = create_group_cross_table(df)
        group_row_ratio_table = create_group_row_ratio_table(df)
        chi2, dof, p_value = run_group_chi_square_test(df)
        generate_report(
            df,
            cross_table,
            row_ratio_table,
            group_cross_table,
            group_row_ratio_table,
            chi2,
            dof,
            p_value,
            csv_path,
        )
    except pd.errors.EmptyDataError:
        print_section("エラーの説明")
        print("CSVファイルが空です。データが含まれているか確認してください。")
        sys.exit(1)
    except Exception as exc:
        print_section("エラーの説明")
        print(f"予期しないエラーが発生しました：{type(exc).__name__}")
        print(str(exc))
        print()
        print("対処方法：")
        print("  - run-analysis.bat をダブルクリックして再実行")
        print("  - pandas, scipy がインストールされているか確認")
        sys.exit(1)


if __name__ == "__main__":
    main()
