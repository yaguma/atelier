using NUnit.Framework;
using Atelier.Presentation.Scenes;

namespace Atelier.Tests.EditMode.Presentation
{
    /// <summary>
    /// GameSceneManagerのユニットテスト（インターフェースのテスト）
    /// 注意: 実際のシーンロードはPlayModeテストで行う
    /// </summary>
    [TestFixture]
    public class GameSceneTests
    {
        #region GameScene Enum テスト

        [Test]
        public void GameScene_Bootが定義されている()
        {
            Assert.AreEqual(0, (int)GameScene.Boot);
        }

        [Test]
        public void GameScene_Titleが定義されている()
        {
            Assert.AreEqual(1, (int)GameScene.Title);
        }

        [Test]
        public void GameScene_StyleSelectが定義されている()
        {
            Assert.AreEqual(2, (int)GameScene.StyleSelect);
        }

        [Test]
        public void GameScene_Mapが定義されている()
        {
            Assert.AreEqual(3, (int)GameScene.Map);
        }

        [Test]
        public void GameScene_Questが定義されている()
        {
            Assert.AreEqual(4, (int)GameScene.Quest);
        }

        [Test]
        public void GameScene_Merchantが定義されている()
        {
            Assert.AreEqual(5, (int)GameScene.Merchant);
        }

        [Test]
        public void GameScene_Resultが定義されている()
        {
            Assert.AreEqual(6, (int)GameScene.Result);
        }

        [Test]
        public void GameScene_UI設計書の全画面が定義されている()
        {
            // UI設計書に記載された画面: Boot, Title, StyleSelect, Map, Quest, Merchant, Result
            var values = System.Enum.GetValues(typeof(GameScene));
            Assert.AreEqual(7, values.Length);
        }

        #endregion

        #region シーン名変換テスト

        [Test]
        public void GameScene_文字列変換が正しく動作する()
        {
            Assert.AreEqual("Boot", GameScene.Boot.ToString());
            Assert.AreEqual("Title", GameScene.Title.ToString());
            Assert.AreEqual("StyleSelect", GameScene.StyleSelect.ToString());
            Assert.AreEqual("Map", GameScene.Map.ToString());
            Assert.AreEqual("Quest", GameScene.Quest.ToString());
            Assert.AreEqual("Merchant", GameScene.Merchant.ToString());
            Assert.AreEqual("Result", GameScene.Result.ToString());
        }

        [Test]
        public void GameScene_文字列からのパースが正しく動作する()
        {
            Assert.IsTrue(System.Enum.TryParse("Title", out GameScene result));
            Assert.AreEqual(GameScene.Title, result);
        }

        #endregion
    }
}
