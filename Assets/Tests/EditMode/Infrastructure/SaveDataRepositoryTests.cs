using NUnit.Framework;
using Atelier.Infrastructure.Repositories;
using Atelier.Domain.Entities;
using System;

namespace Atelier.Tests.EditMode.Infrastructure
{
    /// <summary>
    /// SaveDataRepositoryのテスト
    /// </summary>
    [TestFixture]
    public class SaveDataRepositoryTests
    {
        #region ISaveDataRepository インターフェーステスト

        [Test]
        public void ISaveDataRepository_インターフェースが存在する()
        {
            var type = typeof(ISaveDataRepository);
            Assert.IsNotNull(type);
        }

        [Test]
        public void ISaveDataRepository_HasSaveDataメソッドが定義されている()
        {
            var type = typeof(ISaveDataRepository);
            var method = type.GetMethod("HasSaveData");
            Assert.IsNotNull(method);
            Assert.AreEqual(typeof(bool), method.ReturnType);
        }

        [Test]
        public void ISaveDataRepository_Loadメソッドが定義されている()
        {
            var type = typeof(ISaveDataRepository);
            var method = type.GetMethod("Load");
            Assert.IsNotNull(method);
            Assert.AreEqual(typeof(SaveData), method.ReturnType);
        }

        [Test]
        public void ISaveDataRepository_Saveメソッドが定義されている()
        {
            var type = typeof(ISaveDataRepository);
            var method = type.GetMethod("Save");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ISaveDataRepository_Deleteメソッドが定義されている()
        {
            var type = typeof(ISaveDataRepository);
            var method = type.GetMethod("Delete");
            Assert.IsNotNull(method);
        }

        #endregion

        #region SaveData クラステスト

        [Test]
        public void SaveData_クラスが存在する()
        {
            var type = typeof(SaveData);
            Assert.IsNotNull(type);
        }

        [Test]
        public void SaveData_Versionプロパティを持っている()
        {
            var type = typeof(SaveData);
            var property = type.GetProperty("Version");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void SaveData_Timestampプロパティを持っている()
        {
            var type = typeof(SaveData);
            var property = type.GetProperty("Timestamp");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(DateTime), property.PropertyType);
        }

        [Test]
        public void SaveData_Playerプロパティを持っている()
        {
            var type = typeof(SaveData);
            var property = type.GetProperty("Player");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(PlayerSaveData), property.PropertyType);
        }

        [Test]
        public void SaveData_Metaプロパティを持っている()
        {
            var type = typeof(SaveData);
            var property = type.GetProperty("Meta");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(MetaSaveData), property.PropertyType);
        }

        [Test]
        public void SaveData_CurrentRunプロパティを持っている()
        {
            var type = typeof(SaveData);
            var property = type.GetProperty("CurrentRun");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(CurrentRunSaveData), property.PropertyType);
        }

        [Test]
        public void SaveData_初期値で生成できる()
        {
            var saveData = new SaveData();

            Assert.IsNotNull(saveData.Version);
            Assert.IsNotNull(saveData.Player);
            Assert.IsNotNull(saveData.Meta);
        }

        #endregion

        #region PlayerSaveData テスト

        [Test]
        public void PlayerSaveData_Goldプロパティを持っている()
        {
            var type = typeof(PlayerSaveData);
            var property = type.GetProperty("Gold");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void PlayerSaveData_Fameプロパティを持っている()
        {
            var type = typeof(PlayerSaveData);
            var property = type.GetProperty("Fame");
            Assert.IsNotNull(property);
        }

        [Test]
        public void PlayerSaveData_KnowledgePointsプロパティを持っている()
        {
            var type = typeof(PlayerSaveData);
            var property = type.GetProperty("KnowledgePoints");
            Assert.IsNotNull(property);
        }

        #endregion

        #region MetaSaveData テスト

        [Test]
        public void MetaSaveData_TotalPlayTimeプロパティを持っている()
        {
            var type = typeof(MetaSaveData);
            var property = type.GetProperty("TotalPlayTime");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(int), property.PropertyType);
        }

        [Test]
        public void MetaSaveData_RunsCompletedプロパティを持っている()
        {
            var type = typeof(MetaSaveData);
            var property = type.GetProperty("RunsCompleted");
            Assert.IsNotNull(property);
        }

        [Test]
        public void MetaSaveData_HighestAscensionプロパティを持っている()
        {
            var type = typeof(MetaSaveData);
            var property = type.GetProperty("HighestAscension");
            Assert.IsNotNull(property);
        }

        #endregion

        #region CurrentRunSaveData テスト

        [Test]
        public void CurrentRunSaveData_StyleIdプロパティを持っている()
        {
            var type = typeof(CurrentRunSaveData);
            var property = type.GetProperty("StyleId");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(string), property.PropertyType);
        }

        [Test]
        public void CurrentRunSaveData_Seedプロパティを持っている()
        {
            var type = typeof(CurrentRunSaveData);
            var property = type.GetProperty("Seed");
            Assert.IsNotNull(property);
        }

        [Test]
        public void CurrentRunSaveData_CurrentNodeプロパティを持っている()
        {
            var type = typeof(CurrentRunSaveData);
            var property = type.GetProperty("CurrentNode");
            Assert.IsNotNull(property);
        }

        #endregion

        #region SaveDataRepository クラステスト

        [Test]
        public void SaveDataRepository_クラスが存在する()
        {
            var type = typeof(SaveDataRepository);
            Assert.IsNotNull(type);
        }

        [Test]
        public void SaveDataRepository_ISaveDataRepositoryを実装している()
        {
            var type = typeof(SaveDataRepository);
            Assert.IsTrue(typeof(ISaveDataRepository).IsAssignableFrom(type));
        }

        #endregion
    }
}
