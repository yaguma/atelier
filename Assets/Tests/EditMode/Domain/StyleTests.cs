using NUnit.Framework;
using Atelier.Domain.Entities;
using System.Collections.Generic;

namespace Atelier.Tests.EditMode.Domain
{
    /// <summary>
    /// スタイルエンティティのテスト
    /// </summary>
    [TestFixture]
    public class StyleTests
    {
        #region StylePassiveBonus テスト

        [Test]
        public void StylePassiveBonus_クラスが存在する()
        {
            var type = typeof(StylePassiveBonus);
            Assert.IsNotNull(type);
        }

        [Test]
        public void StylePassiveBonus_FireMultiplierプロパティを持っている()
        {
            var type = typeof(StylePassiveBonus);
            var property = type.GetProperty("FireMultiplier");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(float), property.PropertyType);
        }

        [Test]
        public void StylePassiveBonus_WaterMultiplierプロパティを持っている()
        {
            var type = typeof(StylePassiveBonus);
            var property = type.GetProperty("WaterMultiplier");
            Assert.IsNotNull(property);
        }

        [Test]
        public void StylePassiveBonus_値を正しく保持する()
        {
            var bonus = new StylePassiveBonus(1.2f, 1.0f, 1.0f, 1.0f, 1.0f);

            Assert.AreEqual(1.2f, bonus.FireMultiplier, 0.001f);
            Assert.AreEqual(1.0f, bonus.WaterMultiplier, 0.001f);
        }

        [Test]
        public void StylePassiveBonus_デフォルトで全て1倍()
        {
            var bonus = StylePassiveBonus.Default;

            Assert.AreEqual(1.0f, bonus.FireMultiplier, 0.001f);
            Assert.AreEqual(1.0f, bonus.WaterMultiplier, 0.001f);
            Assert.AreEqual(1.0f, bonus.EarthMultiplier, 0.001f);
            Assert.AreEqual(1.0f, bonus.WindMultiplier, 0.001f);
            Assert.AreEqual(1.0f, bonus.PoisonMultiplier, 0.001f);
        }

        #endregion

        #region Style クラステスト

        [Test]
        public void Style_クラスが存在する()
        {
            var type = typeof(Style);
            Assert.IsNotNull(type);
        }

        [Test]
        public void Style_StyleIdプロパティを持っている()
        {
            var type = typeof(Style);
            var property = type.GetProperty("StyleId");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void Style_Nameプロパティを持っている()
        {
            var type = typeof(Style);
            var property = type.GetProperty("Name");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void Style_Descriptionプロパティを持っている()
        {
            var type = typeof(Style);
            var property = type.GetProperty("Description");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void Style_StartingDeckCardIdsプロパティを持っている()
        {
            var type = typeof(Style);
            var property = type.GetProperty("StartingDeckCardIds");
            Assert.IsNotNull(property);
        }

        [Test]
        public void Style_PassiveBonusプロパティを持っている()
        {
            var type = typeof(Style);
            var property = type.GetProperty("PassiveBonus");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(StylePassiveBonus), property.PropertyType);
        }

        [Test]
        public void Style_正しく生成できる()
        {
            var startingDeck = new List<string> { "CARD_001", "CARD_002", "CARD_003" };
            var bonus = new StylePassiveBonus(1.2f, 1.0f, 1.0f, 1.0f, 1.0f);
            var style = new Style(
                "STYLE_001",
                "炎の錬金術師",
                "火属性に特化したスタイル",
                startingDeck,
                bonus
            );

            Assert.AreEqual("STYLE_001", style.StyleId);
            Assert.AreEqual("炎の錬金術師", style.Name);
            Assert.AreEqual("火属性に特化したスタイル", style.Description);
            Assert.AreEqual(3, style.StartingDeckCardIds.Count);
            Assert.AreEqual(1.2f, style.PassiveBonus.FireMultiplier, 0.001f);
        }

        [Test]
        public void Style_初期デッキ情報を取得できる()
        {
            var startingDeck = new List<string> { "CARD_001", "CARD_002" };
            var style = new Style(
                "STYLE_001",
                "炎の錬金術師",
                "",
                startingDeck,
                StylePassiveBonus.Default
            );

            Assert.That(style.StartingDeckCardIds, Does.Contain("CARD_001"));
            Assert.That(style.StartingDeckCardIds, Does.Contain("CARD_002"));
        }

        #endregion
    }
}
