using NUnit.Framework;
using Atelier.Presentation.Input;
using System;

namespace Atelier.Tests.EditMode.Presentation
{
    /// <summary>
    /// InputManagerのテスト
    /// </summary>
    [TestFixture]
    public class InputManagerTests
    {
        #region IInputManager インターフェーステスト

        [Test]
        public void IInputManager_インターフェースが存在する()
        {
            var type = typeof(IInputManager);
            Assert.IsNotNull(type);
        }

        [Test]
        public void IInputManager_OnConfirmイベントが定義されている()
        {
            var type = typeof(IInputManager);
            var eventInfo = type.GetEvent("OnConfirm");
            Assert.IsNotNull(eventInfo);
        }

        [Test]
        public void IInputManager_OnCancelイベントが定義されている()
        {
            var type = typeof(IInputManager);
            var eventInfo = type.GetEvent("OnCancel");
            Assert.IsNotNull(eventInfo);
        }

        [Test]
        public void IInputManager_OnUndoイベントが定義されている()
        {
            var type = typeof(IInputManager);
            var eventInfo = type.GetEvent("OnUndo");
            Assert.IsNotNull(eventInfo);
        }

        [Test]
        public void IInputManager_OnCardSlotSelectedイベントが定義されている()
        {
            var type = typeof(IInputManager);
            var eventInfo = type.GetEvent("OnCardSlotSelected");
            Assert.IsNotNull(eventInfo);
        }

        [Test]
        public void IInputManager_OnEndTurnイベントが定義されている()
        {
            var type = typeof(IInputManager);
            var eventInfo = type.GetEvent("OnEndTurn");
            Assert.IsNotNull(eventInfo);
        }

        [Test]
        public void IInputManager_IsKeyDownメソッドが定義されている()
        {
            var type = typeof(IInputManager);
            var method = type.GetMethod("IsKeyDown");
            Assert.IsNotNull(method);
            Assert.AreEqual(typeof(bool), method.ReturnType);
        }

        [Test]
        public void IInputManager_RebindKeyメソッドが定義されている()
        {
            var type = typeof(IInputManager);
            var method = type.GetMethod("RebindKey");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IInputManager_SetInputEnabledメソッドが定義されている()
        {
            var type = typeof(IInputManager);
            var method = type.GetMethod("SetInputEnabled");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IInputManager_IsInputEnabledプロパティが定義されている()
        {
            var type = typeof(IInputManager);
            var property = type.GetProperty("IsInputEnabled");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(bool), property.PropertyType);
        }

        #endregion

        #region InputManager クラステスト

        [Test]
        public void InputManager_クラスが存在する()
        {
            var type = typeof(InputManager);
            Assert.IsNotNull(type);
        }

        [Test]
        public void InputManager_MonoBehaviourを継承している()
        {
            var type = typeof(InputManager);
            Assert.IsTrue(typeof(UnityEngine.MonoBehaviour).IsAssignableFrom(type));
        }

        [Test]
        public void InputManager_IInputManagerを実装している()
        {
            var type = typeof(InputManager);
            Assert.IsTrue(typeof(IInputManager).IsAssignableFrom(type));
        }

        [Test]
        public void InputManager_Instanceプロパティを持っている()
        {
            var type = typeof(InputManager);
            var property = type.GetProperty("Instance");
            Assert.IsNotNull(property);
        }

        #endregion

        #region InputAction Enum テスト

        [Test]
        public void InputAction_Confirmが定義されている()
        {
            Assert.AreEqual(0, (int)InputAction.Confirm);
        }

        [Test]
        public void InputAction_Cancelが定義されている()
        {
            Assert.AreEqual(1, (int)InputAction.Cancel);
        }

        [Test]
        public void InputAction_Undoが定義されている()
        {
            Assert.AreEqual(2, (int)InputAction.Undo);
        }

        [Test]
        public void InputAction_EndTurnが定義されている()
        {
            Assert.AreEqual(3, (int)InputAction.EndTurn);
        }

        [Test]
        public void InputAction_CardSlot1が定義されている()
        {
            var action = InputAction.CardSlot1;
            Assert.IsNotNull(action);
        }

        #endregion
    }
}
