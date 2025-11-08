using System;
using System.IO;
using UnityEngine;
using Newtonsoft.Json;
using Atelier.Core;

namespace Atelier.Infrastructure
{
    public class SaveDataRepository : ISaveDataRepository
    {
        private const string SaveFolderName = "SaveData";
        private const string SaveFilePrefix = "save_slot_";
        private const string SaveFileExtension = ".json";
        private const int MaxSlots = 3;

        private string SaveFolderPath => Path.Combine(Application.persistentDataPath, SaveFolderName);

        public SaveDataRepository()
        {
            // セーブフォルダが存在しない場合は作成
            if (!Directory.Exists(SaveFolderPath))
            {
                Directory.CreateDirectory(SaveFolderPath);
            }
        }

        public SaveData LoadSaveData(int slotIndex)
        {
            ValidateSlotIndex(slotIndex);

            string filePath = GetSaveFilePath(slotIndex);

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"Save data not found in slot {slotIndex}");
            }

            try
            {
                string json = File.ReadAllText(filePath);
                SaveData saveData = JsonConvert.DeserializeObject<SaveData>(json);

                if (saveData == null)
                {
                    throw new InvalidDataException($"Failed to deserialize save data from slot {slotIndex}");
                }

                return saveData;
            }
            catch (JsonException ex)
            {
                Debug.LogError($"Failed to parse save data from slot {slotIndex}: {ex.Message}");
                throw new InvalidDataException($"Save data is corrupted in slot {slotIndex}", ex);
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to load save data from slot {slotIndex}: {ex.Message}");
                throw;
            }
        }

        public void SaveGameData(SaveData data, int slotIndex)
        {
            ValidateSlotIndex(slotIndex);

            if (data == null)
            {
                throw new ArgumentNullException(nameof(data), "Save data cannot be null");
            }

            try
            {
                // セーブデータの基本情報を更新
                data.SlotIndex = slotIndex;
                data.SaveDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

                string json = JsonConvert.SerializeObject(data, Formatting.Indented);
                string filePath = GetSaveFilePath(slotIndex);

                File.WriteAllText(filePath, json);
                Debug.Log($"Save data saved to slot {slotIndex}");
            }
            catch (IOException ex)
            {
                Debug.LogError($"Failed to save data to slot {slotIndex}: {ex.Message}");
                throw new IOException($"Failed to save data. Check disk space.", ex);
            }
            catch (Exception ex)
            {
                Debug.LogError($"Unexpected error while saving to slot {slotIndex}: {ex.Message}");
                throw;
            }
        }

        public bool HasSaveData(int slotIndex)
        {
            ValidateSlotIndex(slotIndex);
            return File.Exists(GetSaveFilePath(slotIndex));
        }

        public void DeleteSaveData(int slotIndex)
        {
            ValidateSlotIndex(slotIndex);

            string filePath = GetSaveFilePath(slotIndex);

            if (File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                    Debug.Log($"Save data deleted from slot {slotIndex}");
                }
                catch (Exception ex)
                {
                    Debug.LogError($"Failed to delete save data from slot {slotIndex}: {ex.Message}");
                    throw;
                }
            }
        }

        private string GetSaveFilePath(int slotIndex)
        {
            return Path.Combine(SaveFolderPath, $"{SaveFilePrefix}{slotIndex}{SaveFileExtension}");
        }

        private void ValidateSlotIndex(int slotIndex)
        {
            if (slotIndex < 0 || slotIndex >= MaxSlots)
            {
                throw new ArgumentOutOfRangeException(nameof(slotIndex),
                    $"Slot index must be between 0 and {MaxSlots - 1}");
            }
        }
    }
}
