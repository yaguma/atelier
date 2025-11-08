namespace Atelier.Infrastructure
{
    [System.Serializable]
    public class SaveData
    {
        public int Version { get; set; }
        public string SaveDate { get; set; }
        public int SlotIndex { get; set; }
        public RunData CurrentRun { get; set; }
        public MetaProgressionData MetaData { get; set; }
        public SettingsData Settings { get; set; }
    }
}
