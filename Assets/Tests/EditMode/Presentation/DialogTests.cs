using NUnit.Framework;
using Atelier.Presentation.UI.Components;

namespace Atelier.Tests.EditMode.Presentation
{
    /// <summary>
    /// ダイアログコンポーネントのテスト
    /// </summary>
    [TestFixture]
    public class DialogTests
    {
        #region DialogType Enum テスト

        [Test]
        public void DialogType_Confirmが定義されている()
        {
            Assert.AreEqual(0, (int)DialogType.Confirm);
        }

        [Test]
        public void DialogType_Infoが定義されている()
        {
            Assert.AreEqual(1, (int)DialogType.Info);
        }

        [Test]
        public void DialogType_Errorが定義されている()
        {
            Assert.AreEqual(2, (int)DialogType.Error);
        }

        [Test]
        public void DialogType_Inputが定義されている()
        {
            Assert.AreEqual(3, (int)DialogType.Input);
        }

        [Test]
        public void DialogType_4種類のダイアログが定義されている()
        {
            var values = System.Enum.GetValues(typeof(DialogType));
            Assert.AreEqual(4, values.Length);
        }

        #endregion

        #region GameDialog クラステスト

        [Test]
        public void GameDialog_クラスが存在する()
        {
            var type = typeof(GameDialog);
            Assert.IsNotNull(type);
        }

        [Test]
        public void GameDialog_MonoBehaviourを継承している()
        {
            var type = typeof(GameDialog);
            Assert.IsTrue(typeof(UnityEngine.MonoBehaviour).IsAssignableFrom(type));
        }

        [Test]
        public void GameDialog_DialogTypeプロパティを持っている()
        {
            var type = typeof(GameDialog);
            var property = type.GetProperty("DialogType");
            Assert.IsNotNull(property);
        }

        [Test]
        public void GameDialog_InputTextプロパティを持っている()
        {
            var type = typeof(GameDialog);
            var property = type.GetProperty("InputText");
            Assert.IsNotNull(property);
        }

        [Test]
        public void GameDialog_Showメソッドを持っている()
        {
            var type = typeof(GameDialog);
            var method = type.GetMethod("Show");
            Assert.IsNotNull(method);
        }

        [Test]
        public void GameDialog_ShowInputメソッドを持っている()
        {
            var type = typeof(GameDialog);
            var method = type.GetMethod("ShowInput");
            Assert.IsNotNull(method);
        }

        [Test]
        public void GameDialog_Closeメソッドを持っている()
        {
            var type = typeof(GameDialog);
            var method = type.GetMethod("Close");
            Assert.IsNotNull(method);
        }

        #endregion
    }
}
