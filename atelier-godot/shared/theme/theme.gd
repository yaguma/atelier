# res://shared/theme/theme.gd
# UI見た目パラメータの一元管理（TypeScript版 THEME 相当）。
# 本タスク時点では最低限の色・レイアウト調整のみを定義する（design-interview.md確定事項）。
# class_nameは`Theme`ではなく`GameTheme`とする。GodotにUIテーマ用の組み込みクラス`Theme`が
# 既に存在し、`class_name Theme`にすると識別子解決が組み込みクラス優先になり、
# 本クラスの定数に一切アクセスできなくなる（parse error）ため。
class_name GameTheme
extends RefCounted

# --- 色（背景・テキスト・ボーダー） ---
const COLOR_BACKGROUND_PRIMARY: Color = Color("#F5F0E6")   # 🟡 暖色系の背景。詳細デザインは後続で調整
const COLOR_TEXT_PRIMARY: Color = Color("#2E2A24")          # 🟡
const COLOR_TEXT_MUTED: Color = Color("#8A8477")            # 🟡
const COLOR_BORDER_DEFAULT: Color = Color("#D8CFBC")        # 🟡

# --- 品質グレード表示色（MaterialInstance.Quality D〜S対応） ---
const COLOR_QUALITY_D: Color = Color("#9E9E9E")  # 🟡
const COLOR_QUALITY_C: Color = Color("#7CB342")  # 🟡
const COLOR_QUALITY_B: Color = Color("#42A5F5")  # 🟡
const COLOR_QUALITY_A: Color = Color("#AB47BC")  # 🟡
const COLOR_QUALITY_S: Color = Color("#FFB300")  # 🟡

# --- フォントサイズ ---
const FONT_SIZE_HEADING: int = 24   # 🟡
const FONT_SIZE_BODY: int = 16      # 🟡
const FONT_SIZE_CAPTION: int = 12   # 🟡

# --- スペーシング ---
const SPACING_SMALL: int = 4    # 🟡
const SPACING_MEDIUM: int = 8   # 🟡
const SPACING_LARGE: int = 16   # 🟡

# --- 角丸（design-guide.mdの角丸基準を踏襲する場合の参考値。詳細適用は後続UI実装で） ---
const RADIUS_BADGE: int = 6     # 🟡
const RADIUS_CARD: int = 12     # 🟡
const RADIUS_BUTTON: int = 18   # 🟡
