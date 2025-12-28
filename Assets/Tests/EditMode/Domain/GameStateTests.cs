using NUnit.Framework;
using Atelier.Domain.Entities;

namespace Atelier.Tests.EditMode.Domain
{
    /// <summary>
    /// GameStateのユニットテスト
    /// </summary>
    [TestFixture]
    public class GameStateTests
    {
        private GameState _gameState;

        [SetUp]
        public void SetUp()
        {
            _gameState = new GameState();
        }

        #region 初期状態テスト

        [Test]
        public void 初期状態_フェーズはTitleである()
        {
            Assert.AreEqual(GamePhase.Title, _gameState.CurrentPhase);
        }

        [Test]
        public void 初期状態_ターン数は0である()
        {
            Assert.AreEqual(0, _gameState.TurnCount);
        }

        [Test]
        public void 初期状態_エネルギーは0である()
        {
            Assert.AreEqual(0, _gameState.Energy);
        }

        [Test]
        public void 初期状態_最大エネルギーは3である()
        {
            Assert.AreEqual(3, _gameState.MaxEnergy);
        }

        #endregion

        #region フェーズ遷移テスト

        [Test]
        public void SetPhase_フェーズが正しく変更される()
        {
            // Act
            _gameState.SetPhase(GamePhase.StyleSelect);

            // Assert
            Assert.AreEqual(GamePhase.StyleSelect, _gameState.CurrentPhase);
        }

        [Test]
        public void SetPhase_すべてのフェーズに遷移できる()
        {
            var phases = new[]
            {
                GamePhase.Title,
                GamePhase.StyleSelect,
                GamePhase.Map,
                GamePhase.Quest,
                GamePhase.Merchant,
                GamePhase.Result
            };

            foreach (var phase in phases)
            {
                _gameState.SetPhase(phase);
                Assert.AreEqual(phase, _gameState.CurrentPhase, $"Failed to set phase to {phase}");
            }
        }

        #endregion

        #region ターン数テスト

        [Test]
        public void IncrementTurn_ターン数が1増加する()
        {
            // Arrange
            _gameState.TurnCount = 5;

            // Act
            _gameState.IncrementTurn();

            // Assert
            Assert.AreEqual(6, _gameState.TurnCount);
        }

        [Test]
        public void TurnCount_直接設定できる()
        {
            // Act
            _gameState.TurnCount = 10;

            // Assert
            Assert.AreEqual(10, _gameState.TurnCount);
        }

        #endregion

        #region エネルギー管理テスト

        [Test]
        public void AddEnergy_エネルギーが正しく加算される()
        {
            // Arrange
            _gameState.Energy = 0;

            // Act
            _gameState.AddEnergy(2);

            // Assert
            Assert.AreEqual(2, _gameState.Energy);
        }

        [Test]
        public void AddEnergy_最大値を超えない()
        {
            // Arrange
            _gameState.Energy = 2;
            _gameState.MaxEnergy = 3;

            // Act
            _gameState.AddEnergy(5);

            // Assert
            Assert.AreEqual(3, _gameState.Energy);
        }

        [Test]
        public void ConsumeEnergy_エネルギーが正しく減少する()
        {
            // Arrange
            _gameState.Energy = 3;

            // Act
            var result = _gameState.ConsumeEnergy(2);

            // Assert
            Assert.IsTrue(result);
            Assert.AreEqual(1, _gameState.Energy);
        }

        [Test]
        public void ConsumeEnergy_不足時はfalseを返しエネルギーは変化しない()
        {
            // Arrange
            _gameState.Energy = 1;

            // Act
            var result = _gameState.ConsumeEnergy(2);

            // Assert
            Assert.IsFalse(result);
            Assert.AreEqual(1, _gameState.Energy);
        }

        [Test]
        public void HasEnoughEnergy_十分なエネルギーがある場合trueを返す()
        {
            // Arrange
            _gameState.Energy = 3;

            // Assert
            Assert.IsTrue(_gameState.HasEnoughEnergy(2));
            Assert.IsTrue(_gameState.HasEnoughEnergy(3));
        }

        [Test]
        public void HasEnoughEnergy_エネルギーが不足している場合falseを返す()
        {
            // Arrange
            _gameState.Energy = 1;

            // Assert
            Assert.IsFalse(_gameState.HasEnoughEnergy(2));
        }

        [Test]
        public void RefillEnergy_エネルギーが最大値まで回復する()
        {
            // Arrange
            _gameState.Energy = 1;
            _gameState.MaxEnergy = 3;

            // Act
            _gameState.RefillEnergy();

            // Assert
            Assert.AreEqual(3, _gameState.Energy);
        }

        [Test]
        public void SetMaxEnergy_最大エネルギーを設定できる()
        {
            // Act
            _gameState.MaxEnergy = 5;

            // Assert
            Assert.AreEqual(5, _gameState.MaxEnergy);
        }

        #endregion

        #region リセットテスト

        [Test]
        public void Reset_すべての値が初期状態に戻る()
        {
            // Arrange
            _gameState.SetPhase(GamePhase.Quest);
            _gameState.TurnCount = 10;
            _gameState.Energy = 5;

            // Act
            _gameState.Reset();

            // Assert
            Assert.AreEqual(GamePhase.Title, _gameState.CurrentPhase);
            Assert.AreEqual(0, _gameState.TurnCount);
            Assert.AreEqual(0, _gameState.Energy);
        }

        #endregion
    }
}
