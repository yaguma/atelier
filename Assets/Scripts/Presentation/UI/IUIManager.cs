using System;

namespace Atelier.Presentation.UI
{
    /// <summary>
    /// UI管理のインターフェース。
    /// 画面表示、ダイアログ、ローディングの制御を提供する。
    /// </summary>
    public interface IUIManager
    {
        /// <summary>
        /// 画面を表示する。
        /// </summary>
        /// <param name="screenId">画面ID</param>
        void ShowScreen(string screenId);

        /// <summary>
        /// 画面を非表示にする。
        /// </summary>
        /// <param name="screenId">画面ID</param>
        void HideScreen(string screenId);

        /// <summary>
        /// ダイアログを表示する。
        /// </summary>
        /// <param name="dialogId">ダイアログID</param>
        /// <param name="onResult">結果コールバック（true: OK, false: キャンセル）</param>
        void ShowDialog(string dialogId, Action<bool> onResult = null);

        /// <summary>
        /// ダイアログを非表示にする。
        /// </summary>
        /// <param name="dialogId">ダイアログID</param>
        void HideDialog(string dialogId);

        /// <summary>
        /// ローディング表示を開始する。
        /// </summary>
        void ShowLoading();

        /// <summary>
        /// ローディング表示を終了する。
        /// </summary>
        void HideLoading();

        /// <summary>
        /// 入力をブロックする。
        /// </summary>
        void BlockInput();

        /// <summary>
        /// 入力ブロックを解除する。
        /// </summary>
        void UnblockInput();

        /// <summary>
        /// 入力がブロックされているかどうか。
        /// </summary>
        bool IsInputBlocked { get; }
    }
}
