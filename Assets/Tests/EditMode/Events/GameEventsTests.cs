using NUnit.Framework;
using Atelier.Application.Events;
using Atelier.Domain.Events;

namespace Atelier.Tests.EditMode.Events
{
    /// <summary>
    /// ゲームイベントのユニットテスト
    /// </summary>
    [TestFixture]
    public class GameEventsTests
    {
        private EventBus _eventBus;

        [SetUp]
        public void SetUp()
        {
            _eventBus = new EventBus();
        }

        #region CardPlayedEvent テスト

        [Test]
        public void CardPlayedEvent_正しく生成できる()
        {
            // Arrange & Act
            var evt = new CardPlayedEvent
            {
                CardId = "card_001",
                CardName = "火の鉱石",
                PlayerId = "player_1",
                QuestId = "quest_001"
            };

            // Assert
            Assert.AreEqual("card_001", evt.CardId);
            Assert.AreEqual("火の鉱石", evt.CardName);
            Assert.AreEqual("player_1", evt.PlayerId);
            Assert.AreEqual("quest_001", evt.QuestId);
        }

        [Test]
        public void CardPlayedEvent_EventBus経由で発行購読できる()
        {
            // Arrange
            CardPlayedEvent receivedEvent = null;
            _eventBus.Subscribe<CardPlayedEvent>(e => receivedEvent = e);

            // Act
            _eventBus.Publish(new CardPlayedEvent { CardId = "card_002", CardName = "水の草" });

            // Assert
            Assert.IsNotNull(receivedEvent);
            Assert.AreEqual("card_002", receivedEvent.CardId);
        }

        #endregion

        #region QuestCompletedEvent テスト

        [Test]
        public void QuestCompletedEvent_正しく生成できる()
        {
            // Arrange & Act
            var evt = new QuestCompletedEvent
            {
                QuestId = "quest_001",
                QuestName = "回復薬の依頼",
                GoldReward = 100,
                FameReward = 10
            };

            // Assert
            Assert.AreEqual("quest_001", evt.QuestId);
            Assert.AreEqual("回復薬の依頼", evt.QuestName);
            Assert.AreEqual(100, evt.GoldReward);
            Assert.AreEqual(10, evt.FameReward);
        }

        [Test]
        public void QuestCompletedEvent_EventBus経由で発行購読できる()
        {
            // Arrange
            QuestCompletedEvent receivedEvent = null;
            _eventBus.Subscribe<QuestCompletedEvent>(e => receivedEvent = e);

            // Act
            _eventBus.Publish(new QuestCompletedEvent { QuestId = "quest_002" });

            // Assert
            Assert.IsNotNull(receivedEvent);
        }

        #endregion

        #region TurnStartedEvent テスト

        [Test]
        public void TurnStartedEvent_正しく生成できる()
        {
            // Arrange & Act
            var evt = new TurnStartedEvent
            {
                TurnNumber = 5,
                CurrentEnergy = 3,
                MaxEnergy = 3
            };

            // Assert
            Assert.AreEqual(5, evt.TurnNumber);
            Assert.AreEqual(3, evt.CurrentEnergy);
            Assert.AreEqual(3, evt.MaxEnergy);
        }

        [Test]
        public void TurnStartedEvent_EventBus経由で発行購読できる()
        {
            // Arrange
            TurnStartedEvent receivedEvent = null;
            _eventBus.Subscribe<TurnStartedEvent>(e => receivedEvent = e);

            // Act
            _eventBus.Publish(new TurnStartedEvent { TurnNumber = 1 });

            // Assert
            Assert.IsNotNull(receivedEvent);
        }

        #endregion

        #region TurnEndedEvent テスト

        [Test]
        public void TurnEndedEvent_正しく生成できる()
        {
            // Arrange & Act
            var evt = new TurnEndedEvent
            {
                TurnNumber = 3,
                CardsPlayed = 2
            };

            // Assert
            Assert.AreEqual(3, evt.TurnNumber);
            Assert.AreEqual(2, evt.CardsPlayed);
        }

        [Test]
        public void TurnEndedEvent_EventBus経由で発行購読できる()
        {
            // Arrange
            TurnEndedEvent receivedEvent = null;
            _eventBus.Subscribe<TurnEndedEvent>(e => receivedEvent = e);

            // Act
            _eventBus.Publish(new TurnEndedEvent { TurnNumber = 2 });

            // Assert
            Assert.IsNotNull(receivedEvent);
        }

        #endregion

        #region ExplosionEvent テスト

        [Test]
        public void ExplosionEvent_正しく生成できる()
        {
            // Arrange & Act
            var evt = new ExplosionEvent
            {
                QuestId = "quest_001",
                StabilityBefore = 30,
                StabilityAfter = -5,
                TriggerCardId = "card_dangerous"
            };

            // Assert
            Assert.AreEqual("quest_001", evt.QuestId);
            Assert.AreEqual(30, evt.StabilityBefore);
            Assert.AreEqual(-5, evt.StabilityAfter);
            Assert.AreEqual("card_dangerous", evt.TriggerCardId);
        }

        [Test]
        public void ExplosionEvent_EventBus経由で発行購読できる()
        {
            // Arrange
            ExplosionEvent receivedEvent = null;
            _eventBus.Subscribe<ExplosionEvent>(e => receivedEvent = e);

            // Act
            _eventBus.Publish(new ExplosionEvent { QuestId = "quest_003" });

            // Assert
            Assert.IsNotNull(receivedEvent);
        }

        #endregion

        #region GameOverEvent テスト

        [Test]
        public void GameOverEvent_正しく生成できる()
        {
            // Arrange & Act
            var evt = new GameOverEvent
            {
                IsVictory = true,
                TotalGold = 500,
                TotalFame = 50,
                QuestsCompleted = 10
            };

            // Assert
            Assert.IsTrue(evt.IsVictory);
            Assert.AreEqual(500, evt.TotalGold);
            Assert.AreEqual(50, evt.TotalFame);
            Assert.AreEqual(10, evt.QuestsCompleted);
        }

        [Test]
        public void GameOverEvent_EventBus経由で発行購読できる()
        {
            // Arrange
            GameOverEvent receivedEvent = null;
            _eventBus.Subscribe<GameOverEvent>(e => receivedEvent = e);

            // Act
            _eventBus.Publish(new GameOverEvent { IsVictory = false });

            // Assert
            Assert.IsNotNull(receivedEvent);
            Assert.IsFalse(receivedEvent.IsVictory);
        }

        #endregion
    }
}
