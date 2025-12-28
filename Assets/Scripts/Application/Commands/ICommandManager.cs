namespace Atelier.Application.Commands
{
    /// <summary>
    /// コマンド管理のインターフェース。
    /// Undo/Redo機能を提供する。
    /// </summary>
    public interface ICommandManager
    {
        /// <summary>
        /// Undo可能かどうか
        /// </summary>
        bool CanUndo { get; }

        /// <summary>
        /// Redo可能かどうか
        /// </summary>
        bool CanRedo { get; }

        /// <summary>
        /// コマンドを実行し、履歴に追加する。
        /// </summary>
        /// <param name="command">実行するコマンド</param>
        void ExecuteCommand(ICommand command);

        /// <summary>
        /// 直前のコマンドを取り消す。
        /// </summary>
        void Undo();

        /// <summary>
        /// 取り消したコマンドをやり直す。
        /// </summary>
        void Redo();

        /// <summary>
        /// 履歴をすべてクリアする。
        /// </summary>
        void Clear();
    }
}
