using UnityEngine;
using System.Collections.Generic;
using Atelier.Domain;

namespace Atelier.Infrastructure
{
    /// <summary>
    /// 設定データローダー
    /// Resources/Config/からJSONファイルを読み込む
    /// </summary>
    public static class ConfigDataLoader
    {
        private const string ConfigPath = "Config/";

        /// <summary>
        /// カード設定を読み込む
        /// </summary>
        public static CardConfig LoadCardConfig()
        {
            var jsonAsset = Resources.Load<TextAsset>($"{ConfigPath}card_config");

            if (jsonAsset == null)
            {
                Debug.LogWarning("card_config.json not found. Returning empty config.");
                return new CardConfig();
            }

            try
            {
                var config = JsonUtility.FromJson<CardConfigWrapper>(jsonAsset.text);
                return new CardConfig { Cards = config.cards ?? new List<Card>() };
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"Failed to parse card_config.json: {ex.Message}");
                return new CardConfig();
            }
        }

        /// <summary>
        /// 依頼設定を読み込む
        /// </summary>
        public static QuestConfig LoadQuestConfig()
        {
            var jsonAsset = Resources.Load<TextAsset>($"{ConfigPath}quest_config");

            if (jsonAsset == null)
            {
                Debug.LogWarning("quest_config.json not found. Returning empty config.");
                return new QuestConfig();
            }

            try
            {
                var config = JsonUtility.FromJson<QuestConfigWrapper>(jsonAsset.text);
                return new QuestConfig { Quests = config.quests ?? new List<Quest>() };
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"Failed to parse quest_config.json: {ex.Message}");
                return new QuestConfig();
            }
        }

        /// <summary>
        /// 錬金スタイル設定を読み込む
        /// </summary>
        public static AlchemyStyleConfig LoadAlchemyStyleConfig()
        {
            var jsonAsset = Resources.Load<TextAsset>($"{ConfigPath}alchemy_style_config");

            if (jsonAsset == null)
            {
                Debug.LogWarning("alchemy_style_config.json not found. Returning empty config.");
                return new AlchemyStyleConfig();
            }

            try
            {
                var config = JsonUtility.FromJson<AlchemyStyleConfigWrapper>(jsonAsset.text);
                return new AlchemyStyleConfig { Styles = config.styles ?? new List<AlchemyStyle>() };
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"Failed to parse alchemy_style_config.json: {ex.Message}");
                return new AlchemyStyleConfig();
            }
        }

        /// <summary>
        /// マップ生成設定を読み込む
        /// </summary>
        public static MapGenerationConfig LoadMapGenerationConfig()
        {
            var jsonAsset = Resources.Load<TextAsset>($"{ConfigPath}map_generation_config");

            if (jsonAsset == null)
            {
                Debug.LogWarning("map_generation_config.json not found. Returning default config.");
                return CreateDefaultMapGenerationConfig();
            }

            try
            {
                var config = JsonUtility.FromJson<MapGenerationConfigWrapper>(jsonAsset.text);
                return config.mapGeneration ?? CreateDefaultMapGenerationConfig();
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"Failed to parse map_generation_config.json: {ex.Message}");
                return CreateDefaultMapGenerationConfig();
            }
        }

        /// <summary>
        /// デフォルトのマップ生成設定を作成
        /// </summary>
        private static MapGenerationConfig CreateDefaultMapGenerationConfig()
        {
            return new MapGenerationConfig
            {
                MinNodes = 30,
                MaxNodes = 50,
                NodesPerLevel = 5,
                NodeTypeWeights = new NodeTypeWeights
                {
                    Quest = 50,
                    Merchant = 20,
                    Experiment = 15,
                    Monster = 15
                },
                LevelScaling = new LevelScaling
                {
                    BaseDifficulty = 1,
                    DifficultyIncrease = 0.2f
                }
            };
        }

        // JSON解析用ラッパークラス
        [System.Serializable]
        private class CardConfigWrapper
        {
            public List<Card> cards;
        }

        [System.Serializable]
        private class QuestConfigWrapper
        {
            public List<Quest> quests;
        }

        [System.Serializable]
        private class AlchemyStyleConfigWrapper
        {
            public List<AlchemyStyle> styles;
        }

        [System.Serializable]
        private class MapGenerationConfigWrapper
        {
            public MapGenerationConfig mapGeneration;
        }
    }

    /// <summary>
    /// カード設定クラス
    /// </summary>
    [System.Serializable]
    public class CardConfig
    {
        public List<Card> Cards;

        public CardConfig()
        {
            Cards = new List<Card>();
        }
    }

    /// <summary>
    /// 依頼設定クラス
    /// </summary>
    [System.Serializable]
    public class QuestConfig
    {
        public List<Quest> Quests;

        public QuestConfig()
        {
            Quests = new List<Quest>();
        }
    }

    /// <summary>
    /// 錬金スタイル設定クラス
    /// </summary>
    [System.Serializable]
    public class AlchemyStyleConfig
    {
        public List<AlchemyStyle> Styles;

        public AlchemyStyleConfig()
        {
            Styles = new List<AlchemyStyle>();
        }
    }

    /// <summary>
    /// マップ生成設定クラス
    /// </summary>
    [System.Serializable]
    public class MapGenerationConfig
    {
        public int MinNodes { get; set; }
        public int MaxNodes { get; set; }
        public int NodesPerLevel { get; set; }
        public NodeTypeWeights NodeTypeWeights { get; set; }
        public LevelScaling LevelScaling { get; set; }

        public MapGenerationConfig()
        {
            NodeTypeWeights = new NodeTypeWeights();
            LevelScaling = new LevelScaling();
        }
    }

    /// <summary>
    /// ノードタイプの重み
    /// </summary>
    [System.Serializable]
    public class NodeTypeWeights
    {
        public int Quest { get; set; }
        public int Merchant { get; set; }
        public int Experiment { get; set; }
        public int Monster { get; set; }
    }

    /// <summary>
    /// レベルスケーリング
    /// </summary>
    [System.Serializable]
    public class LevelScaling
    {
        public int BaseDifficulty { get; set; }
        public float DifficultyIncrease { get; set; }
    }
}
