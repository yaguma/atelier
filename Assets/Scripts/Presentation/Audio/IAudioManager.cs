namespace Atelier.Presentation.Audio
{
    /// <summary>
    /// オーディオ管理のインターフェース。
    /// BGM/SEの再生とボリューム管理を提供する。
    /// </summary>
    public interface IAudioManager
    {
        /// <summary>マスターボリューム (0-100)</summary>
        float MasterVolume { get; }

        /// <summary>BGMボリューム (0-100)</summary>
        float BGMVolume { get; }

        /// <summary>SEボリューム (0-100)</summary>
        float SEVolume { get; }

        /// <summary>
        /// BGMを再生する。
        /// </summary>
        /// <param name="bgmId">BGM ID</param>
        /// <param name="loop">ループ再生するか</param>
        void PlayBGM(string bgmId, bool loop = true);

        /// <summary>
        /// BGMを停止する。
        /// </summary>
        /// <param name="fadeOutDuration">フェードアウト時間（秒）</param>
        void StopBGM(float fadeOutDuration = 0.5f);

        /// <summary>
        /// SEを再生する。
        /// </summary>
        /// <param name="seId">SE ID</param>
        void PlaySE(string seId);

        /// <summary>
        /// マスターボリュームを設定する。
        /// </summary>
        /// <param name="volume">ボリューム (0-100)</param>
        void SetMasterVolume(float volume);

        /// <summary>
        /// BGMボリュームを設定する。
        /// </summary>
        /// <param name="volume">ボリューム (0-100)</param>
        void SetBGMVolume(float volume);

        /// <summary>
        /// SEボリュームを設定する。
        /// </summary>
        /// <param name="volume">ボリューム (0-100)</param>
        void SetSEVolume(float volume);
    }
}
