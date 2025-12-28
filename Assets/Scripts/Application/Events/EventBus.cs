using System;
using System.Collections.Generic;
using Atelier.Domain.Events;

namespace Atelier.Application.Events
{
    /// <summary>
    /// EventBusの実装クラス。
    /// コンポーネント間の疎結合なイベント通信を提供する。
    /// </summary>
    public class EventBus : IEventBus
    {
        private readonly Dictionary<Type, List<Delegate>> _handlers = new Dictionary<Type, List<Delegate>>();
        private readonly object _lock = new object();

        /// <inheritdoc/>
        public void Publish<T>(T eventData) where T : IEvent
        {
            if (eventData == null)
            {
                throw new ArgumentNullException(nameof(eventData));
            }

            var eventType = typeof(T);
            List<Delegate> handlersCopy;

            lock (_lock)
            {
                if (!_handlers.TryGetValue(eventType, out var handlers))
                {
                    return;
                }
                handlersCopy = new List<Delegate>(handlers);
            }

            foreach (var handler in handlersCopy)
            {
                ((Action<T>)handler)(eventData);
            }
        }

        /// <inheritdoc/>
        public void Subscribe<T>(Action<T> handler) where T : IEvent
        {
            if (handler == null)
            {
                throw new ArgumentNullException(nameof(handler));
            }

            var eventType = typeof(T);

            lock (_lock)
            {
                if (!_handlers.TryGetValue(eventType, out var handlers))
                {
                    handlers = new List<Delegate>();
                    _handlers[eventType] = handlers;
                }
                handlers.Add(handler);
            }
        }

        /// <inheritdoc/>
        public void Unsubscribe<T>(Action<T> handler) where T : IEvent
        {
            if (handler == null)
            {
                throw new ArgumentNullException(nameof(handler));
            }

            var eventType = typeof(T);

            lock (_lock)
            {
                if (_handlers.TryGetValue(eventType, out var handlers))
                {
                    handlers.Remove(handler);
                    if (handlers.Count == 0)
                    {
                        _handlers.Remove(eventType);
                    }
                }
            }
        }

        /// <summary>
        /// すべてのハンドラを解除する。
        /// テスト用またはリセット時に使用。
        /// </summary>
        public void Clear()
        {
            lock (_lock)
            {
                _handlers.Clear();
            }
        }
    }
}
