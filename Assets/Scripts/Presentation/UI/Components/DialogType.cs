namespace Atelier.Presentation.UI.Components
{
    /// <summary>
    /// ダイアログのタイプを表す列挙型。
    /// 各タイプは異なるボタン構成と用途を持つ。
    /// </summary>
    public enum DialogType
    {
        /// <summary>
        /// 確認ダイアログ（OK/キャンセル）
        /// ユーザーの意思確認に使用
        /// </summary>
        Confirm,

        /// <summary>
        /// 情報ダイアログ（閉じるのみ）
        /// 情報提示に使用
        /// </summary>
        Info,

        /// <summary>
        /// エラーダイアログ（閉じる/リトライ）
        /// エラー表示に使用
        /// </summary>
        Error,

        /// <summary>
        /// 入力ダイアログ（入力フィールド + 決定/キャンセル）
        /// シード値入力などに使用
        /// </summary>
        Input
    }
}
