using System.Collections.Generic;

namespace Atelier.Domain.Entities
{
    /// <summary>
    /// 錬金術スタイルを表すエンティティクラス。
    /// プレイヤーが選択するプレイスタイルを定義する。
    /// </summary>
    public sealed class Style
    {
        /// <summary>スタイルID</summary>
        public string StyleId { get; }

        /// <summary>スタイル名</summary>
        public string Name { get; }

        /// <summary>スタイルの説明</summary>
        public string Description { get; }

        /// <summary>初期デッキに含まれるカードIDのリスト</summary>
        public IReadOnlyList<string> StartingDeckCardIds { get; }

        /// <summary>パッシブボーナス</summary>
        public StylePassiveBonus PassiveBonus { get; }

        /// <summary>
        /// スタイルを生成する。
        /// </summary>
        /// <param name="styleId">スタイルID</param>
        /// <param name="name">スタイル名</param>
        /// <param name="description">説明</param>
        /// <param name="startingDeckCardIds">初期デッキカードID</param>
        /// <param name="passiveBonus">パッシブボーナス</param>
        public Style(
            string styleId,
            string name,
            string description,
            IReadOnlyList<string> startingDeckCardIds,
            StylePassiveBonus passiveBonus)
        {
            StyleId = styleId ?? string.Empty;
            Name = name ?? string.Empty;
            Description = description ?? string.Empty;
            StartingDeckCardIds = startingDeckCardIds ?? new List<string>();
            PassiveBonus = passiveBonus;
        }

        public override string ToString()
        {
            return $"[{StyleId}] {Name} - {Description}";
        }
    }
}
