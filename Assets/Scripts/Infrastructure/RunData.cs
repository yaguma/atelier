namespace Atelier.Infrastructure
{
    [System.Serializable]
    public class RunData
    {
        public string StyleId { get; set; }
        public int? Seed { get; set; }
        public int CurrentFloor { get; set; }
        public int Gold { get; set; }
        public DeckData DeckData { get; set; }
        public MapData MapData { get; set; }
    }
}
