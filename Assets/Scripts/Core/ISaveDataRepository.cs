using Atelier.Infrastructure;

namespace Atelier.Core
{
    public interface ISaveDataRepository
    {
        SaveData LoadSaveData(int slotIndex);
        void SaveGameData(SaveData data, int slotIndex);
        bool HasSaveData(int slotIndex);
        void DeleteSaveData(int slotIndex);
    }
}
