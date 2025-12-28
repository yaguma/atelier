using Atelier.Domain.Entities;

namespace Atelier.Infrastructure.Repositories
{
    /// <summary>
    /// セーブデータの永続化を管理するリポジトリインターフェース。
    /// </summary>
    public interface ISaveDataRepository
    {
        /// <summary>
        /// セーブデータが存在するかを確認する。
        /// </summary>
        /// <returns>セーブデータが存在する場合はtrue</returns>
        bool HasSaveData();

        /// <summary>
        /// セーブデータを読み込む。
        /// </summary>
        /// <returns>読み込んだセーブデータ。存在しない場合はnull</returns>
        SaveData Load();

        /// <summary>
        /// セーブデータを保存する。
        /// </summary>
        /// <param name="data">保存するセーブデータ</param>
        void Save(SaveData data);

        /// <summary>
        /// セーブデータを削除する。
        /// </summary>
        void Delete();
    }
}
