using System;
using System.Collections.Generic;
using NUnit.Framework;
using Atelier.Application.Events;
using Atelier.Domain.Events;

namespace Atelier.Tests.EditMode.Events
{
    /// <summary>
    /// EventBusのユニットテスト
    /// </summary>
    [TestFixture]
    public class EventBusTests
    {
        private EventBus _eventBus;

        [SetUp]
        public void SetUp()
        {
            _eventBus = new EventBus();
        }

        #region テスト用イベントクラス

        private class TestEvent : IEvent
        {
            public string Message { get; set; }
        }

        private class AnotherTestEvent : IEvent
        {
            public int Value { get; set; }
        }

        #endregion

        #region 発行と購読のテスト

        [Test]
        public void Subscribe_And_Publish_ハンドラが呼び出される()
        {
            // Arrange
            string receivedMessage = null;
            _eventBus.Subscribe<TestEvent>(e => receivedMessage = e.Message);

            // Act
            _eventBus.Publish(new TestEvent { Message = "Hello" });

            // Assert
            Assert.AreEqual("Hello", receivedMessage);
        }

        [Test]
        public void Publish_購読者がいない場合_エラーにならない()
        {
            // Arrange & Act & Assert
            Assert.DoesNotThrow(() => _eventBus.Publish(new TestEvent { Message = "No subscribers" }));
        }

        #endregion

        #region 購読解除のテスト

        [Test]
        public void Unsubscribe_購読解除後はハンドラが呼ばれない()
        {
            // Arrange
            int callCount = 0;
            Action<TestEvent> handler = e => callCount++;
            _eventBus.Subscribe(handler);

            // Act
            _eventBus.Publish(new TestEvent());
            _eventBus.Unsubscribe(handler);
            _eventBus.Publish(new TestEvent());

            // Assert
            Assert.AreEqual(1, callCount);
        }

        [Test]
        public void Unsubscribe_登録されていないハンドラでもエラーにならない()
        {
            // Arrange
            Action<TestEvent> handler = e => { };

            // Act & Assert
            Assert.DoesNotThrow(() => _eventBus.Unsubscribe(handler));
        }

        #endregion

        #region 複数ハンドラのテスト

        [Test]
        public void Subscribe_複数のハンドラが同一イベントを購読できる()
        {
            // Arrange
            var receivedMessages = new List<string>();
            _eventBus.Subscribe<TestEvent>(e => receivedMessages.Add("Handler1: " + e.Message));
            _eventBus.Subscribe<TestEvent>(e => receivedMessages.Add("Handler2: " + e.Message));

            // Act
            _eventBus.Publish(new TestEvent { Message = "Test" });

            // Assert
            Assert.AreEqual(2, receivedMessages.Count);
            Assert.Contains("Handler1: Test", receivedMessages);
            Assert.Contains("Handler2: Test", receivedMessages);
        }

        [Test]
        public void Subscribe_同一ハンドラを複数回登録すると複数回呼ばれる()
        {
            // Arrange
            int callCount = 0;
            Action<TestEvent> handler = e => callCount++;
            _eventBus.Subscribe(handler);
            _eventBus.Subscribe(handler);

            // Act
            _eventBus.Publish(new TestEvent());

            // Assert
            Assert.AreEqual(2, callCount);
        }

        #endregion

        #region 異なるイベント型のテスト

        [Test]
        public void Subscribe_異なるイベント型は独立して処理される()
        {
            // Arrange
            string testEventMessage = null;
            int anotherEventValue = 0;
            _eventBus.Subscribe<TestEvent>(e => testEventMessage = e.Message);
            _eventBus.Subscribe<AnotherTestEvent>(e => anotherEventValue = e.Value);

            // Act
            _eventBus.Publish(new TestEvent { Message = "Hello" });
            _eventBus.Publish(new AnotherTestEvent { Value = 42 });

            // Assert
            Assert.AreEqual("Hello", testEventMessage);
            Assert.AreEqual(42, anotherEventValue);
        }

        [Test]
        public void Publish_異なるイベント型のハンドラは呼ばれない()
        {
            // Arrange
            bool anotherEventHandlerCalled = false;
            _eventBus.Subscribe<AnotherTestEvent>(e => anotherEventHandlerCalled = true);

            // Act
            _eventBus.Publish(new TestEvent { Message = "Hello" });

            // Assert
            Assert.IsFalse(anotherEventHandlerCalled);
        }

        #endregion

        #region イベントデータの保持テスト

        [Test]
        public void Publish_イベントデータが正しく保持される()
        {
            // Arrange
            TestEvent receivedEvent = null;
            _eventBus.Subscribe<TestEvent>(e => receivedEvent = e);
            var publishedEvent = new TestEvent { Message = "Test Message" };

            // Act
            _eventBus.Publish(publishedEvent);

            // Assert
            Assert.IsNotNull(receivedEvent);
            Assert.AreEqual("Test Message", receivedEvent.Message);
            Assert.AreSame(publishedEvent, receivedEvent);
        }

        #endregion
    }
}
