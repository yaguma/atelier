using System;
using System.Collections.Generic;

namespace Atelier.Infrastructure.DataLoaders
{
    /// <summary>
    /// カードマスターデータのルートDTO
    /// </summary>
    [Serializable]
    public class CardMasterDataDto
    {
        public List<CardDto> cards;
    }

    /// <summary>
    /// カードDTO
    /// </summary>
    [Serializable]
    public class CardDto
    {
        public string cardId;
        public string name;
        public string type;
        public string rarity;
        public int cost;
        public CardAttributesDto attributes;
        public int stability;
        public string description;
    }

    /// <summary>
    /// カード属性DTO
    /// </summary>
    [Serializable]
    public class CardAttributesDto
    {
        public int fire;
        public int water;
        public int earth;
        public int wind;
        public int poison;
        public int quality;
    }

    /// <summary>
    /// 依頼マスターデータのルートDTO
    /// </summary>
    [Serializable]
    public class QuestMasterDataDto
    {
        public List<QuestDto> quests;
    }

    /// <summary>
    /// 依頼DTO
    /// </summary>
    [Serializable]
    public class QuestDto
    {
        public string questId;
        public string name;
        public string customer;
        public int difficulty;
        public QuestRequirementsDto requirements;
        public QuestRewardsDto rewards;
    }

    /// <summary>
    /// 依頼要件DTO
    /// </summary>
    [Serializable]
    public class QuestRequirementsDto
    {
        public int fire;
        public int water;
        public int earth;
        public int wind;
        public int quality;
    }

    /// <summary>
    /// 依頼報酬DTO
    /// </summary>
    [Serializable]
    public class QuestRewardsDto
    {
        public int gold;
        public int fame;
    }

    /// <summary>
    /// スタイルマスターデータのルートDTO
    /// </summary>
    [Serializable]
    public class StyleMasterDataDto
    {
        public List<StyleDto> styles;
    }

    /// <summary>
    /// スタイルDTO
    /// </summary>
    [Serializable]
    public class StyleDto
    {
        public string styleId;
        public string name;
        public string description;
        public List<string> startingDeck;
        public StylePassiveBonusDto passiveBonus;
    }

    /// <summary>
    /// スタイルパッシブボーナスDTO
    /// </summary>
    [Serializable]
    public class StylePassiveBonusDto
    {
        public float fireMultiplier;
        public float waterMultiplier;
        public float earthMultiplier;
        public float windMultiplier;
        public float poisonMultiplier;
    }
}
