using NUnit.Framework;
using Atelier.Domain.Entities;

namespace Atelier.Tests.EditMode.Domain
{
    /// <summary>
    /// カードエンティティのテスト
    /// </summary>
    [TestFixture]
    public class CardTests
    {
        #region CardType Enum テスト

        [Test]
        public void CardType_Materialが定義されている()
        {
            Assert.AreEqual(0, (int)CardType.Material);
        }

        [Test]
        public void CardType_Toolが定義されている()
        {
            Assert.AreEqual(1, (int)CardType.Tool);
        }

        [Test]
        public void CardType_Techniqueが定義されている()
        {
            Assert.AreEqual(2, (int)CardType.Technique);
        }

        [Test]
        public void CardType_Catalystが定義されている()
        {
            Assert.AreEqual(3, (int)CardType.Catalyst);
        }

        [Test]
        public void CardType_4種類が定義されている()
        {
            var values = System.Enum.GetValues(typeof(CardType));
            Assert.AreEqual(4, values.Length);
        }

        #endregion

        #region CardRarity Enum テスト

        [Test]
        public void CardRarity_Commonが定義されている()
        {
            Assert.AreEqual(0, (int)CardRarity.Common);
        }

        [Test]
        public void CardRarity_Uncommonが定義されている()
        {
            Assert.AreEqual(1, (int)CardRarity.Uncommon);
        }

        [Test]
        public void CardRarity_Rareが定義されている()
        {
            Assert.AreEqual(2, (int)CardRarity.Rare);
        }

        [Test]
        public void CardRarity_Epicが定義されている()
        {
            Assert.AreEqual(3, (int)CardRarity.Epic);
        }

        [Test]
        public void CardRarity_Legendaryが定義されている()
        {
            Assert.AreEqual(4, (int)CardRarity.Legendary);
        }

        [Test]
        public void CardRarity_5種類が定義されている()
        {
            var values = System.Enum.GetValues(typeof(CardRarity));
            Assert.AreEqual(5, values.Length);
        }

        #endregion

        #region CardAttributes テスト

        [Test]
        public void CardAttributes_Fireプロパティを持っている()
        {
            var type = typeof(CardAttributes);
            var property = type.GetProperty("Fire");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void CardAttributes_Waterプロパティを持っている()
        {
            var type = typeof(CardAttributes);
            var property = type.GetProperty("Water");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void CardAttributes_Earthプロパティを持っている()
        {
            var type = typeof(CardAttributes);
            var property = type.GetProperty("Earth");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void CardAttributes_Windプロパティを持っている()
        {
            var type = typeof(CardAttributes);
            var property = type.GetProperty("Wind");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void CardAttributes_Poisonプロパティを持っている()
        {
            var type = typeof(CardAttributes);
            var property = type.GetProperty("Poison");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void CardAttributes_Qualityプロパティを持っている()
        {
            var type = typeof(CardAttributes);
            var property = type.GetProperty("Quality");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void CardAttributes_値を正しく保持する()
        {
            var attributes = new CardAttributes(5, 3, 2, 1, 0, 10);

            Assert.AreEqual(5, attributes.Fire);
            Assert.AreEqual(3, attributes.Water);
            Assert.AreEqual(2, attributes.Earth);
            Assert.AreEqual(1, attributes.Wind);
            Assert.AreEqual(0, attributes.Poison);
            Assert.AreEqual(10, attributes.Quality);
        }

        [Test]
        public void CardAttributes_デフォルトコンストラクタで全て0()
        {
            var attributes = new CardAttributes();

            Assert.AreEqual(0, attributes.Fire);
            Assert.AreEqual(0, attributes.Water);
            Assert.AreEqual(0, attributes.Earth);
            Assert.AreEqual(0, attributes.Wind);
            Assert.AreEqual(0, attributes.Poison);
            Assert.AreEqual(0, attributes.Quality);
        }

        [Test]
        public void CardAttributes_合計値を計算できる()
        {
            var attributes = new CardAttributes(5, 3, 2, 1, 4, 10);
            var total = attributes.TotalElemental;

            Assert.AreEqual(15, total); // 5+3+2+1+4
        }

        #endregion

        #region Card クラステスト

        [Test]
        public void Card_クラスが存在する()
        {
            var type = typeof(Card);
            Assert.IsNotNull(type);
        }

        [Test]
        public void Card_CardIdプロパティを持っている()
        {
            var type = typeof(Card);
            var property = type.GetProperty("CardId");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void Card_Nameプロパティを持っている()
        {
            var type = typeof(Card);
            var property = type.GetProperty("Name");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void Card_Typeプロパティを持っている()
        {
            var type = typeof(Card);
            var property = type.GetProperty("Type");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(CardType), property.PropertyType);
        }

        [Test]
        public void Card_Rarityプロパティを持っている()
        {
            var type = typeof(Card);
            var property = type.GetProperty("Rarity");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(CardRarity), property.PropertyType);
        }

        [Test]
        public void Card_Costプロパティを持っている()
        {
            var type = typeof(Card);
            var property = type.GetProperty("Cost");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void Card_Attributesプロパティを持っている()
        {
            var type = typeof(Card);
            var property = type.GetProperty("Attributes");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(CardAttributes), property.PropertyType);
        }

        [Test]
        public void Card_Stabilityプロパティを持っている()
        {
            var type = typeof(Card);
            var property = type.GetProperty("Stability");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void Card_Descriptionプロパティを持っている()
        {
            var type = typeof(Card);
            var property = type.GetProperty("Description");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void Card_正しく生成できる()
        {
            var attributes = new CardAttributes(5, 0, 0, 0, 0, 2);
            var card = new Card(
                "CARD_001",
                "火の鉱石",
                CardType.Material,
                CardRarity.Common,
                1,
                attributes,
                0,
                "基本的な火属性素材"
            );

            Assert.AreEqual("CARD_001", card.CardId);
            Assert.AreEqual("火の鉱石", card.Name);
            Assert.AreEqual(CardType.Material, card.Type);
            Assert.AreEqual(CardRarity.Common, card.Rarity);
            Assert.AreEqual(1, card.Cost);
            Assert.AreEqual(5, card.Attributes.Fire);
            Assert.AreEqual(0, card.Stability);
            Assert.AreEqual("基本的な火属性素材", card.Description);
        }

        [Test]
        public void Card_不変オブジェクトとして動作する()
        {
            var type = typeof(Card);

            // CardIdプロパティがセッターを持たないことを確認
            var cardIdProperty = type.GetProperty("CardId");
            Assert.IsNotNull(cardIdProperty);
            Assert.IsNull(cardIdProperty.GetSetMethod(true)); // privateセッターも含めて確認

            // Nameプロパティがセッターを持たないことを確認
            var nameProperty = type.GetProperty("Name");
            Assert.IsNotNull(nameProperty);
            Assert.IsNull(nameProperty.GetSetMethod(true));
        }

        #endregion
    }
}
