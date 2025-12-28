using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Atelier.Presentation.Audio
{
    /// <summary>
    /// オーディオ管理の実装クラス。
    /// BGM/SEの再生とボリューム管理を行う。
    /// </summary>
    public class AudioManager : MonoBehaviour, IAudioManager
    {
        private const int MaxSimultaneousSE = 8;
        private const string BGMPath = "Audio/BGM/";
        private const string SEPath = "Audio/SE/";

        private static AudioManager _instance;

        [Header("Volume Settings")]
        [SerializeField] private float _masterVolume = 100f;
        [SerializeField] private float _bgmVolume = 100f;
        [SerializeField] private float _seVolume = 100f;

        private AudioSource _bgmSource;
        private List<AudioSource> _seSources;
        private Dictionary<string, AudioClip> _bgmCache;
        private Dictionary<string, AudioClip> _seCache;
        private Coroutine _fadeCoroutine;

        /// <summary>シングルトンインスタンス</summary>
        public static AudioManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    var go = new GameObject("AudioManager");
                    _instance = go.AddComponent<AudioManager>();
                    _instance.Initialize();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        /// <inheritdoc/>
        public float MasterVolume => _masterVolume;

        /// <inheritdoc/>
        public float BGMVolume => _bgmVolume;

        /// <inheritdoc/>
        public float SEVolume => _seVolume;

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            DontDestroyOnLoad(gameObject);
            Initialize();
        }

        private void Initialize()
        {
            // BGM用AudioSourceの作成
            if (_bgmSource == null)
            {
                var bgmGo = new GameObject("BGM");
                bgmGo.transform.SetParent(transform);
                _bgmSource = bgmGo.AddComponent<AudioSource>();
                _bgmSource.playOnAwake = false;
            }

            // SE用AudioSourceの作成
            _seSources = new List<AudioSource>();
            for (int i = 0; i < MaxSimultaneousSE; i++)
            {
                var seGo = new GameObject($"SE_{i}");
                seGo.transform.SetParent(transform);
                var source = seGo.AddComponent<AudioSource>();
                source.playOnAwake = false;
                _seSources.Add(source);
            }

            // キャッシュの初期化
            _bgmCache = new Dictionary<string, AudioClip>();
            _seCache = new Dictionary<string, AudioClip>();
        }

        /// <inheritdoc/>
        public void PlayBGM(string bgmId, bool loop = true)
        {
            if (string.IsNullOrEmpty(bgmId))
            {
                Debug.LogWarning("[AudioManager] Invalid BGM ID");
                return;
            }

            var clip = LoadBGM(bgmId);
            if (clip == null)
            {
                Debug.LogWarning($"[AudioManager] BGM not found: {bgmId}");
                return;
            }

            // フェード中ならキャンセル
            if (_fadeCoroutine != null)
            {
                StopCoroutine(_fadeCoroutine);
                _fadeCoroutine = null;
            }

            _bgmSource.clip = clip;
            _bgmSource.loop = loop;
            _bgmSource.volume = GetBGMVolume();
            _bgmSource.Play();

            Debug.Log($"[AudioManager] Playing BGM: {bgmId}");
        }

        /// <inheritdoc/>
        public void StopBGM(float fadeOutDuration = 0.5f)
        {
            if (_bgmSource == null || !_bgmSource.isPlaying) return;

            if (fadeOutDuration <= 0)
            {
                _bgmSource.Stop();
            }
            else
            {
                if (_fadeCoroutine != null)
                {
                    StopCoroutine(_fadeCoroutine);
                }
                _fadeCoroutine = StartCoroutine(FadeOutBGM(fadeOutDuration));
            }
        }

        private IEnumerator FadeOutBGM(float duration)
        {
            var startVolume = _bgmSource.volume;
            var elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                _bgmSource.volume = Mathf.Lerp(startVolume, 0f, elapsed / duration);
                yield return null;
            }

            _bgmSource.Stop();
            _bgmSource.volume = GetBGMVolume();
            _fadeCoroutine = null;
        }

        /// <inheritdoc/>
        public void PlaySE(string seId)
        {
            if (string.IsNullOrEmpty(seId))
            {
                Debug.LogWarning("[AudioManager] Invalid SE ID");
                return;
            }

            var clip = LoadSE(seId);
            if (clip == null)
            {
                Debug.LogWarning($"[AudioManager] SE not found: {seId}");
                return;
            }

            // 空いているSEソースを探す
            var source = FindAvailableSESource();
            if (source == null)
            {
                Debug.LogWarning("[AudioManager] No available SE source");
                return;
            }

            source.clip = clip;
            source.volume = GetSEVolume();
            source.Play();
        }

        private AudioSource FindAvailableSESource()
        {
            // 再生中でないソースを探す
            foreach (var source in _seSources)
            {
                if (!source.isPlaying)
                {
                    return source;
                }
            }

            // すべて再生中の場合は最初のソースを再利用
            return _seSources.Count > 0 ? _seSources[0] : null;
        }

        /// <inheritdoc/>
        public void SetMasterVolume(float volume)
        {
            _masterVolume = Mathf.Clamp(volume, 0f, 100f);
            UpdateVolumes();
        }

        /// <inheritdoc/>
        public void SetBGMVolume(float volume)
        {
            _bgmVolume = Mathf.Clamp(volume, 0f, 100f);
            if (_bgmSource != null)
            {
                _bgmSource.volume = GetBGMVolume();
            }
        }

        /// <inheritdoc/>
        public void SetSEVolume(float volume)
        {
            _seVolume = Mathf.Clamp(volume, 0f, 100f);
        }

        private void UpdateVolumes()
        {
            if (_bgmSource != null)
            {
                _bgmSource.volume = GetBGMVolume();
            }
        }

        private float GetBGMVolume()
        {
            return (_masterVolume / 100f) * (_bgmVolume / 100f);
        }

        private float GetSEVolume()
        {
            return (_masterVolume / 100f) * (_seVolume / 100f);
        }

        private AudioClip LoadBGM(string bgmId)
        {
            if (_bgmCache.TryGetValue(bgmId, out var cached))
            {
                return cached;
            }

            var clip = Resources.Load<AudioClip>(BGMPath + bgmId);
            if (clip != null)
            {
                _bgmCache[bgmId] = clip;
            }
            return clip;
        }

        private AudioClip LoadSE(string seId)
        {
            if (_seCache.TryGetValue(seId, out var cached))
            {
                return cached;
            }

            var clip = Resources.Load<AudioClip>(SEPath + seId);
            if (clip != null)
            {
                _seCache[seId] = clip;
            }
            return clip;
        }

#if UNITY_EDITOR
        /// <summary>
        /// テスト用にインスタンスをリセットする。
        /// </summary>
        public static void ResetForTesting()
        {
            if (_instance != null)
            {
                DestroyImmediate(_instance.gameObject);
                _instance = null;
            }
        }
#endif
    }
}
