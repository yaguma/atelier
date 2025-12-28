using NUnit.Framework;
using Atelier.Domain.Entities;

namespace Atelier.Tests.EditMode.Domain
{
    /// <summary>
    /// 依頼（クエスト）エンティティのテスト
    /// </summary>
    [TestFixture]
    public class QuestTests
    {
        #region QuestRequirements テスト

        [Test]
        public void QuestRequirements_Fireプロパティを持っている()
        {
            var type = typeof(QuestRequirements);
            var property = type.GetProperty("Fire");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void QuestRequirements_Waterプロパティを持っている()
        {
            var type = typeof(QuestRequirements);
            var property = type.GetProperty("Water");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void QuestRequirements_Earthプロパティを持っている()
        {
            var type = typeof(QuestRequirements);
            var property = type.GetProperty("Earth");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void QuestRequirements_Windプロパティを持っている()
        {
            var type = typeof(QuestRequirements);
            var property = type.GetProperty("Wind");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void QuestRequirements_Qualityプロパティを持っている()
        {
            var type = typeof(QuestRequirements);
            var property = type.GetProperty("Quality");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void QuestRequirements_値を正しく保持する()
        {
            var requirements = new QuestRequirements(10, 5, 0, 0, 8);

            Assert.AreEqual(10, requirements.Fire);
            Assert.AreEqual(5, requirements.Water);
            Assert.AreEqual(0, requirements.Earth);
            Assert.AreEqual(0, requirements.Wind);
            Assert.AreEqual(8, requirements.Quality);
        }

        #endregion

        #region QuestRewards テスト

        [Test]
        public void QuestRewards_Goldプロパティを持っている()
        {
            var type = typeof(QuestRewards);
            var property = type.GetProperty("Gold");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void QuestRewards_Fameプロパティを持っている()
        {
            var type = typeof(QuestRewards);
            var property = type.GetProperty("Fame");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void QuestRewards_値を正しく保持する()
        {
            var rewards = new QuestRewards(100, 10);

            Assert.AreEqual(100, rewards.Gold);
            Assert.AreEqual(10, rewards.Fame);
        }

        #endregion

        #region Quest クラステスト

        [Test]
        public void Quest_クラスが存在する()
        {
            var type = typeof(Quest);
            Assert.IsNotNull(type);
        }

        [Test]
        public void Quest_QuestIdプロパティを持っている()
        {
            var type = typeof(Quest);
            var property = type.GetProperty("QuestId");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void Quest_Nameプロパティを持っている()
        {
            var type = typeof(Quest);
            var property = type.GetProperty("Name");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void Quest_Customerプロパティを持っている()
        {
            var type = typeof(Quest);
            var property = type.GetProperty("Customer");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void Quest_Difficultyプロパティを持っている()
        {
            var type = typeof(Quest);
            var property = type.GetProperty("Difficulty");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void Quest_Requirementsプロパティを持っている()
        {
            var type = typeof(Quest);
            var property = type.GetProperty("Requirements");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(QuestRequirements), property.PropertyType);
        }

        [Test]
        public void Quest_Rewardsプロパティを持っている()
        {
            var type = typeof(Quest);
            var property = type.GetProperty("Rewards");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(QuestRewards), property.PropertyType);
        }

        [Test]
        public void Quest_正しく生成できる()
        {
            var requirements = new QuestRequirements(0, 10, 0, 0, 5);
            var rewards = new QuestRewards(50, 5);
            var quest = new Quest(
                "QUEST_001",
                "回復薬",
                "村人A",
                1,
                requirements,
                rewards
            );

            Assert.AreEqual("QUEST_001", quest.QuestId);
            Assert.AreEqual("回復薬", quest.Name);
            Assert.AreEqual("村人A", quest.Customer);
            Assert.AreEqual(1, quest.Difficulty);
            Assert.AreEqual(10, quest.Requirements.Water);
            Assert.AreEqual(50, quest.Rewards.Gold);
        }

        #endregion

        #region QuestProgress テスト

        [Test]
        public void QuestProgress_クラスが存在する()
        {
            var type = typeof(QuestProgress);
            Assert.IsNotNull(type);
        }

        [Test]
        public void QuestProgress_CurrentAttributesプロパティを持っている()
        {
            var type = typeof(QuestProgress);
            var property = type.GetProperty("CurrentAttributes");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(CardAttributes), property.PropertyType);
        }

        [Test]
        public void QuestProgress_CurrentStabilityプロパティを持っている()
        {
            var type = typeof(QuestProgress);
            var property = type.GetProperty("CurrentStability");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void QuestProgress_HasExplodedプロパティを持っている()
        {
            var type = typeof(QuestProgress);
            var property = type.GetProperty("HasExploded");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(bool), property.PropertyType);
        }

        [Test]
        public void QuestProgress_IsCompletedメソッドを持っている()
        {
            var type = typeof(QuestProgress);
            var method = type.GetMethod("IsCompleted");
            Assert.IsNotNull(method);
        }

        [Test]
        public void QuestProgress_要件を満たすとIsCompletedがtrueを返す()
        {
            var requirements = new QuestRequirements(0, 10, 0, 0, 5);
            var progress = new QuestProgress();
            progress.CurrentAttributes = new CardAttributes(0, 15, 0, 0, 0, 8);
            progress.CurrentStability = 0;
            progress.HasExploded = false;

            Assert.IsTrue(progress.IsCompleted(requirements));
        }

        [Test]
        public void QuestProgress_要件を満たさないとIsCompletedがfalseを返す()
        {
            var requirements = new QuestRequirements(0, 10, 0, 0, 5);
            var progress = new QuestProgress();
            progress.CurrentAttributes = new CardAttributes(0, 5, 0, 0, 0, 3);
            progress.CurrentStability = 0;
            progress.HasExploded = false;

            Assert.IsFalse(progress.IsCompleted(requirements));
        }

        [Test]
        public void QuestProgress_暴発するとIsCompletedがfalseを返す()
        {
            var requirements = new QuestRequirements(0, 10, 0, 0, 5);
            var progress = new QuestProgress();
            progress.CurrentAttributes = new CardAttributes(0, 15, 0, 0, 0, 8);
            progress.CurrentStability = 0;
            progress.HasExploded = true;

            Assert.IsFalse(progress.IsCompleted(requirements));
        }

        [Test]
        public void QuestProgress_属性を加算できる()
        {
            var progress = new QuestProgress();
            progress.AddAttributes(new CardAttributes(5, 0, 0, 0, 0, 2));
            progress.AddAttributes(new CardAttributes(3, 2, 0, 0, 0, 1));

            Assert.AreEqual(8, progress.CurrentAttributes.Fire);
            Assert.AreEqual(2, progress.CurrentAttributes.Water);
            Assert.AreEqual(3, progress.CurrentAttributes.Quality);
        }

        [Test]
        public void QuestProgress_安定度を追加できる()
        {
            var progress = new QuestProgress();
            progress.AddStability(-5);
            progress.AddStability(-3);

            Assert.AreEqual(-8, progress.CurrentStability);
        }

        #endregion
    }
}
