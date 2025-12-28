using NUnit.Framework;
using Atelier.Presentation.UI;

namespace Atelier.Tests.EditMode.Presentation
{
    /// <summary>
    /// TransitionManagerのテスト
    /// </summary>
    [TestFixture]
    public class TransitionManagerTests
    {
        #region ITransitionManager インターフェーステスト

        [Test]
        public void ITransitionManager_インターフェースが存在する()
        {
            var type = typeof(ITransitionManager);
            Assert.IsNotNull(type);
        }

        [Test]
        public void ITransitionManager_FadeInメソッドが定義されている()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("FadeIn");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ITransitionManager_FadeOutメソッドが定義されている()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("FadeOut");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ITransitionManager_CrossFadeメソッドが定義されている()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("CrossFade");
            Assert.IsNotNull(method);
        }

        [Test]
        public void ITransitionManager_IsTransitioningプロパティが定義されている()
        {
            var type = typeof(ITransitionManager);
            var property = type.GetProperty("IsTransitioning");
            Assert.IsNotNull(property);
        }

        #endregion

        #region TransitionManager クラステスト

        [Test]
        public void TransitionManager_クラスが存在する()
        {
            var type = typeof(TransitionManager);
            Assert.IsNotNull(type);
        }

        [Test]
        public void TransitionManager_MonoBehaviourを継承している()
        {
            var type = typeof(TransitionManager);
            Assert.IsTrue(typeof(UnityEngine.MonoBehaviour).IsAssignableFrom(type));
        }

        [Test]
        public void TransitionManager_ITransitionManagerを実装している()
        {
            var type = typeof(TransitionManager);
            Assert.IsTrue(typeof(ITransitionManager).IsAssignableFrom(type));
        }

        [Test]
        public void TransitionManager_Instanceプロパティを持っている()
        {
            var type = typeof(TransitionManager);
            var property = type.GetProperty("Instance");
            Assert.IsNotNull(property);
            Assert.IsTrue(property.PropertyType == typeof(TransitionManager));
        }

        [Test]
        public void TransitionManager_IsTransitioningプロパティを持っている()
        {
            var type = typeof(TransitionManager);
            var property = type.GetProperty("IsTransitioning");
            Assert.IsNotNull(property);
            Assert.AreEqual(typeof(bool), property.PropertyType);
        }

        #endregion

        #region FadeInメソッドテスト

        [Test]
        public void FadeIn_durationパラメータを受け取る()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("FadeIn");
            var parameters = method.GetParameters();

            Assert.IsTrue(parameters.Length >= 1);
            Assert.AreEqual("duration", parameters[0].Name);
            Assert.AreEqual(typeof(float), parameters[0].ParameterType);
        }

        [Test]
        public void FadeIn_durationにはデフォルト値がある()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("FadeIn");
            var parameters = method.GetParameters();

            Assert.IsTrue(parameters[0].HasDefaultValue);
            Assert.AreEqual(0.3f, parameters[0].DefaultValue);
        }

        [Test]
        public void FadeIn_onCompleteコールバックを受け取る()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("FadeIn");
            var parameters = method.GetParameters();

            Assert.IsTrue(parameters.Length >= 2);
            Assert.AreEqual("onComplete", parameters[1].Name);
            Assert.AreEqual(typeof(System.Action), parameters[1].ParameterType);
        }

        #endregion

        #region FadeOutメソッドテスト

        [Test]
        public void FadeOut_durationパラメータを受け取る()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("FadeOut");
            var parameters = method.GetParameters();

            Assert.IsTrue(parameters.Length >= 1);
            Assert.AreEqual("duration", parameters[0].Name);
            Assert.AreEqual(typeof(float), parameters[0].ParameterType);
        }

        [Test]
        public void FadeOut_durationにはデフォルト値がある()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("FadeOut");
            var parameters = method.GetParameters();

            Assert.IsTrue(parameters[0].HasDefaultValue);
            Assert.AreEqual(0.3f, parameters[0].DefaultValue);
        }

        [Test]
        public void FadeOut_onCompleteコールバックを受け取る()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("FadeOut");
            var parameters = method.GetParameters();

            Assert.IsTrue(parameters.Length >= 2);
            Assert.AreEqual("onComplete", parameters[1].Name);
            Assert.AreEqual(typeof(System.Action), parameters[1].ParameterType);
        }

        #endregion

        #region CrossFadeメソッドテスト

        [Test]
        public void CrossFade_onMiddleコールバックを受け取る()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("CrossFade");
            var parameters = method.GetParameters();

            Assert.IsTrue(parameters.Length >= 1);
            Assert.AreEqual("onMiddle", parameters[0].Name);
            Assert.AreEqual(typeof(System.Action), parameters[0].ParameterType);
        }

        [Test]
        public void CrossFade_durationパラメータを受け取る()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("CrossFade");
            var parameters = method.GetParameters();

            Assert.IsTrue(parameters.Length >= 2);
            Assert.AreEqual("duration", parameters[1].Name);
            Assert.AreEqual(typeof(float), parameters[1].ParameterType);
        }

        [Test]
        public void CrossFade_durationにはデフォルト値がある()
        {
            var type = typeof(ITransitionManager);
            var method = type.GetMethod("CrossFade");
            var parameters = method.GetParameters();

            Assert.IsTrue(parameters[1].HasDefaultValue);
            Assert.AreEqual(0.6f, parameters[1].DefaultValue);
        }

        #endregion
    }
}
