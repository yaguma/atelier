using NUnit.Framework;
using Atelier.Application.Commands;

namespace Atelier.Tests.EditMode.Application
{
    /// <summary>
    /// CommandManagerのテスト
    /// </summary>
    [TestFixture]
    public class CommandManagerTests
    {
        #region ICommand インターフェーステスト

        [Test]
        public void ICommand_インターフェースが存在する()
        {
            var type = typeof(ICommand);
            Assert.IsNotNull(type);
        }

        [Test]
        public void ICommand_Executeメソッドが定義されている()
        {
            var type = typeof(ICommand);
            var method = type.GetMethod("Execute");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ICommand_Undoメソッドが定義されている()
        {
            var type = typeof(ICommand);
            var method = type.GetMethod("Undo");
            Assert.IsNotNull(method);
        }

        #endregion

        #region ICommandManager インターフェーステスト

        [Test]
        public void ICommandManager_インターフェースが存在する()
        {
            var type = typeof(ICommandManager);
            Assert.IsNotNull(type);
        }

        [Test]
        public void ICommandManager_CanUndoプロパティが定義されている()
        {
            var type = typeof(ICommandManager);
            var property = type.GetProperty("CanUndo");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(bool), property.PropertyType);
        }

        [Test]
        public void ICommandManager_CanRedoプロパティが定義されている()
        {
            var type = typeof(ICommandManager);
            var property = type.GetProperty("CanRedo");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(bool), property.PropertyType);
        }

        [Test]
        public void ICommandManager_ExecuteCommandメソッドが定義されている()
        {
            var type = typeof(ICommandManager);
            var method = type.GetMethod("ExecuteCommand");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ICommandManager_Undoメソッドが定義されている()
        {
            var type = typeof(ICommandManager);
            var method = type.GetMethod("Undo");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ICommandManager_Redoメソッドが定義されている()
        {
            var type = typeof(ICommandManager);
            var method = type.GetMethod("Redo");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ICommandManager_Clearメソッドが定義されている()
        {
            var type = typeof(ICommandManager);
            var method = type.GetMethod("Clear");
            Assert.IsNotNull(method);
        }

        #endregion

        #region CommandManager クラステスト

        [Test]
        public void CommandManager_クラスが存在する()
        {
            var type = typeof(CommandManager);
            Assert.IsNotNull(type);
        }

        [Test]
        public void CommandManager_ICommandManagerを実装している()
        {
            var type = typeof(CommandManager);
            Assert.IsTrue(typeof(ICommandManager).IsAssignableFrom(type));
        }

        #endregion

        #region CommandManager 動作テスト

        private CommandManager _commandManager;
        private TestCommand _testCommand;

        [SetUp]
        public void SetUp()
        {
            _commandManager = new CommandManager();
            _testCommand = new TestCommand();
        }

        [Test]
        public void CommandManager_初期状態ではCanUndoはfalse()
        {
            Assert.IsFalse(_commandManager.CanUndo);
        }

        [Test]
        public void CommandManager_初期状態ではCanRedoはfalse()
        {
            Assert.IsFalse(_commandManager.CanRedo);
        }

        [Test]
        public void CommandManager_コマンド実行でCanUndoがtrueになる()
        {
            _commandManager.ExecuteCommand(_testCommand);
            Assert.IsTrue(_commandManager.CanUndo);
        }

        [Test]
        public void CommandManager_ExecuteでコマンドのExecuteが呼ばれる()
        {
            _commandManager.ExecuteCommand(_testCommand);
            Assert.IsTrue(_testCommand.WasExecuted);
        }

        [Test]
        public void CommandManager_UndoでコマンドのUndoが呼ばれる()
        {
            _commandManager.ExecuteCommand(_testCommand);
            _commandManager.Undo();
            Assert.IsTrue(_testCommand.WasUndone);
        }

        [Test]
        public void CommandManager_Undo後にCanRedoがtrueになる()
        {
            _commandManager.ExecuteCommand(_testCommand);
            _commandManager.Undo();
            Assert.IsTrue(_commandManager.CanRedo);
        }

        [Test]
        public void CommandManager_Redo後にCanUndoがtrueになる()
        {
            _commandManager.ExecuteCommand(_testCommand);
            _commandManager.Undo();
            _commandManager.Redo();
            Assert.IsTrue(_commandManager.CanUndo);
        }

        [Test]
        public void CommandManager_Clear後にCanUndoがfalseになる()
        {
            _commandManager.ExecuteCommand(_testCommand);
            _commandManager.Clear();
            Assert.IsFalse(_commandManager.CanUndo);
        }

        [Test]
        public void CommandManager_履歴は最大50件まで保持される()
        {
            for (int i = 0; i < 60; i++)
            {
                _commandManager.ExecuteCommand(new TestCommand());
            }

            // 50回分のUndoができる
            int undoCount = 0;
            while (_commandManager.CanUndo)
            {
                _commandManager.Undo();
                undoCount++;
            }

            Assert.AreEqual(50, undoCount);
        }

        [Test]
        public void CommandManager_新しいコマンド実行でRedoスタックがクリアされる()
        {
            _commandManager.ExecuteCommand(new TestCommand());
            _commandManager.Undo();
            Assert.IsTrue(_commandManager.CanRedo);

            _commandManager.ExecuteCommand(new TestCommand());
            Assert.IsFalse(_commandManager.CanRedo);
        }

        #endregion

        /// <summary>
        /// テスト用のコマンド
        /// </summary>
        private class TestCommand : ICommand
        {
            public bool WasExecuted { get; private set; }
            public bool WasUndone { get; private set; }

            public void Execute()
            {
                WasExecuted = true;
            }

            public void Undo()
            {
                WasUndone = true;
            }
        }
    }
}
