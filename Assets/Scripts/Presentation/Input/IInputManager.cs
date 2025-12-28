using System;
using UnityEngine;

namespace Atelier.Presentation.Input
{
    /// <summary>
    /// 入力管理のインターフェース。
    /// キーボード入力のイベント発火とキーバインド管理を提供する。
    /// </summary>
    public interface IInputManager
    {
        /// <summary>決定キー押下時</summary>
        event Action OnConfirm;

        /// <summary>キャンセルキー押下時</summary>
        event Action OnCancel;

        /// <summary>アンドゥキー押下時</summary>
        event Action OnUndo;

        /// <summary>カードスロット選択時（1-5）</summary>
        event Action<int> OnCardSlotSelected;

        /// <summary>ターン終了キー押下時</summary>
        event Action OnEndTurn;

        /// <summary>上移動キー押下時</summary>
        event Action OnMoveUp;

        /// <summary>下移動キー押下時</summary>
        event Action OnMoveDown;

        /// <summary>左移動キー押下時</summary>
        event Action OnMoveLeft;

        /// <summary>右移動キー押下時</summary>
        event Action OnMoveRight;

        /// <summary>
        /// 入力が有効かどうか
        /// </summary>
        bool IsInputEnabled { get; }

        /// <summary>
        /// 指定したアクションのキーが押されているかを確認する。
        /// </summary>
        /// <param name="actionName">アクション名</param>
        /// <returns>キーが押されていればtrue</returns>
        bool IsKeyDown(string actionName);

        /// <summary>
        /// キーバインドを変更する。
        /// </summary>
        /// <param name="actionName">アクション名</param>
        /// <param name="newKey">新しいキー</param>
        void RebindKey(string actionName, KeyCode newKey);

        /// <summary>
        /// 入力の有効/無効を設定する。
        /// </summary>
        /// <param name="enabled">有効にする場合はtrue</param>
        void SetInputEnabled(bool enabled);
    }
}
