using NUnit.Framework;

namespace Atelier.Tests.EditMode.Presentation
{
    /// <summary>
    /// UIManagerのインターフェーステスト。
    /// 実際のUI表示はPlayModeテストで行う。
    /// </summary>
    [TestFixture]
    public class UIManagerInterfaceTests
    {
        #region インターフェース定義テスト

        [Test]
        public void IUIManager_ShowScreenメソッドが定義されている()
        {
            var type = typeof(Atelier.Presentation.UI.IUIManager);
            var method = type.GetMethod("ShowScreen");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IUIManager_HideScreenメソッドが定義されている()
        {
            var type = typeof(Atelier.Presentation.UI.IUIManager);
            var method = type.GetMethod("HideScreen");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IUIManager_ShowDialogメソッドが定義されている()
        {
            var type = typeof(Atelier.Presentation.UI.IUIManager);
            var method = type.GetMethod("ShowDialog");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IUIManager_HideDialogメソッドが定義されている()
        {
            var type = typeof(Atelier.Presentation.UI.IUIManager);
            var method = type.GetMethod("HideDialog");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IUIManager_ShowLoadingメソッドが定義されている()
        {
            var type = typeof(Atelier.Presentation.UI.IUIManager);
            var method = type.GetMethod("ShowLoading");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IUIManager_HideLoadingメソッドが定義されている()
        {
            var type = typeof(Atelier.Presentation.UI.IUIManager);
            var method = type.GetMethod("HideLoading");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IUIManager_BlockInputメソッドが定義されている()
        {
            var type = typeof(Atelier.Presentation.UI.IUIManager);
            var method = type.GetMethod("BlockInput");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IUIManager_UnblockInputメソッドが定義されている()
        {
            var type = typeof(Atelier.Presentation.UI.IUIManager);
            var method = type.GetMethod("UnblockInput");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IUIManager_IsInputBlockedプロパティが定義されている()
        {
            var type = typeof(Atelier.Presentation.UI.IUIManager);
            var property = type.GetProperty("IsInputBlocked");
            Assert.IsNotNull(property);
        }

        #endregion

        #region UIManager実装テスト

        [Test]
        public void UIManager_IUIManagerを実装している()
        {
            var type = typeof(Atelier.Presentation.UI.UIManager);
            Assert.IsTrue(typeof(Atelier.Presentation.UI.IUIManager).IsAssignableFrom(type));
        }

        #endregion
    }
}
