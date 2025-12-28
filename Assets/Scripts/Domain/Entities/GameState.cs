using System;

namespace Atelier.Domain.Entities
{
    /// <summary>
    /// ゲームの現在状態を管理するクラス。
    /// 現在のフェーズ、ターン数、エネルギーなどを保持する。
    /// </summary>
    public class GameState
    {
        private const int DefaultMaxEnergy = 3;

        /// <summary>
        /// 現在のゲームフェーズ
        /// </summary>
        public GamePhase CurrentPhase { get; private set; }

        /// <summary>
        /// 現在のターン数
        /// </summary>
        public int TurnCount { get; set; }

        /// <summary>
        /// 現在のエネルギー
        /// </summary>
        public int Energy { get; set; }

        /// <summary>
        /// 最大エネルギー
        /// </summary>
        public int MaxEnergy { get; set; }

        /// <summary>
        /// コンストラクタ。初期状態を設定する。
        /// </summary>
        public GameState()
        {
            Reset();
            MaxEnergy = DefaultMaxEnergy;
        }

        /// <summary>
        /// ゲームフェーズを設定する。
        /// </summary>
        /// <param name="phase">設定するフェーズ</param>
        public void SetPhase(GamePhase phase)
        {
            CurrentPhase = phase;
        }

        /// <summary>
        /// ターン数を1増加させる。
        /// </summary>
        public void IncrementTurn()
        {
            TurnCount++;
        }

        /// <summary>
        /// エネルギーを加算する。最大値を超えない。
        /// </summary>
        /// <param name="amount">加算するエネルギー量</param>
        public void AddEnergy(int amount)
        {
            if (amount < 0)
            {
                throw new ArgumentException("Energy amount must be non-negative", nameof(amount));
            }

            Energy = Math.Min(Energy + amount, MaxEnergy);
        }

        /// <summary>
        /// エネルギーを消費する。
        /// </summary>
        /// <param name="amount">消費するエネルギー量</param>
        /// <returns>消費に成功した場合はtrue、エネルギー不足の場合はfalse</returns>
        public bool ConsumeEnergy(int amount)
        {
            if (amount < 0)
            {
                throw new ArgumentException("Energy amount must be non-negative", nameof(amount));
            }

            if (!HasEnoughEnergy(amount))
            {
                return false;
            }

            Energy -= amount;
            return true;
        }

        /// <summary>
        /// 指定したエネルギー量が利用可能かどうかを確認する。
        /// </summary>
        /// <param name="amount">確認するエネルギー量</param>
        /// <returns>十分なエネルギーがある場合はtrue</returns>
        public bool HasEnoughEnergy(int amount)
        {
            return Energy >= amount;
        }

        /// <summary>
        /// エネルギーを最大値まで回復する。
        /// </summary>
        public void RefillEnergy()
        {
            Energy = MaxEnergy;
        }

        /// <summary>
        /// ゲーム状態を初期状態にリセットする。
        /// </summary>
        public void Reset()
        {
            CurrentPhase = GamePhase.Title;
            TurnCount = 0;
            Energy = 0;
        }
    }
}
