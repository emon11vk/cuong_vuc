import Phaser from 'phaser';
import { useHanoiStore } from '../../store/useHanoiStore';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  public dialogueSequence: { speaker: string; text: string }[] = [];
  private currentDialogueIndex: number = 0;
  private promptText!: Phaser.GameObjects.Text;
  private interactKey: Phaser.Input.Keyboard.Key;
  private isPlayerNear: boolean = false;
  private canInteract: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string = 'NPC') {
    super(scene, x, y, 'npc');
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.setDisplaySize(64, 64);
    
    this.name = name;
    
    // Setup interaction prompt (Press E)
    this.promptText = scene.add.text(x, y - 40, 'E - Talk', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    if (scene.input.keyboard) {
      this.interactKey = scene.input.keyboard.addKey('E');
    } else {
      throw new Error("Keyboard not found");
    }

    // Default graphics if not loaded
    if (!scene.textures.exists('npc')) {
      const g = scene.make.graphics();
      g.fillStyle(0x0000ff, 1);
      g.fillRect(0, 0, 32, 32);
      g.generateTexture('npc', 32, 32);
      g.destroy();
      this.setTexture('npc');
    }
  }

  setDialogue(sequence: { speaker: string; text: string }[]) {
    this.dialogueSequence = sequence;
  }

  update(player: Phaser.GameObjects.Sprite) {
    if (!this.active) return;
    
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const wasNear = this.isPlayerNear;
    this.isPlayerNear = dist < 60;

    if (this.isPlayerNear) {
      this.promptText.setVisible(true);
      
      // If just pressed E
      if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.canInteract) {
        this.advanceDialogue();
      }
    } else {
      this.promptText.setVisible(false);
      if (wasNear) {
        // Player walked away, reset dialogue
        this.currentDialogueIndex = 0;
      }
    }
  }

  private advanceDialogue() {
    if (this.dialogueSequence.length === 0) return;

    if (this.currentDialogueIndex < this.dialogueSequence.length) {
      const diag = this.dialogueSequence[this.currentDialogueIndex];
      useHanoiStore.getState().setDialogue(diag);
      this.currentDialogueIndex++;
      
      // Cooldown to prevent spamming E
      this.canInteract = false;
      this.scene.time.delayedCall(500, () => {
        this.canInteract = true;
      });
    } else {
      // Reached the end, wrap around or clear
      useHanoiStore.getState().setDialogue(null);
      this.currentDialogueIndex = 0;
    }
  }
}
