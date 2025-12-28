using System;
using System.IO;
using UnityEngine;
using Atelier.Domain.Entities;

namespace Atelier.Infrastructure.Repositories
{
    /// <summary>
    /// セーブデータの永続化を管理するリポジトリ実装。
    /// Application.persistentDataPathにJSONとして保存する。
    /// </summary>
    public class SaveDataRepository : ISaveDataRepository
    {
        private const string SaveFileName = "savedata.json";
        private const string BackupFileName = "savedata_backup.json";
        private const string CurrentVersion = "1.0";

        private string SaveFilePath => Path.Combine(UnityEngine.Application.persistentDataPath, SaveFileName);
        private string BackupFilePath => Path.Combine(UnityEngine.Application.persistentDataPath, BackupFileName);

        /// <inheritdoc/>
        public bool HasSaveData()
        {
            return File.Exists(SaveFilePath);
        }

        /// <inheritdoc/>
        public SaveData Load()
        {
            if (!HasSaveData())
            {
                Debug.Log("[SaveDataRepository] No save data found.");
                return null;
            }

            try
            {
                var json = File.ReadAllText(SaveFilePath);
                var data = JsonUtility.FromJson<SaveData>(json);

                if (data == null)
                {
                    Debug.LogWarning("[SaveDataRepository] Failed to parse save data. Attempting backup recovery.");
                    return TryLoadBackup();
                }

                // バージョンチェックとマイグレーション
                if (data.Version != CurrentVersion)
                {
                    data = MigrateSaveData(data);
                }

                return data;
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveDataRepository] Error loading save data: {e.Message}");
                return TryLoadBackup();
            }
        }

        /// <inheritdoc/>
        public void Save(SaveData data)
        {
            if (data == null)
            {
                Debug.LogWarning("[SaveDataRepository] Cannot save null data.");
                return;
            }

            try
            {
                // 既存のセーブデータをバックアップ
                if (HasSaveData())
                {
                    CreateBackup();
                }

                data.Timestamp = DateTime.UtcNow;
                data.Version = CurrentVersion;

                var json = JsonUtility.ToJson(data, true);
                File.WriteAllText(SaveFilePath, json);

                Debug.Log("[SaveDataRepository] Save data written successfully.");
            }
            catch (IOException e)
            {
                Debug.LogError($"[SaveDataRepository] IO error while saving: {e.Message}");
                throw;
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveDataRepository] Error saving data: {e.Message}");
                throw;
            }
        }

        /// <inheritdoc/>
        public void Delete()
        {
            try
            {
                if (File.Exists(SaveFilePath))
                {
                    File.Delete(SaveFilePath);
                    Debug.Log("[SaveDataRepository] Save data deleted.");
                }

                if (File.Exists(BackupFilePath))
                {
                    File.Delete(BackupFilePath);
                    Debug.Log("[SaveDataRepository] Backup data deleted.");
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveDataRepository] Error deleting save data: {e.Message}");
                throw;
            }
        }

        /// <summary>
        /// バックアップからのリカバリーを試みる。
        /// </summary>
        private SaveData TryLoadBackup()
        {
            if (!File.Exists(BackupFilePath))
            {
                Debug.LogWarning("[SaveDataRepository] No backup found.");
                return null;
            }

            try
            {
                var json = File.ReadAllText(BackupFilePath);
                var data = JsonUtility.FromJson<SaveData>(json);

                if (data != null)
                {
                    Debug.Log("[SaveDataRepository] Recovered from backup.");
                    // バックアップからリカバリーしたら、それを正規のセーブデータとして保存
                    Save(data);
                }

                return data;
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveDataRepository] Error loading backup: {e.Message}");
                return null;
            }
        }

        /// <summary>
        /// 現在のセーブデータをバックアップする。
        /// </summary>
        private void CreateBackup()
        {
            try
            {
                if (File.Exists(SaveFilePath))
                {
                    File.Copy(SaveFilePath, BackupFilePath, true);
                }
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[SaveDataRepository] Failed to create backup: {e.Message}");
            }
        }

        /// <summary>
        /// セーブデータのマイグレーションを行う。
        /// </summary>
        private SaveData MigrateSaveData(SaveData oldData)
        {
            Debug.Log($"[SaveDataRepository] Migrating save data from version {oldData.Version} to {CurrentVersion}");

            // 将来のバージョンアップ時にマイグレーション処理を追加
            // 現在はバージョン1.0のみなのでそのまま返す
            oldData.Version = CurrentVersion;
            return oldData;
        }
    }
}
