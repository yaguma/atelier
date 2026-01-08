/**
 * AssetList テスト
 *
 * BootSceneでプリロードするアセットリストのテストを行う。
 */

import { describe, it, expect } from 'vitest';
import {
  ImageAssets,
  AudioAssets,
  JsonAssets,
  AllAssets,
  getTotalAssetCount,
  AssetLoadItem,
  getAssetsByType,
} from '@game/boot/AssetList';

describe('AssetList', () => {
  describe('アセットリストの完全性', () => {
    it('ImageAssetsが定義されている', () => {
      expect(ImageAssets).toBeDefined();
      expect(Array.isArray(ImageAssets)).toBe(true);
      expect(ImageAssets.length).toBeGreaterThan(0);
    });

    it('AudioAssetsが定義されている', () => {
      expect(AudioAssets).toBeDefined();
      expect(Array.isArray(AudioAssets)).toBe(true);
      expect(AudioAssets.length).toBeGreaterThan(0);
    });

    it('JsonAssetsが定義されている', () => {
      expect(JsonAssets).toBeDefined();
      expect(Array.isArray(JsonAssets)).toBe(true);
      expect(JsonAssets.length).toBeGreaterThan(0);
    });

    it('AllAssetsにすべてのアセットが含まれている', () => {
      expect(AllAssets.length).toBe(
        ImageAssets.length + AudioAssets.length + JsonAssets.length
      );
    });
  });

  describe('アセットキーの一意性', () => {
    it('ImageAssetsのkeyがユニークである', () => {
      const keys = ImageAssets.map((a) => a.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('AudioAssetsのkeyがユニークである', () => {
      const keys = AudioAssets.map((a) => a.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('JsonAssetsのkeyがユニークである', () => {
      const keys = JsonAssets.map((a) => a.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('AllAssetsのkeyがユニークである', () => {
      const keys = AllAssets.map((a) => a.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('アセットプロパティの検証', () => {
    it('すべてのImageAssetsがtype: imageを持つ', () => {
      ImageAssets.forEach((asset) => {
        expect(asset.type).toBe('image');
      });
    });

    it('すべてのAudioAssetsがtype: audioを持つ', () => {
      AudioAssets.forEach((asset) => {
        expect(asset.type).toBe('audio');
      });
    });

    it('すべてのJsonAssetsがtype: jsonを持つ', () => {
      JsonAssets.forEach((asset) => {
        expect(asset.type).toBe('json');
      });
    });

    it('すべてのアセットにkeyとpathがある', () => {
      AllAssets.forEach((asset) => {
        expect(asset.key).toBeDefined();
        expect(asset.key.length).toBeGreaterThan(0);
        expect(asset.path).toBeDefined();
        expect(asset.path.length).toBeGreaterThan(0);
      });
    });
  });

  describe('パス形式の検証', () => {
    it('ImageAssetsのパスが.pngで終わる', () => {
      ImageAssets.forEach((asset) => {
        expect(asset.path).toMatch(/\.png$/);
      });
    });

    it('AudioAssetsのパスが音声形式で終わる', () => {
      AudioAssets.forEach((asset) => {
        expect(asset.path).toMatch(/\.(mp3|ogg|wav)$/);
      });
    });

    it('JsonAssetsのパスが.jsonで終わる', () => {
      JsonAssets.forEach((asset) => {
        expect(asset.path).toMatch(/\.json$/);
      });
    });
  });

  describe('ユーティリティ関数', () => {
    it('getTotalAssetCount()が正しいアセット数を返す', () => {
      expect(getTotalAssetCount()).toBe(AllAssets.length);
    });

    it('getAssetsByType()がimage型のアセットを返す', () => {
      const imageAssets = getAssetsByType('image');
      expect(imageAssets.length).toBe(ImageAssets.length);
      imageAssets.forEach((asset) => {
        expect(asset.type).toBe('image');
      });
    });

    it('getAssetsByType()がaudio型のアセットを返す', () => {
      const audioAssets = getAssetsByType('audio');
      expect(audioAssets.length).toBe(AudioAssets.length);
      audioAssets.forEach((asset) => {
        expect(asset.type).toBe('audio');
      });
    });

    it('getAssetsByType()がjson型のアセットを返す', () => {
      const jsonAssets = getAssetsByType('json');
      expect(jsonAssets.length).toBe(JsonAssets.length);
      jsonAssets.forEach((asset) => {
        expect(asset.type).toBe('json');
      });
    });
  });

  describe('必須アセットの存在', () => {
    it('基本UI画像アセットが含まれている', () => {
      const keys = ImageAssets.map((a) => a.key);
      expect(keys).toContain('button-primary');
      expect(keys).toContain('panel-bg');
    });

    it('背景画像アセットが含まれている', () => {
      const keys = ImageAssets.map((a) => a.key);
      expect(keys).toContain('bg-title');
      expect(keys).toContain('bg-main');
    });

    it('アイコンアセットが含まれている', () => {
      const keys = ImageAssets.map((a) => a.key);
      expect(keys).toContain('icon-gold');
      expect(keys).toContain('icon-ap');
    });

    it('基本音声アセットが含まれている', () => {
      const keys = AudioAssets.map((a) => a.key);
      expect(keys).toContain('se-click');
      expect(keys).toContain('bgm-title');
    });

    it('マスターデータJSONが含まれている', () => {
      const keys = JsonAssets.map((a) => a.key);
      expect(keys).toContain('cards-gathering');
      expect(keys).toContain('materials');
      expect(keys).toContain('quests');
      expect(keys).toContain('ranks');
    });
  });
});
