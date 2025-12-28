using System;
using System.Collections.Generic;

namespace Atelier.Infrastructure
{
    /// <summary>
    /// サービスロケーターパターンの実装。
    /// アプリケーション全体で共有されるサービスインスタンスを管理する。
    /// </summary>
    public static class ServiceLocator
    {
        private static readonly Dictionary<Type, object> _services = new Dictionary<Type, object>();
        private static readonly object _lock = new object();

        /// <summary>
        /// サービスインスタンスを登録する。
        /// </summary>
        /// <typeparam name="T">サービスの型</typeparam>
        /// <param name="instance">登録するインスタンス</param>
        /// <exception cref="ArgumentNullException">instanceがnullの場合</exception>
        public static void Register<T>(T instance)
        {
            if (instance == null)
            {
                throw new ArgumentNullException(nameof(instance));
            }

            var type = typeof(T);
            lock (_lock)
            {
                _services[type] = instance;
            }
        }

        /// <summary>
        /// サービスインスタンスを取得する。
        /// </summary>
        /// <typeparam name="T">取得するサービスの型</typeparam>
        /// <returns>登録されたサービスインスタンス</returns>
        /// <exception cref="InvalidOperationException">サービスが登録されていない場合</exception>
        public static T Get<T>()
        {
            var type = typeof(T);
            lock (_lock)
            {
                if (_services.TryGetValue(type, out var service))
                {
                    return (T)service;
                }
            }

            throw new InvalidOperationException($"Service of type {type.Name} is not registered.");
        }

        /// <summary>
        /// サービスインスタンスを取得する。登録されていない場合はnullを返す。
        /// </summary>
        /// <typeparam name="T">取得するサービスの型</typeparam>
        /// <returns>登録されたサービスインスタンス、または登録されていない場合はdefault</returns>
        public static T GetOrDefault<T>()
        {
            var type = typeof(T);
            lock (_lock)
            {
                if (_services.TryGetValue(type, out var service))
                {
                    return (T)service;
                }
            }

            return default;
        }

        /// <summary>
        /// 指定した型のサービスが登録されているかどうかを確認する。
        /// </summary>
        /// <typeparam name="T">確認するサービスの型</typeparam>
        /// <returns>登録されている場合はtrue</returns>
        public static bool IsRegistered<T>()
        {
            var type = typeof(T);
            lock (_lock)
            {
                return _services.ContainsKey(type);
            }
        }

        /// <summary>
        /// 指定した型のサービスを登録解除する。
        /// </summary>
        /// <typeparam name="T">登録解除するサービスの型</typeparam>
        /// <returns>登録解除に成功した場合はtrue</returns>
        public static bool Unregister<T>()
        {
            var type = typeof(T);
            lock (_lock)
            {
                return _services.Remove(type);
            }
        }

        /// <summary>
        /// 登録されているすべてのサービスをクリアする。
        /// 主にテスト用。
        /// </summary>
        public static void Clear()
        {
            lock (_lock)
            {
                _services.Clear();
            }
        }
    }
}
