using System;
using NUnit.Framework;
using Atelier.Infrastructure;

namespace Atelier.Tests.EditMode.Infrastructure
{
    /// <summary>
    /// ServiceLocatorのユニットテスト
    /// </summary>
    [TestFixture]
    public class ServiceLocatorTests
    {
        [SetUp]
        public void SetUp()
        {
            ServiceLocator.Clear();
        }

        [TearDown]
        public void TearDown()
        {
            ServiceLocator.Clear();
        }

        #region テスト用インターフェースとクラス

        private interface ITestService
        {
            string GetValue();
        }

        private class TestService : ITestService
        {
            public string Value { get; set; } = "TestValue";
            public string GetValue() => Value;
        }

        private interface IAnotherService
        {
            int GetNumber();
        }

        private class AnotherService : IAnotherService
        {
            public int Number { get; set; } = 42;
            public int GetNumber() => Number;
        }

        #endregion

        #region Register テスト

        [Test]
        public void Register_サービスを登録できる()
        {
            // Arrange
            var service = new TestService();

            // Act
            ServiceLocator.Register<ITestService>(service);

            // Assert
            Assert.IsTrue(ServiceLocator.IsRegistered<ITestService>());
        }

        [Test]
        public void Register_同じ型で上書き登録できる()
        {
            // Arrange
            var service1 = new TestService { Value = "First" };
            var service2 = new TestService { Value = "Second" };

            // Act
            ServiceLocator.Register<ITestService>(service1);
            ServiceLocator.Register<ITestService>(service2);
            var result = ServiceLocator.Get<ITestService>();

            // Assert
            Assert.AreEqual("Second", result.GetValue());
        }

        [Test]
        public void Register_nullを渡すと例外が発生する()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() =>
                ServiceLocator.Register<ITestService>(null));
        }

        #endregion

        #region Get テスト

        [Test]
        public void Get_登録されたサービスを取得できる()
        {
            // Arrange
            var service = new TestService { Value = "Hello" };
            ServiceLocator.Register<ITestService>(service);

            // Act
            var result = ServiceLocator.Get<ITestService>();

            // Assert
            Assert.AreEqual("Hello", result.GetValue());
        }

        [Test]
        public void Get_登録されていない場合は例外が発生する()
        {
            // Act & Assert
            Assert.Throws<InvalidOperationException>(() =>
                ServiceLocator.Get<ITestService>());
        }

        [Test]
        public void Get_異なる型のサービスを独立して取得できる()
        {
            // Arrange
            var testService = new TestService { Value = "Test" };
            var anotherService = new AnotherService { Number = 100 };
            ServiceLocator.Register<ITestService>(testService);
            ServiceLocator.Register<IAnotherService>(anotherService);

            // Act
            var result1 = ServiceLocator.Get<ITestService>();
            var result2 = ServiceLocator.Get<IAnotherService>();

            // Assert
            Assert.AreEqual("Test", result1.GetValue());
            Assert.AreEqual(100, result2.GetNumber());
        }

        #endregion

        #region GetOrDefault テスト

        [Test]
        public void GetOrDefault_登録されたサービスを取得できる()
        {
            // Arrange
            var service = new TestService { Value = "Default" };
            ServiceLocator.Register<ITestService>(service);

            // Act
            var result = ServiceLocator.GetOrDefault<ITestService>();

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Default", result.GetValue());
        }

        [Test]
        public void GetOrDefault_登録されていない場合はdefaultを返す()
        {
            // Act
            var result = ServiceLocator.GetOrDefault<ITestService>();

            // Assert
            Assert.IsNull(result);
        }

        #endregion

        #region IsRegistered テスト

        [Test]
        public void IsRegistered_登録されている場合はtrueを返す()
        {
            // Arrange
            ServiceLocator.Register<ITestService>(new TestService());

            // Act & Assert
            Assert.IsTrue(ServiceLocator.IsRegistered<ITestService>());
        }

        [Test]
        public void IsRegistered_登録されていない場合はfalseを返す()
        {
            // Act & Assert
            Assert.IsFalse(ServiceLocator.IsRegistered<ITestService>());
        }

        #endregion

        #region Unregister テスト

        [Test]
        public void Unregister_登録を解除できる()
        {
            // Arrange
            ServiceLocator.Register<ITestService>(new TestService());

            // Act
            var result = ServiceLocator.Unregister<ITestService>();

            // Assert
            Assert.IsTrue(result);
            Assert.IsFalse(ServiceLocator.IsRegistered<ITestService>());
        }

        [Test]
        public void Unregister_登録されていない場合はfalseを返す()
        {
            // Act
            var result = ServiceLocator.Unregister<ITestService>();

            // Assert
            Assert.IsFalse(result);
        }

        #endregion

        #region Clear テスト

        [Test]
        public void Clear_すべてのサービスがクリアされる()
        {
            // Arrange
            ServiceLocator.Register<ITestService>(new TestService());
            ServiceLocator.Register<IAnotherService>(new AnotherService());

            // Act
            ServiceLocator.Clear();

            // Assert
            Assert.IsFalse(ServiceLocator.IsRegistered<ITestService>());
            Assert.IsFalse(ServiceLocator.IsRegistered<IAnotherService>());
        }

        #endregion

        #region モック注入テスト

        [Test]
        public void MockInjection_テストでモックサービスを注入できる()
        {
            // Arrange - モックサービスを作成
            var mockService = new TestService { Value = "MockValue" };

            // Act - モックを登録
            ServiceLocator.Register<ITestService>(mockService);

            // Assert - モックが取得できる
            var result = ServiceLocator.Get<ITestService>();
            Assert.AreEqual("MockValue", result.GetValue());
        }

        #endregion
    }
}
