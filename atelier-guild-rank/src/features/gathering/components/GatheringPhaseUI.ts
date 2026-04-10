/** 採取フェーズUIオーケストレーター (TASK-0044, TASK-0114, Issue #459) */

import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type {
  DraftSession,
  IGatheringService,
} from '@domain/interfaces/gathering-service.interface';
import { Colors, THEME, toColorStr } from '@presentation/ui/theme';
import { BaseComponent } from '@shared/components';
import type Phaser from 'phaser';
import { calculateExtraGatheringApCost } from '../services/extra-gathering-ap-cost';
import type { IGatheringLocation, ILocationSelectResult } from '../types/gathering-location';
import { GatheringStage } from '../types/gathering-location';
import { GatheringKeyboardHandler } from './GatheringKeyboardHandler';
import { GatheringMaterialPool } from './GatheringMaterialPool';
import { GatheringResultPanel } from './GatheringResultPanel';
import { GatheringToolbar } from './GatheringToolbar';
import { LocationSelectUI } from './LocationSelectUI';
import type { MaterialDisplay } from './MaterialSlotUI';

const CONTENT_CENTER_X = 440;

export class GatheringPhaseUI extends BaseComponent {
  private materialPool!: GatheringMaterialPool;
  private toolbar!: GatheringToolbar;
  private resultPanel!: GatheringResultPanel;
  private keyboardHandler!: GatheringKeyboardHandler;

  private remainingText!: Phaser.GameObjects.Text;
  private extraApCostText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;

  private session: DraftSession | null = null;
  private onEndCallback?: () => void;
  private _onRerollCallback: ((apCost: number) => boolean) | null = null;
  private _onSessionStateChangeCallback: ((hasActiveSession: boolean) => void) | null = null;

  private _currentStage: GatheringStage = GatheringStage.LOCATION_SELECT;
  private _locationSelectUI: LocationSelectUI | null = null;
  private _availableLocations: readonly IGatheringLocation[] = [];
  private _pendingLeaveConfirm: (() => void) | null = null;
  private _pendingLeaveCancel: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    private gatheringService: IGatheringService,
    private deckService?: IDeckService,
    private materialNameResolver?: (materialId: string) => string,
    onEnd?: () => void,
  ) {
    super(scene, 0, 0, { addToScene: false });
    this.onEndCallback = onEnd;
  }

  create(): void {
    this.createHeaderUI();

    this.materialPool = new GatheringMaterialPool(
      this.scene,
      this.container,
      this.materialNameResolver,
    );
    this.materialPool.create((material) => this.onMaterialSelect(material));

    this.toolbar = new GatheringToolbar(this.scene, this.container, this.gatheringService, {
      onEndGathering: () => this.endGathering(),
      onRerollAP: (apCost) => this._onRerollCallback?.(apCost) ?? true,
      getSessionId: () => this.session?.sessionId ?? null,
    });
    this.toolbar.create();

    this.resultPanel = new GatheringResultPanel(this.scene, this.container);
    this.resultPanel.create();

    this.keyboardHandler = new GatheringKeyboardHandler(
      this.scene,
      () => this.materialPool.getSlots(),
      {
        onSelectSlot: (index) => this.selectSlotByIndex(index),
        onReroll: () => this.toolbar.handleReroll(),
        onEndGathering: () => this.endGathering(),
      },
    );
    this.keyboardHandler.setup();
  }

  private makeText(y: number, text: string, size: number, color: number, bold = false) {
    const t = this.scene.make
      .text({
        x: CONTENT_CENTER_X,
        y,
        text,
        style: {
          fontSize: `${size}px`,
          color: toColorStr(color),
          fontFamily: THEME.fonts.primary,
          ...(bold && { fontStyle: 'bold' }),
        },
        add: false,
      })
      .setOrigin(0.5);
    this.container.add(t);
    return t;
  }

  private createHeaderUI(): void {
    this.titleText = this.makeText(
      20,
      '🌿 採取フェーズ',
      THEME.sizes.xlarge,
      THEME.colors.text,
      true,
    );
    this.remainingText = this.makeText(
      60,
      '残り選択回数: 0/0',
      THEME.sizes.medium,
      THEME.colors.text,
    );
    this.extraApCostText = this.makeText(85, '', THEME.sizes.small, Colors.ui.progress.warning);
    this.extraApCostText.setVisible(false);
  }

  updateSession(session: DraftSession): void {
    this.session = session;
    const remaining = session.maxRounds - session.currentRound + 1;
    this.remainingText.setText(`残り選択回数: ${remaining}/${session.maxRounds} (かご容量)`);

    this.updateExtraApCostDisplay(session);
    this.materialPool.updateOptions(session.currentOptions);
    this.resultPanel.updateMaterials(
      session.selectedMaterials,
      (id) => this.materialNameResolver?.(id) ?? id,
    );

    if (this.toolbar && !session.isComplete) {
      this.toolbar.setRerollEnabled(true);
    }
    if (session.isComplete) {
      this.materialPool.disableSelection();
      this.toolbar?.setRerollEnabled(false);
    }
  }

  private updateExtraApCostDisplay(session: DraftSession): void {
    const extraCost = calculateExtraGatheringApCost(
      session.currentRound,
      session.presentationCount,
    );
    if (extraCost > 0) {
      this.extraApCostText.setText(`⚡ 追加AP: +${extraCost}`);
      this.extraApCostText.setVisible(true);
    } else if (session.currentRound > session.presentationCount) {
      this.extraApCostText.setText('⚡ 追加AP: +0');
      this.extraApCostText.setVisible(true);
    } else {
      this.extraApCostText.setVisible(false);
    }
  }

  private onMaterialSelect(material: MaterialDisplay): void {
    if (!this.session) return;
    const optionIndex = this.session.currentOptions.findIndex(
      (opt) => opt.materialId === material.id,
    );
    if (optionIndex !== -1) this.handleMaterialSelect(optionIndex);
  }

  handleMaterialSelect(optionIndex: number): void {
    if (!this.session) return;
    try {
      this.gatheringService.selectMaterial(this.session.sessionId, optionIndex);
      const updatedSession = this.gatheringService.getCurrentSession();
      if (!updatedSession) return;
      this.updateSession(updatedSession);
      if (updatedSession.isComplete) this.endGathering();
    } catch (error) {
      console.error('Failed to select material:', error);
    }
  }

  private selectSlotByIndex(index: number): void {
    if (!this.session) return;
    const display = this.materialPool.buildMaterialDisplayAt(index, this.session.currentOptions);
    if (display) this.onMaterialSelect(display);
  }

  private endGathering(): void {
    this.materialPool.disableSelection();
    this.toolbar?.setRerollEnabled(false);
    this.onEndCallback?.();
    this.session = null;
    this._currentStage = GatheringStage.LOCATION_SELECT;
    this.showLocationSelectStage();
    this.notifySessionStateChange();
  }

  show(): void {
    this._currentStage = GatheringStage.LOCATION_SELECT;
    this.showLocationSelectStage();
  }

  setAvailableLocations(locations: readonly IGatheringLocation[]): void {
    this._availableLocations = locations;
    this._locationSelectUI?.updateLocations(locations);
  }

  getCurrentStage(): GatheringStage {
    return this._currentStage;
  }

  hasActiveSession(): boolean {
    return this.session !== null && !this.session.isComplete;
  }

  onReroll(callback: (apCost: number) => boolean): void {
    this._onRerollCallback = callback;
  }

  onSessionStateChange(callback: (hasActiveSession: boolean) => void): void {
    this._onSessionStateChangeCallback = callback;
  }

  private notifySessionStateChange(): void {
    this._onSessionStateChangeCallback?.(this.hasActiveSession());
  }

  handleLocationSelected(result: ILocationSelectResult): void {
    const card = this.deckService?.getHand().find((c) => c.id === result.cardId);
    if (!card) {
      console.warn('GatheringPhaseUI: Card not found in hand:', result.cardId);
      return;
    }
    const draftSession = this.gatheringService.startDraftGathering(card);
    if (!draftSession) {
      console.warn('GatheringPhaseUI: startDraftGathering returned null:', result.cardId);
      return;
    }
    this.session = draftSession;
    this._currentStage = GatheringStage.DRAFT_SESSION;
    this.showDraftSessionStage();
    this.updateSession(draftSession);
    this.notifySessionStateChange();
  }

  requestLeavePhase(onConfirm: () => void, onCancel: () => void): boolean {
    if (!this.hasActiveSession()) {
      onConfirm();
      return false;
    }
    this._pendingLeaveConfirm = onConfirm;
    this._pendingLeaveCancel = onCancel;
    return true;
  }

  confirmLeavePhase(): void {
    if (!this._pendingLeaveConfirm) return;
    this.discardSession();
    const cb = this._pendingLeaveConfirm;
    this._pendingLeaveConfirm = null;
    this._pendingLeaveCancel = null;
    cb();
  }

  cancelLeavePhase(): void {
    if (!this._pendingLeaveCancel) return;
    const cb = this._pendingLeaveCancel;
    this._pendingLeaveConfirm = null;
    this._pendingLeaveCancel = null;
    cb();
  }

  discardSession(): void {
    if (this.session) this.gatheringService.endGathering(this.session.sessionId);
    this.session = null;
    this._currentStage = GatheringStage.LOCATION_SELECT;
    this.showLocationSelectStage();
    this.notifySessionStateChange();
  }

  private showLocationSelectStage(): void {
    this.hideDraftSessionUI();
    if (!this._locationSelectUI) {
      this._locationSelectUI = new LocationSelectUI(this.scene, 0, 0, { addToScene: false });
      this._locationSelectUI.create();
      this._locationSelectUI.onLocationSelect((r) => this.handleLocationSelected(r));
      this.container.add(this._locationSelectUI.getContainer());
    }
    this._locationSelectUI.setVisible(true);
    if (this._availableLocations.length > 0) {
      this._locationSelectUI.updateLocations(this._availableLocations);
    }
  }

  private showDraftSessionStage(): void {
    this._locationSelectUI?.setVisible(false);
    this.titleText?.setVisible(true);
    this.remainingText?.setVisible(true);
    this.extraApCostText?.setVisible(false);
    this.materialPool?.setVisible(true);
    this.toolbar?.setVisible(true);
  }

  private hideDraftSessionUI(): void {
    this.titleText?.setVisible(false);
    this.remainingText?.setVisible(false);
    this.extraApCostText?.setVisible(false);
    this.materialPool?.setVisible(false);
    this.toolbar?.setVisible(false);
  }

  simulateEndGathering(): void {
    this.endGathering();
  }

  destroy(): void {
    this.keyboardHandler?.teardown();
    this._locationSelectUI?.destroy();
    this._locationSelectUI = null;
    this._onRerollCallback = null;
    this._onSessionStateChangeCallback = null;
    this._pendingLeaveConfirm = null;
    this._pendingLeaveCancel = null;
    this.toolbar?.destroy();
    this.resultPanel?.destroy();
    this.materialPool?.destroy();
    this.container.destroy();
  }
}
