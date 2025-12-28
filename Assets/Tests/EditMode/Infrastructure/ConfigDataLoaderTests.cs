using NUnit.Framework;
using Atelier.Infrastructure.DataLoaders;
using Atelier.Domain.Entities;

namespace Atelier.Tests.EditMode.Infrastructure
{
    /// <summary>
    /// ConfigDataLoaderのテスト
    /// </summary>
    [TestFixture]
    public class ConfigDataLoaderTests
    {
        #region ConfigDataLoader クラステスト

        [Test]
        public void ConfigDataLoader_クラスが存在する()
        {
            var type = typeof(ConfigDataLoader);
            Assert.IsNotNull(type);
        }

        [Test]
        public void ConfigDataLoader_LoadAllCardsメソッドを持っている()
        {
            var type = typeof(ConfigDataLoader);
            var method = type.GetMethod("LoadAllCards");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ConfigDataLoader_LoadAllQuestsメソッドを持っている()
        {
            var type = typeof(ConfigDataLoader);
            var method = type.GetMethod("LoadAllQuests");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ConfigDataLoader_LoadAllStylesメソッドを持っている()
        {
            var type = typeof(ConfigDataLoader);
            var method = type.GetMethod("LoadAllStyles");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ConfigDataLoader_GetCardByIdメソッドを持っている()
        {
            var type = typeof(ConfigDataLoader);
            var method = type.GetMethod("GetCardById");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ConfigDataLoader_GetQuestByIdメソッドを持っている()
        {
            var type = typeof(ConfigDataLoader);
            var method = type.GetMethod("GetQuestById");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ConfigDataLoader_GetStyleByIdメソッドを持っている()
        {
            var type = typeof(ConfigDataLoader);
            var method = type.GetMethod("GetStyleById");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ConfigDataLoader_ClearCacheメソッドを持っている()
        {
            var type = typeof(ConfigDataLoader);
            var method = type.GetMethod("ClearCache");
            Assert.IsNotNull(method);
        }

        #endregion

        #region DTO クラステスト

        [Test]
        public void CardMasterDataDto_クラスが存在する()
        {
            var type = typeof(CardMasterDataDto);
            Assert.IsNotNull(type);
        }

        [Test]
        public void CardDto_クラスが存在する()
        {
            var type = typeof(CardDto);
            Assert.IsNotNull(type);
        }

        [Test]
        public void QuestMasterDataDto_クラスが存在する()
        {
            var type = typeof(QuestMasterDataDto);
            Assert.IsNotNull(type);
        }

        [Test]
        public void QuestDto_クラスが存在する()
        {
            var type = typeof(QuestDto);
            Assert.IsNotNull(type);
        }

        [Test]
        public void StyleMasterDataDto_クラスが存在する()
        {
            var type = typeof(StyleMasterDataDto);
            Assert.IsNotNull(type);
        }

        [Test]
        public void StyleDto_クラスが存在する()
        {
            var type = typeof(StyleDto);
            Assert.IsNotNull(type);
        }

        #endregion

        #region CardDto フィールドテスト

        [Test]
        public void CardDto_cardIdフィールドを持っている()
        {
            var type = typeof(CardDto);
            var field = type.GetField("cardId");
            Assert.IsNotNull(field);
            Assert.AreEqual(typeof(string), field.FieldType);
        }

        [Test]
        public void CardDto_nameフィールドを持っている()
        {
            var type = typeof(CardDto);
            var field = type.GetField("name");
            Assert.IsNotNull(field);
        }

        [Test]
        public void CardDto_typeフィールドを持っている()
        {
            var type = typeof(CardDto);
            var field = type.GetField("type");
            Assert.IsNotNull(field);
        }

        [Test]
        public void CardDto_attributesフィールドを持っている()
        {
            var type = typeof(CardDto);
            var field = type.GetField("attributes");
            Assert.IsNotNull(field);
            Assert.AreEqual(typeof(CardAttributesDto), field.FieldType);
        }

        #endregion

        #region QuestDto フィールドテスト

        [Test]
        public void QuestDto_questIdフィールドを持っている()
        {
            var type = typeof(QuestDto);
            var field = type.GetField("questId");
            Assert.IsNotNull(field);
        }

        [Test]
        public void QuestDto_requirementsフィールドを持っている()
        {
            var type = typeof(QuestDto);
            var field = type.GetField("requirements");
            Assert.IsNotNull(field);
            Assert.AreEqual(typeof(QuestRequirementsDto), field.FieldType);
        }

        [Test]
        public void QuestDto_rewardsフィールドを持っている()
        {
            var type = typeof(QuestDto);
            var field = type.GetField("rewards");
            Assert.IsNotNull(field);
            Assert.AreEqual(typeof(QuestRewardsDto), field.FieldType);
        }

        #endregion

        #region StyleDto フィールドテスト

        [Test]
        public void StyleDto_styleIdフィールドを持っている()
        {
            var type = typeof(StyleDto);
            var field = type.GetField("styleId");
            Assert.IsNotNull(field);
        }

        [Test]
        public void StyleDto_startingDeckフィールドを持っている()
        {
            var type = typeof(StyleDto);
            var field = type.GetField("startingDeck");
            Assert.IsNotNull(field);
        }

        [Test]
        public void StyleDto_passiveBonusフィールドを持っている()
        {
            var type = typeof(StyleDto);
            var field = type.GetField("passiveBonus");
            Assert.IsNotNull(field);
            Assert.AreEqual(typeof(StylePassiveBonusDto), field.FieldType);
        }

        #endregion
    }
}
