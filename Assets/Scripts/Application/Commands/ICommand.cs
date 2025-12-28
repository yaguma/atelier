namespace Atelier.Application.Commands
{
    /// <summary>
    /// コマンドパターンのコマンドインターフェース。
    /// Undo/Redo機能を実現するための基本インターフェース。
    /// </summary>
    public interface ICommand
    {
        /// <summary>
        /// コマンドを実行する。
        /// </summary>
        void Execute();

        /// <summary>
        /// コマンドを取り消す。
        /// </summary>
        void Undo();
    }
}
