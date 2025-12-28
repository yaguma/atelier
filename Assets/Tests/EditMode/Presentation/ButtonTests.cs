using NUnit.Framework;
using Atelier.Presentation.UI.Components;

namespace Atelier.Tests.EditMode.Presentation
{
    /// <summary>
    /// ボタンコンポーネントのテスト
    /// </summary>
    [TestFixture]
    public class ButtonTests
    {
        #region ButtonType Enum テスト

        [Test]
        public void ButtonType_Primaryが定義されている()
        {
            Assert.AreEqual(0, (int)ButtonType.Primary);
        }

        [Test]
        public void ButtonType_Secondaryが定義されている()
        {
            Assert.AreEqual(1, (int)ButtonType.Secondary);
        }

        [Test]
        public void ButtonType_Dangerが定義されている()
        {
            Assert.AreEqual(2, (int)ButtonType.Danger);
        }

        [Test]
        public void ButtonType_Ghostが定義されている()
        {
            Assert.AreEqual(3, (int)ButtonType.Ghost);
        }

        [Test]
        public void ButtonType_4種類のボタンが定義されている()
        {
            var values = System.Enum.GetValues(typeof(ButtonType));
            Assert.AreEqual(4, values.Length);
        }

        #endregion

        #region GameButton クラステスト

        [Test]
        public void GameButton_クラスが存在する()
        {
            var type = typeof(GameButton);
            Assert.IsNotNull(type);
        }

        [Test]
        public void GameButton_MonoBehaviourを継承している()
        {
            var type = typeof(GameButton);
            Assert.IsTrue(typeof(UnityEngine.MonoBehaviour).IsAssignableFrom(type));
        }

        [Test]
        public void GameButton_IPointerEnterHandlerを実装している()
        {
            var type = typeof(GameButton);
            Assert.IsTrue(typeof(UnityEngine.EventSystems.IPointerEnterHandler).IsAssignableFrom(type));
        }

        [Test]
        public void GameButton_IPointerExitHandlerを実装している()
        {
            var type = typeof(GameButton);
            Assert.IsTrue(typeof(UnityEngine.EventSystems.IPointerExitHandler).IsAssignableFrom(type));
        }

        [Test]
        public void GameButton_IPointerDownHandlerを実装している()
        {
            var type = typeof(GameButton);
            Assert.IsTrue(typeof(UnityEngine.EventSystems.IPointerDownHandler).IsAssignableFrom(type));
        }

        [Test]
        public void GameButton_IPointerUpHandlerを実装している()
        {
            var type = typeof(GameButton);
            Assert.IsTrue(typeof(UnityEngine.EventSystems.IPointerUpHandler).IsAssignableFrom(type));
        }

        [Test]
        public void GameButton_ButtonTypeプロパティを持っている()
        {
            var type = typeof(GameButton);
            var property = type.GetProperty("ButtonType");
            Assert.IsNotNull(property);
        }

        [Test]
        public void GameButton_Interactableプロパティを持っている()
        {
            var type = typeof(GameButton);
            var property = type.GetProperty("Interactable");
            Assert.IsNotNull(property);
        }

        [Test]
        public void GameButton_SetTextメソッドを持っている()
        {
            var type = typeof(GameButton);
            var method = type.GetMethod("SetText");
            Assert.IsNotNull(method);
        }

        #endregion
    }
}
