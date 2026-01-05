/**
 * UIコンポーネント基盤テスト
 * @description TASK-0119 UIコンポーネント基盤
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UIComponent } from '../../../src/presentation/UIComponent';

describe('UIComponent Base', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('コンポーネントを生成できる', () => {
    // Arrange & Act
    const component = new TestComponent();

    // Assert
    expect(component).toBeInstanceOf(UIComponent);
    expect(component.getElement()).toBeInstanceOf(HTMLElement);
  });

  it('DOMに追加できる', () => {
    // Arrange
    const component = new TestComponent();

    // Act
    component.mount(container);

    // Assert
    expect(container.contains(component.getElement())).toBe(true);
    expect(component.isMounted()).toBe(true);
  });

  it('DOMから削除できる', () => {
    // Arrange
    const component = new TestComponent();
    component.mount(container);

    // Act
    component.unmount();

    // Assert
    expect(container.contains(component.getElement())).toBe(false);
    expect(component.isMounted()).toBe(false);
  });

  it('イベントリスナーを登録できる', () => {
    // Arrange
    const component = new TestComponent();
    const handler = vi.fn();

    // Act
    component.addEventListener('click', handler);
    component.getElement().click();

    // Assert
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('イベントリスナーを解除できる', () => {
    // Arrange
    const component = new TestComponent();
    const handler = vi.fn();
    component.addEventListener('click', handler);

    // Act
    component.removeEventListener('click', handler);
    component.getElement().click();

    // Assert
    expect(handler).not.toHaveBeenCalled();
  });

  it('子コンポーネントを追加できる', () => {
    // Arrange
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.mount(container);

    // Act
    parent.addChild(child);

    // Assert
    expect(parent.getElement().contains(child.getElement())).toBe(true);
    expect(child.isMounted()).toBe(true);
  });

  it('子コンポーネントを削除できる', () => {
    // Arrange
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.mount(container);
    parent.addChild(child);

    // Act
    parent.removeChild(child);

    // Assert
    expect(parent.getElement().contains(child.getElement())).toBe(false);
    expect(child.isMounted()).toBe(false);
  });

  it('表示/非表示を切り替えられる', () => {
    // Arrange
    const component = new TestComponent();
    component.mount(container);

    // Act & Assert - 非表示
    component.hide();
    expect(component.getElement().style.display).toBe('none');
    expect(component.isVisible()).toBe(false);

    // Act & Assert - 表示
    component.show();
    expect(component.getElement().style.display).not.toBe('none');
    expect(component.isVisible()).toBe(true);
  });

  it('destroyでイベントリスナーが解除され、DOMから削除される', () => {
    // Arrange
    const component = new TestComponent();
    const handler = vi.fn();
    component.mount(container);
    component.addEventListener('click', handler);

    // Act
    component.destroy();

    // クリックしてもハンドラーが呼ばれない（要素が削除されているため）
    // Assert
    expect(component.isMounted()).toBe(false);
    expect(container.children.length).toBe(0);
  });

  it('複数の子コンポーネントを管理できる', () => {
    // Arrange
    const parent = new TestComponent();
    const child1 = new TestComponent();
    const child2 = new TestComponent();
    const child3 = new TestComponent();
    parent.mount(container);

    // Act
    parent.addChild(child1);
    parent.addChild(child2);
    parent.addChild(child3);

    // Assert
    expect(parent.getChildren().length).toBe(3);
  });

  it('親コンポーネントをunmountすると子も自動的にunmountされる', () => {
    // Arrange
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.mount(container);
    parent.addChild(child);

    // Act
    parent.unmount();

    // Assert
    expect(child.isMounted()).toBe(false);
  });

  it('destroyすると子コンポーネントもdestroyされる', () => {
    // Arrange
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.mount(container);
    parent.addChild(child);

    // Act
    parent.destroy();

    // Assert
    expect(parent.getChildren().length).toBe(0);
  });

  it('CSSクラスを追加・削除できる', () => {
    // Arrange
    const component = new TestComponent();

    // Act & Assert - 追加
    component.addClass('test-class');
    expect(component.getElement().classList.contains('test-class')).toBe(true);

    // Act & Assert - 削除
    component.removeClass('test-class');
    expect(component.getElement().classList.contains('test-class')).toBe(false);
  });

  it('属性を設定・取得できる', () => {
    // Arrange
    const component = new TestComponent();

    // Act
    component.setAttribute('data-test', 'value');

    // Assert
    expect(component.getAttribute('data-test')).toBe('value');
  });

  it('マウント前に子コンポーネントを追加でき、マウント時に一緒にマウントされる', () => {
    // Arrange
    const parent = new TestComponent();
    const child = new TestComponent();
    parent.addChild(child);

    // Act
    parent.mount(container);

    // Assert
    expect(child.isMounted()).toBe(true);
  });
});

/**
 * テスト用のコンポーネント実装
 */
class TestComponent extends UIComponent {
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'test-component';
    return element;
  }
}
