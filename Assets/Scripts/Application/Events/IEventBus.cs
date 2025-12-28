using System;
using Atelier.Domain.Events;

namespace Atelier.Application.Events
{
    /// <summary>
    /// イベントバスインターフェース。
    /// コンポーネント間の疎結合なイベント通信を提供する。
    /// </summary>
    public interface IEventBus
    {
        /// <summary>
        /// イベントを発行する。
        /// </summary>
        /// <typeparam name="T">イベントの型</typeparam>
        /// <param name="eventData">発行するイベントデータ</param>
        void Publish<T>(T eventData) where T : IEvent;

        /// <summary>
        /// イベントを購読する。
        /// </summary>
        /// <typeparam name="T">購読するイベントの型</typeparam>
        /// <param name="handler">イベント発生時に呼び出されるハンドラ</param>
        void Subscribe<T>(Action<T> handler) where T : IEvent;

        /// <summary>
        /// イベントの購読を解除する。
        /// </summary>
        /// <typeparam name="T">購読解除するイベントの型</typeparam>
        /// <param name="handler">解除するハンドラ</param>
        void Unsubscribe<T>(Action<T> handler) where T : IEvent;
    }
}
