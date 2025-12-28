namespace Atelier.Presentation.Audio
{
    /// <summary>
    /// オーディオID定数クラス。
    /// BGM/SEのID文字列を一元管理する。
    /// </summary>
    public static class AudioIdConstants
    {
        #region BGM IDs

        /// <summary>タイトル画面BGM</summary>
        public const string BGM_TITLE = "BGM_TITLE";

        /// <summary>マップ画面BGM</summary>
        public const string BGM_MAP = "BGM_MAP";

        /// <summary>クエスト画面BGM</summary>
        public const string BGM_QUEST = "BGM_QUEST";

        /// <summary>商人画面BGM</summary>
        public const string BGM_MERCHANT = "BGM_MERCHANT";

        /// <summary>結果画面BGM（勝利）</summary>
        public const string BGM_RESULT_WIN = "BGM_RESULT_WIN";

        /// <summary>結果画面BGM（敗北）</summary>
        public const string BGM_RESULT_LOSE = "BGM_RESULT_LOSE";

        #endregion

        #region SE IDs - UI

        /// <summary>ボタンホバーSE</summary>
        public const string SE_BUTTON_HOVER = "SE_BUTTON_HOVER";

        /// <summary>ボタンクリックSE</summary>
        public const string SE_BUTTON_CLICK = "SE_BUTTON_CLICK";

        /// <summary>ダイアログ表示SE</summary>
        public const string SE_DIALOG_OPEN = "SE_DIALOG_OPEN";

        /// <summary>ダイアログ閉じるSE</summary>
        public const string SE_DIALOG_CLOSE = "SE_DIALOG_CLOSE";

        /// <summary>決定SE</summary>
        public const string SE_CONFIRM = "SE_CONFIRM";

        /// <summary>キャンセルSE</summary>
        public const string SE_CANCEL = "SE_CANCEL";

        /// <summary>カーソル移動SE</summary>
        public const string SE_CURSOR = "SE_CURSOR";

        #endregion

        #region SE IDs - Game

        /// <summary>カードプレイSE</summary>
        public const string SE_CARD_PLAY = "SE_CARD_PLAY";

        /// <summary>カードドローSE</summary>
        public const string SE_CARD_DRAW = "SE_CARD_DRAW";

        /// <summary>ターン終了SE</summary>
        public const string SE_TURN_END = "SE_TURN_END";

        /// <summary>調合成功SE</summary>
        public const string SE_BREW_SUCCESS = "SE_BREW_SUCCESS";

        /// <summary>調合失敗SE</summary>
        public const string SE_BREW_FAIL = "SE_BREW_FAIL";

        /// <summary>暴発SE</summary>
        public const string SE_EXPLOSION = "SE_EXPLOSION";

        /// <summary>クエスト完了SE</summary>
        public const string SE_QUEST_COMPLETE = "SE_QUEST_COMPLETE";

        /// <summary>ゴールド獲得SE</summary>
        public const string SE_GOLD_GAIN = "SE_GOLD_GAIN";

        /// <summary>名声獲得SE</summary>
        public const string SE_FAME_GAIN = "SE_FAME_GAIN";

        #endregion
    }
}
