/**
 * Contrast utility - WCAG コントラスト比計算
 * Issue #457: UI刷新 Phase 3
 *
 * @remarks
 * 純粋関数のみ。副作用なし。
 * WCAG 2.1 相対輝度およびコントラスト比の定義に従う。
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

/** sRGB チャネル値（0..1）を線形化する */
function linearize(channel: number): number {
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** 0xRRGGBB 形式の色から WCAG 相対輝度を計算する */
export function relativeLuminance(color: number): number {
  const r = ((color >> 16) & 0xff) / 255;
  const g = ((color >> 8) & 0xff) / 255;
  const b = (color & 0xff) / 255;
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** 2色間の WCAG コントラスト比を計算する（1..21） */
export function contrastRatio(fg: number, bg: number): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA (通常テキスト 4.5:1) を満たすか */
export function meetsWcagAa(fg: number, bg: number): boolean {
  return contrastRatio(fg, bg) >= 4.5;
}
