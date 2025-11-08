# Phase 6: オーディオシステムタスク

**期間**: Week 1 (2日間)
**総工数**: 16h
**タスク範囲**: TASK-0029
**タスクタイプ**: DIRECT

---

## TASK-0029: AudioManager実装

**タスクID**: TASK-0029
**タスク名**: AudioManager実装
**推定工数**: 16h
**タスクタイプ**: DIRECT
**要件名**: atelier
**要件リンク**: REQ-049, REQ-050

### 依存タスク
- TASK-0002: フォルダ構造作成

### 実装詳細

設計文書 `06-audio.md` のAudioManager実装を参照 🔵

#### AudioManager クラス
```csharp
namespace Atelier.Infrastructure
{
    using UnityEngine;
    using System.Collections.Generic;

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

### オーディオファイル配置

#### BGMファイル
```
Assets/Resources/Audio/BGM/
├── title_theme.wav
├── map_theme.wav
├── quest_battle.wav
├── merchant_theme.wav
└── result_theme.wav
```

#### SEファイル
```
Assets/Resources/Audio/SE/
├── card_play.wav
├── card_draw.wav
├── quest_complete.wav
├── explosion.wav
├── button_click.wav
├── purchase.wav
├── upgrade.wav
└── error.wav
```

### 完了条件
- [ ] BGMが再生できる (REQ-049) 🔵
- [ ] SEが再生できる (REQ-049) 🔵
- [ ] BGM/SEの音量が個別に調整できる (REQ-050) 🔵
- [ ] BGMがフェードイン/フェードアウトする 🔵
- [ ] SEがプール管理される 🔵
- [ ] 同時に複数のSEが再生できる 🔵
- [ ] Resources フォルダから音声ファイルを読み込める 🔵

### テスト要件（DIRECTタスク）
#### 機能テスト
- [ ] BGMを再生して音が出ることを確認
- [ ] SEを再生して音が出ることを確認
- [ ] BGM音量を変更して反映されることを確認
- [ ] SE音量を変更して反映されることを確認
- [ ] BGMフェード機能を目視確認
- [ ] 複数SE同時再生を確認（カードプレイ連続実行）

#### エラーケーステスト
- [ ] 存在しないBGM IDを指定した時の挙動を確認
- [ ] 存在しないSE IDを指定した時の挙動を確認
- [ ] 音声ファイルが存在しない時の挙動を確認

### 実装手順

#### ステップ1: AudioManagerクラスの作成 (4h)
- シングルトン実装
- AudioSource初期化
- SEプール作成

#### ステップ2: BGM再生機能 (4h)
- PlayBGM()実装
- フェードイン/アウト実装
- StopBGM()実装

#### ステップ3: SE再生機能 (3h)
- PlaySE()実装
- SEプール管理
- 同時再生対応

#### ステップ4: 音量調整機能 (2h)
- SetBGMVolume()実装
- SetSEVolume()実装
- 音量設定の永続化（SettingsDataと連携）

#### ステップ5: テストとデバッグ (3h)
- 各機能の動作確認
- エラーケーステスト
- パフォーマンステスト

### 設計上の考慮事項

#### パフォーマンス
- SEプールサイズは10で固定（同時再生上限） 🔵
- BGMはループ再生を使用 🔵
- Resources.Load()は初期化時のみ実行 🔵

#### メモリ管理
- 音声ファイルはすべてメモリに常駐
- シーン切り替え時もDontDestroyOnLoadで保持
- 不要な音声ファイルは定期的にアンロード（将来的な拡張） 🟡

#### エラーハンドリング
- 存在しないIDはログ警告を出力 🔵
- プール枯渇時は最古のSEを上書き 🔵

### 今後の拡張性

#### 将来的に追加可能な機能
- 音声ファイルのストリーミング再生 🟡
- BGMのクロスフェード 🟡
- SE音量の個別調整（重要度別） 🟡
- オーディオミキサー対応 🟡

---

## Phase 6 完了条件

### 全体完了条件
- [ ] TASK-0029が完了している
- [ ] BGM/SEが正常に再生される
- [ ] 音量調整が動作する
- [ ] フェード機能が動作する
- [ ] 機能テストがすべて通る

### 次フェーズへの引き継ぎ事項
- AudioManagerが各シーンで使用可能
- BGM/SEの再生IDが確定している
- 音量設定がSettingsDataと連携可能

### シーン別BGM設定（参考）

| シーン | BGM ID | 説明 |
|-------|--------|------|
| TitleScene | title_theme | タイトル画面用BGM 🟡 |
| MapScene | map_theme | マップ進行用BGM 🟡 |
| QuestScene | quest_battle | 依頼達成(戦闘)用BGM 🟡 |
| MerchantScene | merchant_theme | 商人ノード用BGM 🟡 |
| ResultScene | result_theme | リザルト画面用BGM 🟡 |

### SE設定（参考）

| アクション | SE ID | 説明 |
|----------|-------|------|
| カードプレイ | card_play | カードを使用した時 🟡 |
| カードドロー | card_draw | カードを引いた時 🟡 |
| 依頼達成 | quest_complete | 依頼を達成した時 🟡 |
| 暴発 | explosion | 暴発が発生した時 🟡 |
| ボタンクリック | button_click | UIボタンをクリックした時 🟡 |
| カード購入 | purchase | 商人でカードを購入した時 🟡 |
| カード強化 | upgrade | 商人でカードを強化した時 🟡 |
| エラー | error | 不正な操作を行った時 🟡 |

---

**信頼性レベル凡例**:
- 🔵 青信号: 設計文書から明確
- 🟡 黄信号: 設計文書から妥当な推測
- 🔴 赤信号: 設計文書にない推測
