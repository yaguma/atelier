# オーディオシステム

このドキュメントではゲームの音声管理システムについて説明するのだ。BGMとSE（効果音）を一元管理し、フェードイン・フェードアウトなどの処理も行うのだ。

## オーディオシステム (AudioManager)

### AudioManager (Infrastructure Layer) - REQ-049, REQ-050

```csharp
namespace Atelier.Infrastructure
{
    using UnityEngine;
    using System.Collections.Generic;

    /// <summary>
    /// オーディオ管理システム - BGM・SE管理
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [Header("Audio Sources")]
        private AudioSource bgmSource;
        private List<AudioSource> seSourcePool;
        private const int SEPoolSize = 10;

        [Header("Audio Clips")]
        private Dictionary<string, AudioClip> bgmClips;
        private Dictionary<string, AudioClip> seClips;

        [Header("Volume Settings")]
        private float bgmVolume = 0.7f;
        private float seVolume = 0.8f;

        private string currentBGMId;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeAudioSources();
            LoadAudioClips();
        }

        private void InitializeAudioSources()
        {
            // BGM用AudioSource
            bgmSource = gameObject.AddComponent<AudioSource>();
            bgmSource.loop = true;
            bgmSource.playOnAwake = false;
            bgmSource.volume = bgmVolume;

            // SE用AudioSourceプール
            seSourcePool = new List<AudioSource>();
            for (int i = 0; i < SEPoolSize; i++)
            {
                var seSource = gameObject.AddComponent<AudioSource>();
                seSource.playOnAwake = false;
                seSource.volume = seVolume;
                seSourcePool.Add(seSource);
            }
        }

        private void LoadAudioClips()
        {
            bgmClips = new Dictionary<string, AudioClip>();
            seClips = new Dictionary<string, AudioClip>();

            // Resources フォルダから読み込み
            LoadClipsFromResources("Audio/BGM", bgmClips);
            LoadClipsFromResources("Audio/SE", seClips);
        }

        private void LoadClipsFromResources(string path, Dictionary<string, AudioClip> dictionary)
        {
            var clips = Resources.LoadAll<AudioClip>(path);
            foreach (var clip in clips)
            {
                dictionary[clip.name] = clip;
            }
        }

        /// <summary>
        /// BGMを再生
        /// </summary>
        public void PlayBGM(string bgmId, bool fade = true)
        {
            if (currentBGMId == bgmId && bgmSource.isPlaying)
                return;

            if (bgmClips.TryGetValue(bgmId, out AudioClip clip))
            {
                if (fade && bgmSource.isPlaying)
                {
                    StartCoroutine(FadeOutAndPlayBGM(clip, bgmId));
                }
                else
                {
                    bgmSource.clip = clip;
                    bgmSource.Play();
                    currentBGMId = bgmId;
                }
            }
            else
            {
                Debug.LogWarning($"BGM not found: {bgmId}");
            }
        }

        /// <summary>
        /// SEを再生
        /// </summary>
        public void PlaySE(string seId)
        {
            if (seClips.TryGetValue(seId, out AudioClip clip))
            {
                var availableSource = GetAvailableSESource();
                if (availableSource != null)
                {
                    availableSource.PlayOneShot(clip);
                }
            }
            else
            {
                Debug.LogWarning($"SE not found: {seId}");
            }
        }

        private AudioSource GetAvailableSESource()
        {
            foreach (var source in seSourcePool)
            {
                if (!source.isPlaying)
                    return source;
            }
            return seSourcePool[0]; // フォールバック
        }

        /// <summary>
        /// BGM音量を設定
        /// </summary>
        public void SetBGMVolume(float volume)
        {
            bgmVolume = Mathf.Clamp01(volume);
            bgmSource.volume = bgmVolume;
        }

        /// <summary>
        /// SE音量を設定
        /// </summary>
        public void SetSEVolume(float volume)
        {
            seVolume = Mathf.Clamp01(volume);
            foreach (var source in seSourcePool)
            {
                source.volume = seVolume;
            }
        }

        /// <summary>
        /// BGMを停止
        /// </summary>
        public void StopBGM(bool fade = true)
        {
            if (fade)
            {
                StartCoroutine(FadeOutBGM());
            }
            else
            {
                bgmSource.Stop();
                currentBGMId = null;
            }
        }

        private System.Collections.IEnumerator FadeOutAndPlayBGM(AudioClip newClip, string newBgmId)
        {
            float fadeTime = 1.0f;
            float elapsedTime = 0f;
            float startVolume = bgmSource.volume;

            while (elapsedTime < fadeTime)
            {
                elapsedTime += Time.deltaTime;
                bgmSource.volume = Mathf.Lerp(startVolume, 0f, elapsedTime / fadeTime);
                yield return null;
            }

            bgmSource.Stop();
            bgmSource.clip = newClip;
            bgmSource.volume = bgmVolume;
            bgmSource.Play();
            currentBGMId = newBgmId;
        }

        private System.Collections.IEnumerator FadeOutBGM()
        {
            float fadeTime = 1.0f;
            float elapsedTime = 0f;
            float startVolume = bgmSource.volume;

            while (elapsedTime < fadeTime)
            {
                elapsedTime += Time.deltaTime;
                bgmSource.volume = Mathf.Lerp(startVolume, 0f, elapsedTime / fadeTime);
                yield return null;
            }

            bgmSource.Stop();
            bgmSource.volume = bgmVolume;
            currentBGMId = null;
        }

        public float GetBGMVolume() => bgmVolume;
        public float GetSEVolume() => seVolume;
    }
}
```
