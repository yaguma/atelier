using System.Collections.Generic;
using UnityEngine;

namespace Atelier.Application.Commands
{
    /// <summary>
    /// コマンド管理の実装クラス。
    /// Undo/Redo機能を提供する。最大50件の履歴を保持する。
    /// </summary>
    public class CommandManager : ICommandManager
    {
        private const int MaxHistorySize = 50;

        private readonly LinkedList<ICommand> _undoStack;
        private readonly Stack<ICommand> _redoStack;

        /// <inheritdoc/>
        public bool CanUndo => _undoStack.Count > 0;

        /// <inheritdoc/>
        public bool CanRedo => _redoStack.Count > 0;

        /// <summary>
        /// CommandManagerを初期化する。
        /// </summary>
        public CommandManager()
        {
            _undoStack = new LinkedList<ICommand>();
            _redoStack = new Stack<ICommand>();
        }

        /// <inheritdoc/>
        public void ExecuteCommand(ICommand command)
        {
            if (command == null)
            {
                Debug.LogWarning("[CommandManager] Cannot execute null command.");
                return;
            }

            // コマンドを実行
            command.Execute();

            // Undoスタックに追加
            _undoStack.AddLast(command);

            // 最大サイズを超えたら古いものを削除
            while (_undoStack.Count > MaxHistorySize)
            {
                _undoStack.RemoveFirst();
            }

            // 新しいコマンドが実行されたらRedoスタックをクリア
            _redoStack.Clear();

            Debug.Log($"[CommandManager] Executed command. Undo stack: {_undoStack.Count}, Redo stack: {_redoStack.Count}");
        }

        /// <inheritdoc/>
        public void Undo()
        {
            if (!CanUndo)
            {
                Debug.LogWarning("[CommandManager] Nothing to undo.");
                return;
            }

            var command = _undoStack.Last.Value;
            _undoStack.RemoveLast();

            command.Undo();
            _redoStack.Push(command);

            Debug.Log($"[CommandManager] Undone command. Undo stack: {_undoStack.Count}, Redo stack: {_redoStack.Count}");
        }

        /// <inheritdoc/>
        public void Redo()
        {
            if (!CanRedo)
            {
                Debug.LogWarning("[CommandManager] Nothing to redo.");
                return;
            }

            var command = _redoStack.Pop();
            command.Execute();
            _undoStack.AddLast(command);

            Debug.Log($"[CommandManager] Redone command. Undo stack: {_undoStack.Count}, Redo stack: {_redoStack.Count}");
        }

        /// <inheritdoc/>
        public void Clear()
        {
            _undoStack.Clear();
            _redoStack.Clear();

            Debug.Log("[CommandManager] Cleared all history.");
        }
    }
}
