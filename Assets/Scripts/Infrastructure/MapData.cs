namespace Atelier.Infrastructure
{
    [System.Serializable]
    public class MapData
    {
        public int CurrentFloor { get; set; }
        public string[] CompletedNodeIds { get; set; }
    }
}
