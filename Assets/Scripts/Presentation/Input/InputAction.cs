namespace Atelier.Presentation.Input
{
    /// <summary>
    /// ゲームで使用する入力アクションの列挙型。
    /// </summary>
    public enum InputAction
    {
        /// <summary>決定（Enter）</summary>
        Confirm = 0,

        /// <summary>キャンセル（Escape）</summary>
        Cancel = 1,

        /// <summary>アンドゥ（Ctrl+Z）</summary>
        Undo = 2,

        /// <summary>ターン終了（Space）</summary>
        EndTurn = 3,

        /// <summary>カードスロット1（1キー）</summary>
        CardSlot1 = 4,

        /// <summary>カードスロット2（2キー）</summary>
        CardSlot2 = 5,

        /// <summary>カードスロット3（3キー）</summary>
        CardSlot3 = 6,

        /// <summary>カードスロット4（4キー）</summary>
        CardSlot4 = 7,

        /// <summary>カードスロット5（5キー）</summary>
        CardSlot5 = 8,

        /// <summary>上移動</summary>
        MoveUp = 9,

        /// <summary>下移動</summary>
        MoveDown = 10,

        /// <summary>左移動</summary>
        MoveLeft = 11,

        /// <summary>右移動</summary>
        MoveRight = 12
    }
}
