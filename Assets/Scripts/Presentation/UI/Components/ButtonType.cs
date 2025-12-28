namespace Atelier.Presentation.UI.Components
{
    /// <summary>
    /// ボタンのタイプを表す列挙型。
    /// 各タイプは異なるスタイルと用途を持つ。
    /// </summary>
    public enum ButtonType
    {
        /// <summary>
        /// プライマリボタン（決定・開始）
        /// 背景色: #8B4513 (茶色)
        /// </summary>
        Primary,

        /// <summary>
        /// セカンダリボタン（キャンセル・戻る）
        /// 背景色: グレー
        /// </summary>
        Secondary,

        /// <summary>
        /// デンジャーボタン（削除など不可逆アクション）
        /// 背景色: 赤
        /// </summary>
        Danger,

        /// <summary>
        /// ゴーストボタン（補助的なアクション）
        /// 背景色: 透明、枠線のみ
        /// </summary>
        Ghost
    }
}
