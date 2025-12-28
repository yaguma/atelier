using NUnit.Framework;
using Atelier.Presentation.Screens;

namespace Atelier.Tests.EditMode.Presentation
{
    /// <summary>
    /// スタイル選択画面のテスト
    /// </summary>
    [TestFixture]
    public class StyleSelectScreenTests
    {
        #region StyleSelectScreen クラステスト

        [Test]
        public void StyleSelectScreen_クラスが存在する()
        {
            var type = typeof(StyleSelectScreen);
            Assert.IsNotNull(type);
        }

        [Test]
        public void StyleSelectScreen_MonoBehaviourを継承している()
        {
            var type = typeof(StyleSelectScreen);
            Assert.IsTrue(typeof(UnityEngine.MonoBehaviour).IsAssignableFrom(type));
        }

        [Test]
        public void StyleSelectScreen_OnBackClickedメソッドを持っている()
        {
            var type = typeof(StyleSelectScreen);
            var method = type.GetMethod("OnBackClicked");
            Assert.IsNotNull(method);
        }

        [Test]
        public void StyleSelectScreen_OnStartClickedメソッドを持っている()
        {
            var type = typeof(StyleSelectScreen);
            var method = type.GetMethod("OnStartClicked");
            Assert.IsNotNull(method);
        }

        [Test]
        public void StyleSelectScreen_SelectStyleメソッドを持っている()
        {
            var type = typeof(StyleSelectScreen);
            var method = type.GetMethod("SelectStyle");
            Assert.IsNotNull(method);
        }

        [Test]
        public void StyleSelectScreen_ShowSeedDialogメソッドを持っている()
        {
            var type = typeof(StyleSelectScreen);
            var method = type.GetMethod("ShowSeedDialog");
            Assert.IsNotNull(method);
        }

        [Test]
        public void StyleSelectScreen_UpdateStyleDetailメソッドを持っている()
        {
            var type = typeof(StyleSelectScreen);
            var method = type.GetMethod("UpdateStyleDetail");
            Assert.IsNotNull(method);
        }

        [Test]
        public void StyleSelectScreen_SelectedStyleIdプロパティを持っている()
        {
            var type = typeof(StyleSelectScreen);
            var property = type.GetProperty("SelectedStyleId");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void StyleSelectScreen_GameSeedプロパティを持っている()
        {
            var type = typeof(StyleSelectScreen);
            var property = type.GetProperty("GameSeed");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        #endregion
    }
}
