using System;
using System.Collections.Generic;

namespace Atelier.Domain.Entities
{
    /// <summary>
    /// セーブデータ全体を表すクラス。
    /// プレイヤーの進行状況、メタ情報、現在の走行データを保持する。
    /// </summary>
    [Serializable]
    public class SaveData
    {
        /// <summary>セーブデータのバージョン</summary>
        public string Version { get; set; }

        /// <summary>保存日時</summary>
        public DateTime Timestamp { get; set; }

        /// <summary>プレイヤーデータ</summary>
        public PlayerSaveData Player { get; set; }

        /// <summary>メタ進行データ</summary>
        public MetaSaveData Meta { get; set; }

        /// <summary>現在の走行データ（進行中のランがある場合のみ）</summary>
        public CurrentRunSaveData CurrentRun { get; set; }

        /// <summary>
        /// セーブデータを初期化するコンストラクタ。
        /// </summary>
        public SaveData()
        {
            Version = "1.0";
            Timestamp = DateTime.UtcNow;
            Player = new PlayerSaveData();
            Meta = new MetaSaveData();
            CurrentRun = null;
        }
    }

    /// <summary>
    /// プレイヤーの基本データを表すクラス。
    /// </summary>
    [Serializable]
    public class PlayerSaveData
    {
        /// <summary>所持ゴールド</summary>
        public int Gold { get; set; }

        /// <summary>名声</summary>
        public int Fame { get; set; }

        /// <summary>知識ポイント</summary>
        public int KnowledgePoints { get; set; }

        public PlayerSaveData()
        {
            Gold = 0;
            Fame = 0;
            KnowledgePoints = 0;
        }
    }

    /// <summary>
    /// メタ進行データを表すクラス。
    /// 複数回のプレイを通じて蓄積されるデータ。
    /// </summary>
    [Serializable]
    public class MetaSaveData
    {
        /// <summary>総プレイ時間（秒）</summary>
        public int TotalPlayTime { get; set; }

        /// <summary>完了した走行数</summary>
        public int RunsCompleted { get; set; }

        /// <summary>最高到達アセンションレベル</summary>
        public int HighestAscension { get; set; }

        /// <summary>解放済みカードIDリスト</summary>
        public List<string> UnlockedCards { get; set; }

        /// <summary>解放済みスタイルIDリスト</summary>
        public List<string> UnlockedStyles { get; set; }

        public MetaSaveData()
        {
            TotalPlayTime = 0;
            RunsCompleted = 0;
            HighestAscension = 0;
            UnlockedCards = new List<string>();
            UnlockedStyles = new List<string>();
        }
    }

    /// <summary>
    /// 現在の走行（ラン）データを表すクラス。
    /// 進行中のゲームセッションの状態を保持する。
    /// </summary>
    [Serializable]
    public class CurrentRunSaveData
    {
        /// <summary>選択したスタイルID</summary>
        public string StyleId { get; set; }

        /// <summary>ゲームシード</summary>
        public int Seed { get; set; }

        /// <summary>アセンションレベル</summary>
        public int AscensionLevel { get; set; }

        /// <summary>現在のマップノード</summary>
        public int CurrentNode { get; set; }

        /// <summary>現在のデッキ（カードIDリスト）</summary>
        public List<string> Deck { get; set; }

        /// <summary>現在のターン数</summary>
        public int Turn { get; set; }

        /// <summary>現在のエネルギー</summary>
        public int Energy { get; set; }

        public CurrentRunSaveData()
        {
            StyleId = string.Empty;
            Seed = 0;
            AscensionLevel = 0;
            CurrentNode = 0;
            Deck = new List<string>();
            Turn = 0;
            Energy = 0;
        }
    }
}
