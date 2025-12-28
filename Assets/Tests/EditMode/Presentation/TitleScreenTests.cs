using NUnit.Framework;
using Atelier.Presentation.Screens;

namespace Atelier.Tests.EditMode.Presentation
{
    /// <summary>
    /// タイトル画面のテスト
    /// </summary>
    [TestFixture]
    public class TitleScreenTests
    {
        #region TitleScreen クラステスト

        [Test]
        public void TitleScreen_クラスが存在する()
        {
            var type = typeof(TitleScreen);
            Assert.IsNotNull(type);
        }

        [Test]
        public void TitleScreen_MonoBehaviourを継承している()
        {
            var type = typeof(TitleScreen);
            Assert.IsTrue(typeof(UnityEngine.MonoBehaviour).IsAssignableFrom(type));
        }

        [Test]
        public void TitleScreen_OnNewGameClickedメソッドを持っている()
        {
            var type = typeof(TitleScreen);
            var method = type.GetMethod("OnNewGameClicked");
            Assert.IsNotNull(method);
        }

        [Test]
        public void TitleScreen_OnContinueClickedメソッドを持っている()
        {
            var type = typeof(TitleScreen);
            var method = type.GetMethod("OnContinueClicked");
            Assert.IsNotNull(method);
        }

        [Test]
        public void TitleScreen_OnSettingsClickedメソッドを持っている()
        {
            var type = typeof(TitleScreen);
            var method = type.GetMethod("OnSettingsClicked");
            Assert.IsNotNull(method);
        }

        [Test]
        public void TitleScreen_OnExitClickedメソッドを持っている()
        {
            var type = typeof(TitleScreen);
            var method = type.GetMethod("OnExitClicked");
            Assert.IsNotNull(method);
        }

        [Test]
        public void TitleScreen_UpdateContinueButtonStateメソッドを持っている()
        {
            var type = typeof(TitleScreen);
            var method = type.GetMethod("UpdateContinueButtonState");
            Assert.IsNotNull(method);
        }

        [Test]
        public void TitleScreen_SelectButtonメソッドを持っている()
        {
            var type = typeof(TitleScreen);
            var method = type.GetMethod("SelectButton");
            Assert.IsNotNull(method);
        }

        #endregion
    }
}
