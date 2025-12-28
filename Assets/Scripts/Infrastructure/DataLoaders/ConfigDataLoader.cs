using System;
using System.Collections.Generic;
using UnityEngine;
using Atelier.Domain.Entities;

namespace Atelier.Infrastructure.DataLoaders
{
    /// <summary>
    /// マスターデータをResourcesから読み込むローダークラス。
    /// </summary>
    public class ConfigDataLoader
    {
        private const string CardsPath = "MasterData/cards";
        private const string QuestsPath = "MasterData/quests";
        private const string StylesPath = "MasterData/styles";

        private List<Card> _cachedCards;
        private List<Quest> _cachedQuests;
        private List<Style> _cachedStyles;

        /// <summary>
        /// すべてのカードを読み込む。
        /// </summary>
        /// <returns>カードのリスト</returns>
        public List<Card> LoadAllCards()
        {
            if (_cachedCards != null)
            {
                return _cachedCards;
            }

            try
            {
                var textAsset = Resources.Load<TextAsset>(CardsPath);
                if (textAsset == null)
                {
                    Debug.LogError($"[ConfigDataLoader] Failed to load cards from {CardsPath}");
                    return new List<Card>();
                }

                var dto = JsonUtility.FromJson<CardMasterDataDto>(textAsset.text);
                if (dto?.cards == null)
                {
                    Debug.LogError("[ConfigDataLoader] Failed to parse cards JSON");
                    return new List<Card>();
                }

                _cachedCards = new List<Card>();
                foreach (var cardDto in dto.cards)
                {
                    var card = MapToCard(cardDto);
                    if (card != null)
                    {
                        _cachedCards.Add(card);
                    }
                }

                Debug.Log($"[ConfigDataLoader] Loaded {_cachedCards.Count} cards");
                return _cachedCards;
            }
            catch (Exception e)
            {
                Debug.LogError($"[ConfigDataLoader] Error loading cards: {e.Message}");
                return new List<Card>();
            }
        }

        /// <summary>
        /// すべての依頼を読み込む。
        /// </summary>
        /// <returns>依頼のリスト</returns>
        public List<Quest> LoadAllQuests()
        {
            if (_cachedQuests != null)
            {
                return _cachedQuests;
            }

            try
            {
                var textAsset = Resources.Load<TextAsset>(QuestsPath);
                if (textAsset == null)
                {
                    Debug.LogError($"[ConfigDataLoader] Failed to load quests from {QuestsPath}");
                    return new List<Quest>();
                }

                var dto = JsonUtility.FromJson<QuestMasterDataDto>(textAsset.text);
                if (dto?.quests == null)
                {
                    Debug.LogError("[ConfigDataLoader] Failed to parse quests JSON");
                    return new List<Quest>();
                }

                _cachedQuests = new List<Quest>();
                foreach (var questDto in dto.quests)
                {
                    var quest = MapToQuest(questDto);
                    if (quest != null)
                    {
                        _cachedQuests.Add(quest);
                    }
                }

                Debug.Log($"[ConfigDataLoader] Loaded {_cachedQuests.Count} quests");
                return _cachedQuests;
            }
            catch (Exception e)
            {
                Debug.LogError($"[ConfigDataLoader] Error loading quests: {e.Message}");
                return new List<Quest>();
            }
        }

        /// <summary>
        /// すべてのスタイルを読み込む。
        /// </summary>
        /// <returns>スタイルのリスト</returns>
        public List<Style> LoadAllStyles()
        {
            if (_cachedStyles != null)
            {
                return _cachedStyles;
            }

            try
            {
                var textAsset = Resources.Load<TextAsset>(StylesPath);
                if (textAsset == null)
                {
                    Debug.LogError($"[ConfigDataLoader] Failed to load styles from {StylesPath}");
                    return new List<Style>();
                }

                var dto = JsonUtility.FromJson<StyleMasterDataDto>(textAsset.text);
                if (dto?.styles == null)
                {
                    Debug.LogError("[ConfigDataLoader] Failed to parse styles JSON");
                    return new List<Style>();
                }

                _cachedStyles = new List<Style>();
                foreach (var styleDto in dto.styles)
                {
                    var style = MapToStyle(styleDto);
                    if (style != null)
                    {
                        _cachedStyles.Add(style);
                    }
                }

                Debug.Log($"[ConfigDataLoader] Loaded {_cachedStyles.Count} styles");
                return _cachedStyles;
            }
            catch (Exception e)
            {
                Debug.LogError($"[ConfigDataLoader] Error loading styles: {e.Message}");
                return new List<Style>();
            }
        }

        /// <summary>
        /// IDでカードを取得する。
        /// </summary>
        /// <param name="cardId">カードID</param>
        /// <returns>カード、見つからない場合はnull</returns>
        public Card GetCardById(string cardId)
        {
            var cards = LoadAllCards();
            return cards.Find(c => c.CardId == cardId);
        }

        /// <summary>
        /// IDで依頼を取得する。
        /// </summary>
        /// <param name="questId">依頼ID</param>
        /// <returns>依頼、見つからない場合はnull</returns>
        public Quest GetQuestById(string questId)
        {
            var quests = LoadAllQuests();
            return quests.Find(q => q.QuestId == questId);
        }

        /// <summary>
        /// IDでスタイルを取得する。
        /// </summary>
        /// <param name="styleId">スタイルID</param>
        /// <returns>スタイル、見つからない場合はnull</returns>
        public Style GetStyleById(string styleId)
        {
            var styles = LoadAllStyles();
            return styles.Find(s => s.StyleId == styleId);
        }

        /// <summary>
        /// キャッシュをクリアする。
        /// </summary>
        public void ClearCache()
        {
            _cachedCards = null;
            _cachedQuests = null;
            _cachedStyles = null;
        }

        #region Mapping Methods

        private Card MapToCard(CardDto dto)
        {
            if (dto == null) return null;

            var attributes = new CardAttributes(
                dto.attributes?.fire ?? 0,
                dto.attributes?.water ?? 0,
                dto.attributes?.earth ?? 0,
                dto.attributes?.wind ?? 0,
                dto.attributes?.poison ?? 0,
                dto.attributes?.quality ?? 0
            );

            var cardType = ParseCardType(dto.type);
            var cardRarity = ParseCardRarity(dto.rarity);

            return new Card(
                dto.cardId,
                dto.name,
                cardType,
                cardRarity,
                dto.cost,
                attributes,
                dto.stability,
                dto.description
            );
        }

        private Quest MapToQuest(QuestDto dto)
        {
            if (dto == null) return null;

            var requirements = new QuestRequirements(
                dto.requirements?.fire ?? 0,
                dto.requirements?.water ?? 0,
                dto.requirements?.earth ?? 0,
                dto.requirements?.wind ?? 0,
                dto.requirements?.quality ?? 0
            );

            var rewards = new QuestRewards(
                dto.rewards?.gold ?? 0,
                dto.rewards?.fame ?? 0
            );

            return new Quest(
                dto.questId,
                dto.name,
                dto.customer,
                dto.difficulty,
                requirements,
                rewards
            );
        }

        private Style MapToStyle(StyleDto dto)
        {
            if (dto == null) return null;

            var passiveBonus = new StylePassiveBonus(
                dto.passiveBonus?.fireMultiplier ?? 1.0f,
                dto.passiveBonus?.waterMultiplier ?? 1.0f,
                dto.passiveBonus?.earthMultiplier ?? 1.0f,
                dto.passiveBonus?.windMultiplier ?? 1.0f,
                dto.passiveBonus?.poisonMultiplier ?? 1.0f
            );

            return new Style(
                dto.styleId,
                dto.name,
                dto.description,
                dto.startingDeck ?? new List<string>(),
                passiveBonus
            );
        }

        private CardType ParseCardType(string typeStr)
        {
            if (Enum.TryParse<CardType>(typeStr, true, out var result))
            {
                return result;
            }
            Debug.LogWarning($"[ConfigDataLoader] Unknown card type: {typeStr}");
            return CardType.Material;
        }

        private CardRarity ParseCardRarity(string rarityStr)
        {
            if (Enum.TryParse<CardRarity>(rarityStr, true, out var result))
            {
                return result;
            }
            Debug.LogWarning($"[ConfigDataLoader] Unknown card rarity: {rarityStr}");
            return CardRarity.Common;
        }

        #endregion
    }
}
