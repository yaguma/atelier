using NUnit.Framework;
using Atelier.Domain.Entities;

namespace Atelier.Tests.EditMode.Domain
{
    /// <summary>
    /// プレイヤーエンティティのテスト
    /// </summary>
    [TestFixture]
    public class PlayerTests
    {
        #region Player クラステスト

        [Test]
        public void Player_クラスが存在する()
        {
            var type = typeof(Player);
            Assert.IsNotNull(type);
        }

        [Test]
        public void Player_Goldプロパティを持っている()
        {
            var type = typeof(Player);
            var property = type.GetProperty("Gold");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void Player_Fameプロパティを持っている()
        {
            var type = typeof(Player);
            var property = type.GetProperty("Fame");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void Player_KnowledgePointsプロパティを持っている()
        {
            var type = typeof(Player);
            var property = type.GetProperty("KnowledgePoints");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void Player_AddGoldメソッドを持っている()
        {
            var type = typeof(Player);
            var method = type.GetMethod("AddGold");
            Assert.IsNotNull(method);
        }

        [Test]
        public void Player_AddFameメソッドを持っている()
        {
            var type = typeof(Player);
            var method = type.GetMethod("AddFame");
            Assert.IsNotNull(method);
        }

        [Test]
        public void Player_CanAffordメソッドを持っている()
        {
            var type = typeof(Player);
            var method = type.GetMethod("CanAfford");
            Assert.IsNotNull(method);
        }

        [Test]
        public void Player_初期値で生成できる()
        {
            var player = new Player();

            Assert.AreEqual(0, player.Gold);
            Assert.AreEqual(0, player.Fame);
            Assert.AreEqual(0, player.KnowledgePoints);
        }

        [Test]
        public void Player_ゴールドを加算できる()
        {
            var player = new Player();
            player.AddGold(100);
            player.AddGold(50);

            Assert.AreEqual(150, player.Gold);
        }

        [Test]
        public void Player_ゴールドを減算できる()
        {
            var player = new Player();
            player.Gold = 100;
            player.AddGold(-30);

            Assert.AreEqual(70, player.Gold);
        }

        [Test]
        public void Player_名声を加算できる()
        {
            var player = new Player();
            player.AddFame(10);
            player.AddFame(5);

            Assert.AreEqual(15, player.Fame);
        }

        [Test]
        public void Player_購入可能かを判定できる()
        {
            var player = new Player();
            player.Gold = 100;

            Assert.IsTrue(player.CanAfford(50));
            Assert.IsTrue(player.CanAfford(100));
            Assert.IsFalse(player.CanAfford(101));
        }

        [Test]
        public void Player_支払いができる()
        {
            var player = new Player();
            player.Gold = 100;

            var result = player.TrySpend(30);

            Assert.IsTrue(result);
            Assert.AreEqual(70, player.Gold);
        }

        [Test]
        public void Player_残高不足では支払いできない()
        {
            var player = new Player();
            player.Gold = 50;

            var result = player.TrySpend(100);

            Assert.IsFalse(result);
            Assert.AreEqual(50, player.Gold);
        }

        #endregion
    }
}
