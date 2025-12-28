using NUnit.Framework;
using Atelier.Presentation.Audio;

namespace Atelier.Tests.EditMode.Presentation
{
    /// <summary>
    /// AudioManagerのテスト
    /// </summary>
    [TestFixture]
    public class AudioManagerTests
    {
        #region IAudioManager インターフェーステスト

        [Test]
        public void IAudioManager_インターフェースが存在する()
        {
            var type = typeof(IAudioManager);
            Assert.IsNotNull(type);
        }

        [Test]
        public void IAudioManager_PlayBGMメソッドが定義されている()
        {
            var type = typeof(IAudioManager);
            var method = type.GetMethod("PlayBGM");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IAudioManager_StopBGMメソッドが定義されている()
        {
            var type = typeof(IAudioManager);
            var method = type.GetMethod("StopBGM");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IAudioManager_PlaySEメソッドが定義されている()
        {
            var type = typeof(IAudioManager);
            var method = type.GetMethod("PlaySE");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IAudioManager_SetMasterVolumeメソッドが定義されている()
        {
            var type = typeof(IAudioManager);
            var method = type.GetMethod("SetMasterVolume");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IAudioManager_SetBGMVolumeメソッドが定義されている()
        {
            var type = typeof(IAudioManager);
            var method = type.GetMethod("SetBGMVolume");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IAudioManager_SetSEVolumeメソッドが定義されている()
        {
            var type = typeof(IAudioManager);
            var method = type.GetMethod("SetSEVolume");
            Assert.IsNotNull(method);
        }

        [Test]
        public void IAudioManager_MasterVolumeプロパティが定義されている()
        {
            var type = typeof(IAudioManager);
            var property = type.GetProperty("MasterVolume");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(float), property.PropertyType);
        }

        [Test]
        public void IAudioManager_BGMVolumeプロパティが定義されている()
        {
            var type = typeof(IAudioManager);
            var property = type.GetProperty("BGMVolume");
            Assert.IsNotNull(property);
        }

        [Test]
        public void IAudioManager_SEVolumeプロパティが定義されている()
        {
            var type = typeof(IAudioManager);
            var property = type.GetProperty("SEVolume");
            Assert.IsNotNull(property);
        }

        #endregion

        #region AudioManager クラステスト

        [Test]
        public void AudioManager_クラスが存在する()
        {
            var type = typeof(AudioManager);
            Assert.IsNotNull(type);
        }

        [Test]
        public void AudioManager_MonoBehaviourを継承している()
        {
            var type = typeof(AudioManager);
            Assert.IsTrue(typeof(UnityEngine.MonoBehaviour).IsAssignableFrom(type));
        }

        [Test]
        public void AudioManager_IAudioManagerを実装している()
        {
            var type = typeof(AudioManager);
            Assert.IsTrue(typeof(IAudioManager).IsAssignableFrom(type));
        }

        [Test]
        public void AudioManager_Instanceプロパティを持っている()
        {
            var type = typeof(AudioManager);
            var property = type.GetProperty("Instance");
            Assert.IsNotNull(property);
        }

        #endregion
    }
}
