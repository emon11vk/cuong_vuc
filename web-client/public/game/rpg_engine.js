/**
 * Cao Bá Quát — Đêm Chấm Thi (1841)
 * 2D Top-Down Historical Narrative RPG Engine
 * High-definition visual assets, genuine character portraits, room transitions,
 * AABB collisions, interactive dialogs, and GDD compliance.
 */

// ==========================================================================
// 1. Audio System (Web Audio API)
// ==========================================================================
class RPGSound {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastFootstep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playGong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Multi-harmonic Imperial Bronze Bell (Chuông đồng / Khánh đồng cung đình)
    const partials = [
      { freq: 216, gain: 0.28, decay: 2.8 },
      { freq: 582, gain: 0.12, decay: 2.2 },
      { freq: 1140, gain: 0.06, decay: 1.4 },
      { freq: 65, gain: 0.2, decay: 1.8 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = p.freq < 100 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(p.freq, now);
      osc.frequency.exponentialRampToValueAtTime(p.freq * 0.98, now + p.decay);
      gain.gain.setValueAtTime(p.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + p.decay);
    });
  }

  playFootstep() {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - this.lastFootstep < 280) return;
    this.lastFootstep = now;
    this.init();
    if (!this.ctx) return;

    // Soft cloth shoe rustle on wooden floor (Hia vải trên sàn gỗ)
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65 + Math.random() * 20, t);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playInteract() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Traditional wooden tally clapper (Tiếng gõ thẻ bài / phách gỗ)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(620, now);
    osc1.frequency.exponentialRampToValueAtTime(840, now + 0.08);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(240, now);
    gain2.gain.setValueAtTime(0.1, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.09);
  }

  playChoice() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Resonant small bronze bowl chime (Tiếng khánh đồng thanh tao)
    [523.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.02);
      gain.gain.setValueAtTime(0.12, now + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.02);
      osc.stop(now + 0.45);
    });
  }

  playDreamChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Vietnamese Court Pentatonic Scale (Điệu Cung - Thương - Giốc - Chủy - Vũ)
    const pentaNotes = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
    pentaNotes.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.14);
      gain.gain.setValueAtTime(0.11, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 1.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 1.8);
    });
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Imperial Honor Fanfare Chime (Khánh ngọc báo hỷ)
    [392.00, 523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.09);
      gain.gain.setValueAtTime(0.14, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 1.2);
    });
  }
}

const rpgAudio = new RPGSound();

// ==========================================================================
// 2. Global State & Background Assets Preloader
// ==========================================================================
const rpgState = {
  currentStage: "M0",
  score: 0,
  stageScoreAwarded: {},
  flags: {
    khuynh_huong: null, // "TRONG_PHEP" | "TRONG_TAI" | "TRUNG_DUNG"
    da_gac_rieng: false,
    huy_hieu_an: false
  },
  dialogueOpen: false,
  minigameOpen: false,
  gameData: null,
  activeInteractable: null
};

// Preload Game Environment Scene Images
const SCENE_ASSETS = {
  M0: new Image(),
  exam: new Image(),
  prison: new Image(),
  dream: new Image()
};
SCENE_ASSETS.M0.src = 'assets/scene_m0.jpg';
SCENE_ASSETS.exam.src = 'assets/scene_exam.jpg';
SCENE_ASSETS.prison.src = 'assets/scene_prison.jpg';
SCENE_ASSETS.dream.src = 'assets/scene_dream.jpg';

// ==========================================================================
// 3. Sprite Renderer (Character, NPCs, Objects)
// ==========================================================================
class SpriteRenderer {
  // Draw Cao Bá Quát (Player)
  static drawCaoBaQuat(ctx, x, y, dir, animFrame, isMoving) {
    ctx.save();
    ctx.translate(x, y);

    const bob = isMoving ? Math.sin(animFrame * Math.PI) * 2.5 : 0;

    // Contact Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Feet
    ctx.fillStyle = '#111';
    const leg = isMoving ? Math.sin(animFrame * Math.PI) * 4 : 0;
    ctx.fillRect(-7 + leg, 11, 6, 5);
    ctx.fillRect(2 - leg, 11, 6, 5);

    // Traditional Silk Robe (Áo ngũ thân lam thẫm)
    ctx.fillStyle = '#1c344d';
    ctx.beginPath();
    ctx.moveTo(-11, -8 + bob);
    ctx.lineTo(11, -8 + bob);
    ctx.lineTo(14, 13 + bob);
    ctx.lineTo(-14, 13 + bob);
    ctx.closePath();
    ctx.fill();

    // Amber Sash & Lapel
    ctx.strokeStyle = '#cda34f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -6 + bob);
    ctx.lineTo(0, 13 + bob);
    ctx.stroke();

    ctx.fillStyle = '#b38228';
    ctx.fillRect(-7, 2 + bob, 14, 3);

    // Sleeves
    ctx.fillStyle = '#142537';
    ctx.fillRect(-14, -6 + bob, 5, 12);
    ctx.fillRect(9, -6 + bob, 5, 12);

    // Hands
    ctx.fillStyle = '#f0c896';
    ctx.beginPath();
    ctx.arc(dir === 'left' ? -12 : (dir === 'right' ? 12 : 0), 6 + bob, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Head / Face
    ctx.fillStyle = '#f3cf9f';
    ctx.beginPath();
    ctx.arc(0, -14 + bob, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // Facial features & Mustache
    ctx.fillStyle = '#18120c';
    if (dir === 'down') {
      ctx.fillRect(-3, -15 + bob, 2, 2);
      ctx.fillRect(2, -15 + bob, 2, 2);
      ctx.beginPath();
      ctx.moveTo(-3, -10 + bob);
      ctx.lineTo(3, -10 + bob);
      ctx.lineTo(0, -6 + bob);
      ctx.fill();
    } else if (dir === 'left') {
      ctx.fillRect(-6, -15 + bob, 2, 2);
      ctx.fillRect(-5, -9 + bob, 3, 2);
    } else if (dir === 'right') {
      ctx.fillRect(4, -15 + bob, 2, 2);
      ctx.fillRect(2, -9 + bob, 3, 2);
    }

    // Black Turban (Khăn đóng triều Nguyễn)
    ctx.fillStyle = '#080a10';
    ctx.beginPath();
    ctx.ellipse(0, -20 + bob, 9.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nameplate for Player (Playfair Display with Vietnamese diacritics support)
    ctx.font = '600 12px "Playfair Display", "Be Vietnam Pro", serif';
    ctx.fillStyle = '#ffea9f';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    ctx.fillText('Cao Bá Quát', 0, -32 + bob);

    ctx.restore();
  }

  // Draw NPC
  static drawNPC(ctx, npc, time, isHighlighted) {
    const { x, y, type, name } = npc;
    ctx.save();
    ctx.translate(x, y);

    const idleBob = Math.sin(time * 0.003 + x) * 1.5;

    // Highlight circle if player is nearby
    if (isHighlighted) {
      ctx.strokeStyle = '#e6b042';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 14, 18, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    let robeColor = '#7a1818';
    let hatWinged = false;
    let isGhost = false;

    if (type === 'chanh_chu_khao') {
      robeColor = '#941a1a';
      hatWinged = true;
    } else if (type === 'phan_nha') {
      robeColor = '#245a3a';
    } else if (type === 'nguc_quan') {
      robeColor = '#4a2511';
    } else if (type === 'linh_le') {
      robeColor = '#8c3518';
    } else if (type === 'ghost_scholar') {
      robeColor = 'rgba(160, 200, 245, 0.7)';
      isGhost = true;
    }

    if (isGhost) {
      ctx.shadowColor = 'rgba(130, 190, 255, 0.9)';
      ctx.shadowBlur = 16;
    }

    // Robe Body
    ctx.fillStyle = robeColor;
    ctx.beginPath();
    ctx.moveTo(-12, -8 + idleBob);
    ctx.lineTo(12, -8 + idleBob);
    ctx.lineTo(14, 14 + idleBob);
    ctx.lineTo(-14, 14 + idleBob);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = isGhost ? '#d9ecfa' : '#f0cd9f';
    ctx.beginPath();
    ctx.arc(0, -14 + idleBob, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // Headwear
    if (hatWinged) {
      ctx.fillStyle = '#080808';
      ctx.fillRect(-8, -24 + idleBob, 16, 7);
      ctx.fillRect(-22, -22 + idleBob, 14, 3);
      ctx.fillRect(8, -22 + idleBob, 14, 3);
    } else if (type === 'linh_le') {
      ctx.fillStyle = '#b82a18';
      ctx.beginPath();
      ctx.moveTo(-13, -18 + idleBob);
      ctx.lineTo(13, -18 + idleBob);
      ctx.lineTo(0, -27 + idleBob);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = isGhost ? 'rgba(70, 100, 140, 0.8)' : '#0d0d0d';
      ctx.beginPath();
      ctx.ellipse(0, -20 + idleBob, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyes
    ctx.fillStyle = isGhost ? '#446688' : '#222';
    ctx.fillRect(-3, -15 + idleBob, 2, 2);
    ctx.fillRect(2, -15 + idleBob, 2, 2);

    // Nameplate for NPCs
    ctx.font = '600 12px "Playfair Display", "Be Vietnam Pro", serif';
    ctx.fillStyle = isGhost ? '#bfe0ff' : '#ffea9f';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 5;
    ctx.fillText(name, 0, -32 + idleBob);

    ctx.restore();
  }

  // Draw Interactive World Objects
  static drawObject(ctx, obj, time, isHighlighted) {
    const { x, y, w, h, type, label } = obj;
    ctx.save();
    ctx.translate(x, y);

    if (isHighlighted) {
      ctx.strokeStyle = '#ffbb33';
      ctx.lineWidth = 2;
      ctx.strokeRect(-4, -4, w + 8, h + 8);
    }

    if (type === 'desk_truong_quy') {
      ctx.fillStyle = '#3a2012';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e8d2a6';
      ctx.fillRect(8, 6, 28, 20);
      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.arc(w - 14, 4 + Math.sin(time * 0.02) * 1.5, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'desk_exam_17') {
      ctx.fillStyle = '#382012';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f8f1e3';
      ctx.fillRect(10, 6, 40, 22);
      ctx.fillStyle = '#b31e1e';
      ctx.font = 'bold 13px serif';
      ctx.fillText('諱', 24, 22);
    } else if (type === 'soot_dish_stand') {
      ctx.fillStyle = '#26170d';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#080808';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a4d3f';
      ctx.stroke();
    } else if (type === 'desk_m4_midnight') {
      ctx.fillStyle = '#2a160d';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#d4c0a5';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(14 + i * 4, 6 - i * 2, 34, 8);
      }
      ctx.fillStyle = '#ff4500';
      ctx.beginPath();
      ctx.arc(w - 18, 6, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'prison_interrogation_desk') {
      ctx.fillStyle = '#221e1a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ebdcc0';
      ctx.fillRect(10, 6, 46, 24);
      ctx.fillStyle = '#8b1e1e';
      ctx.font = 'bold 11px serif';
      ctx.fillText('供狀', 24, 22);
    } else if (type === 'hidden_scroll_inspect') {
      ctx.fillStyle = '#422818';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f8ecd6';
      ctx.fillRect(4, 4, w - 8, h - 8);
      ctx.fillStyle = '#8b1e1e';
      ctx.font = 'bold 10px serif';
      ctx.fillText('📜 BẢN THẢO', 6, h / 2 + 4);
    } else if (type === 'door_gate') {
      ctx.fillStyle = 'rgba(90, 20, 20, 0.85)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#cda34f';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);
      ctx.fillStyle = '#ffea9f';
      ctx.font = 'bold 11px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.fillText('LỐI ĐI ➜', w / 2, h / 2 + 4);
    }

    if (label) {
      ctx.font = '10px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#ffea9f';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(label, w / 2, -6);
    }

    ctx.restore();
  }
}

// ==========================================================================
// 4. Room Configuration
// ==========================================================================
const ROOMS = {
  M0: {
    name: "M0 · Cổng Trường Thi Thừa Thiên",
    objective: "Gặp Quan Chánh Chủ Khảo trước cổng trường thi để bắt đầu.",
    bgType: 'M0',
    bounds: { w: 960, h: 540 },
    playerStart: { x: 480, y: 440 },
    colliders: [
      { x: 0, y: 0, w: 380, h: 160 }, // Left pavilion & wall
      { x: 580, y: 0, w: 380, h: 160 }, // Right pavilion & wall
      { x: 0, y: 0, w: 40, h: 540 }, // Left border
      { x: 920, y: 0, w: 40, h: 540 }, // Right border
      { x: 0, y: 500, w: 960, h: 40 } // Bottom border
    ],
    npcs: [
      {
        id: "npc_chanh_khao",
        name: "Quan Chánh Chủ Khảo",
        type: "chanh_chu_khao",
        x: 480,
        y: 240,
        interactRadius: 65,
        dialogueKey: "M0_INTRO"
      },
      {
        id: "npc_linh_le_1",
        name: "Lính Lệ Canh Cổng",
        type: "linh_le",
        x: 370,
        y: 240,
        interactRadius: 55,
        dialogueKey: "M0_GUARD"
      }
    ],
    objects: [
      {
        id: "gate_to_m1",
        type: "door_gate",
        x: 430,
        y: 135,
        w: 100,
        h: 25,
        label: "Cửa Vào Trường",
        interactRadius: 65,
        dialogueKey: "M0_GATE"
      }
    ]
  },

  M1: {
    name: "M1 · Thư Phòng Quán Trọ Sơ Khảo",
    objective: "Lại gần Bàn Sách Trường Quy và ấn [E] để suy ngẫm khuynh hướng.",
    bgType: 'exam',
    bounds: { w: 960, h: 540 },
    playerStart: { x: 220, y: 360 },
    colliders: [
      { x: 0, y: 0, w: 960, h: 60 },
      { x: 0, y: 490, w: 960, h: 50 },
      { x: 0, y: 0, w: 40, h: 540 },
      { x: 920, y: 0, w: 40, h: 540 },
      { x: 440, y: 220, w: 80, h: 60 }
    ],
    npcs: [],
    objects: [
      {
        id: "desk_truong_quy",
        type: "desk_truong_quy",
        x: 440,
        y: 220,
        w: 80,
        h: 60,
        label: "Tập Sách Trường Quy [E]",
        interactRadius: 75,
        dialogueKey: "M1_DECISION"
      },
      {
        id: "door_to_m2",
        type: "door_gate",
        x: 870,
        y: 230,
        w: 40,
        h: 90,
        label: "Vào Nội Trường",
        interactRadius: 65,
        dialogueKey: "M1_DOOR"
      }
    ]
  },

  M2: {
    name: "M2 · Nội Trường Chấm Thi",
    objective: "Đi tới Bàn Số 17 kiểm tra quyển bài thi đáng nghi.",
    bgType: 'exam',
    bounds: { w: 960, h: 540 },
    playerStart: { x: 120, y: 270 },
    colliders: [
      { x: 0, y: 0, w: 960, h: 60 },
      { x: 0, y: 490, w: 960, h: 50 },
      { x: 0, y: 0, w: 40, h: 540 },
      { x: 920, y: 0, w: 40, h: 540 },
      { x: 500, y: 270, w: 100, h: 55 }
    ],
    npcs: [],
    objects: [
      {
        id: "desk_17",
        type: "desk_exam_17",
        x: 500,
        y: 270,
        w: 100,
        h: 55,
        label: "Bàn Quyển Thứ 17 [E]",
        interactRadius: 75,
        dialogueKey: "M2_DECISION"
      },
      {
        id: "door_to_m3",
        type: "door_gate",
        x: 870,
        y: 230,
        w: 40,
        h: 90,
        label: "Phòng Sơ Khảo Đêm",
        interactRadius: 65,
        dialogueKey: "M2_DOOR"
      }
    ]
  },

  M3: {
    name: "M3 · Đêm Trường Thi — Đĩa Muội Đèn",
    objective: "Gặp Phan Nhạ bên đĩa muội đèn. Soi bản thảo cổ để tìm chữ phạm húy ẩn.",
    bgType: 'exam',
    bounds: { w: 960, h: 540 },
    playerStart: { x: 140, y: 270 },
    colliders: [
      { x: 0, y: 0, w: 960, h: 60 },
      { x: 0, y: 490, w: 960, h: 50 },
      { x: 0, y: 0, w: 40, h: 540 },
      { x: 920, y: 0, w: 40, h: 540 },
      { x: 530, y: 220, w: 80, h: 50 },
      { x: 250, y: 110, w: 80, h: 45 }
    ],
    npcs: [
      {
        id: "npc_phan_nha",
        name: "Phan Nhạ",
        type: "phan_nha",
        x: 570,
        y: 180,
        interactRadius: 70,
        dialogueKey: "M3_DECISION"
      }
    ],
    objects: [
      {
        id: "hidden_inspect_stand",
        type: "hidden_scroll_inspect",
        x: 250,
        y: 110,
        w: 80,
        h: 45,
        label: "Soi Chữ Ẩn [E]",
        interactRadius: 70,
        dialogueKey: "M3_MINIGAME"
      },
      {
        id: "desk_soot_dish",
        type: "soot_dish_stand",
        x: 530,
        y: 220,
        w: 80,
        h: 50,
        label: "Đĩa Muội Đèn",
        interactRadius: 65,
        dialogueKey: "M3_DECISION"
      },
      {
        id: "door_to_m4",
        type: "door_gate",
        x: 870,
        y: 230,
        w: 40,
        h: 90,
        label: "Vào Canh Ba",
        interactRadius: 65,
        dialogueKey: "M3_DOOR"
      }
    ]
  },

  M4: {
    name: "M4 · SINH TỬ — Canh Ba",
    objective: "Bước đến bàn thi quyết định số phận 24 bài thi và chính cuộc đời ngươi.",
    bgType: 'exam',
    bounds: { w: 960, h: 540 },
    playerStart: { x: 220, y: 270 },
    colliders: [
      { x: 0, y: 0, w: 960, h: 60 },
      { x: 0, y: 490, w: 960, h: 50 },
      { x: 0, y: 0, w: 40, h: 540 },
      { x: 920, y: 0, w: 40, h: 540 },
      { x: 440, y: 220, w: 120, h: 60 }
    ],
    npcs: [],
    objects: [
      {
        id: "desk_m4_decision",
        type: "desk_m4_midnight",
        x: 440,
        y: 220,
        w: 120,
        h: 60,
        label: "24 Quyển Thi & Muội Đèn [E]",
        interactRadius: 85,
        dialogueKey: "M4_DECISION"
      }
    ]
  },

  END_ALT: {
    name: "END_ALT · Dòng Lịch Sử Chưa Từng Xảy Ra",
    objective: "Đi sâu vào cõi mộng, gặp 5 linh hồn sĩ tử đang đứng đợi ngươi.",
    bgType: 'dream',
    bounds: { w: 960, h: 540 },
    playerStart: { x: 480, y: 440 },
    colliders: [
      { x: 0, y: 0, w: 960, h: 40 },
      { x: 0, y: 500, w: 960, h: 40 },
      { x: 0, y: 0, w: 40, h: 540 },
      { x: 920, y: 0, w: 40, h: 540 }
    ],
    npcs: [
      { id: "ghost_1", name: "Sĩ Tử Nguyễn", type: "ghost_scholar", x: 260, y: 170, interactRadius: 65, dialogueKey: "ALT_GHOST" },
      { id: "ghost_2", name: "Sĩ Tử Lê", type: "ghost_scholar", x: 370, y: 120, interactRadius: 65, dialogueKey: "ALT_GHOST" },
      { id: "ghost_3", name: "Sĩ Tử Trần", type: "ghost_scholar", x: 480, y: 95, interactRadius: 65, dialogueKey: "ALT_GHOST" },
      { id: "ghost_4", name: "Sĩ Tử Hoàng", type: "ghost_scholar", x: 590, y: 120, interactRadius: 65, dialogueKey: "ALT_GHOST" },
      { id: "ghost_5", name: "Sĩ Tử Phạm", type: "ghost_scholar", x: 700, y: 170, interactRadius: 65, dialogueKey: "ALT_GHOST" }
    ],
    objects: [
      {
        id: "alt_altar",
        type: "desk_m4_midnight",
        x: 440,
        y: 240,
        w: 80,
        h: 40,
        label: "Tỉnh Giấc & Trở Lại Đêm Ấy [E]",
        interactRadius: 80,
        dialogueKey: "ALT_RETURN"
      }
    ]
  },

  M5: {
    name: "M5 · Tờ Cung — Ngục Thất Bộ Hình",
    objective: "Bước đến bàn tra án, đối diện Ngục Quan và viết tờ cung khai.",
    bgType: 'prison',
    bounds: { w: 960, h: 540 },
    playerStart: { x: 180, y: 270 },
    colliders: [
      { x: 0, y: 0, w: 960, h: 50 },
      { x: 0, y: 490, w: 960, h: 50 },
      { x: 0, y: 0, w: 40, h: 540 },
      { x: 920, y: 0, w: 40, h: 540 },
      { x: 520, y: 220, w: 100, h: 60 }
    ],
    npcs: [
      {
        id: "npc_nguc_quan",
        name: "Ngục Quan Bộ Hình",
        type: "nguc_quan",
        x: 570,
        y: 170,
        interactRadius: 75,
        dialogueKey: "M5_DECISION"
      }
    ],
    objects: [
      {
        id: "desk_to_cung",
        type: "prison_interrogation_desk",
        x: 520,
        y: 220,
        w: 100,
        h: 60,
        label: "Bàn Tờ Cung [E]",
        interactRadius: 80,
        dialogueKey: "M5_DECISION"
      }
    ]
  }
};

// ==========================================================================
// 5. Player Controller
// ==========================================================================
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 190;
    this.vx = 0;
    this.vy = 0;
    this.dir = 'down';
    this.animTimer = 0;
    this.animFrame = 0;
    this.isMoving = false;
    this.targetMove = null;
  }

  update(dt, keys, colliders) {
    if (rpgState.dialogueOpen || rpgState.minigameOpen) {
      this.isMoving = false;
      this.vx = 0;
      this.vy = 0;
      return;
    }

    let dx = 0;
    let dy = 0;

    if (keys['w'] || keys['ArrowUp'] || keys['W']) dy -= 1;
    if (keys['s'] || keys['ArrowDown'] || keys['S']) dy += 1;
    if (keys['a'] || keys['ArrowLeft'] || keys['A']) dx -= 1;
    if (keys['d'] || keys['ArrowRight'] || keys['D']) dx += 1;

    if (this.targetMove) {
      const distSq = (this.targetMove.x - this.x) ** 2 + (this.targetMove.y - this.y) ** 2;
      if (distSq > 36) {
        const angle = Math.atan2(this.targetMove.y - this.y, this.targetMove.x - this.x);
        dx = Math.cos(angle);
        dy = Math.sin(angle);
      } else {
        this.targetMove = null;
      }
    }

    if (dx !== 0 && dy !== 0 && !this.targetMove) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    this.vx = dx * this.speed;
    this.vy = dy * this.speed;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.dir = dx > 0 ? 'right' : 'left';
    } else if (Math.abs(dy) > 0) {
      this.dir = dy > 0 ? 'down' : 'up';
    }

    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      this.animTimer += dt;
      this.animFrame = (this.animTimer * 5) % 2;
      rpgAudio.playFootstep();

      const newX = this.x + this.vx * dt;
      if (!this.checkCollision(newX, this.y, colliders)) {
        this.x = newX;
      }

      const newY = this.y + this.vy * dt;
      if (!this.checkCollision(this.x, newY, colliders)) {
        this.y = newY;
      }
    } else {
      this.animFrame = 0;
    }
  }

  checkCollision(x, y, colliders) {
    const halfW = 10;
    const halfH = 8;
    const footY = y + 10;

    for (let c of colliders) {
      if (
        x - halfW < c.x + c.w &&
        x + halfW > c.x &&
        footY - halfH < c.y + c.h &&
        footY + halfH > c.y
      ) {
        return true;
      }
    }
    return false;
  }
}

// ==========================================================================
// 6. RPG Game Engine Core
// ==========================================================================
class RPGGame {
  constructor() {
    this.canvas = document.getElementById('rpg-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.player = new Player(480, 440);
    this.keys = {};
    this.lastTime = performance.now();
    this.currentRoom = ROOMS.M0;

    this.setupInput();
    this.lightCanvas = document.createElement('canvas');
    this.lightCanvas.width = 960;
    this.lightCanvas.height = 540;
    this.loadData();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  async loadData() {
    try {
      const res = await fetch('game_data.json');
      rpgState.gameData = await res.json();
    } catch (e) {
      console.warn("Nạp dữ liệu dự phòng...");
    }
    this.setRoom('M0');
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        this.handleInteraction();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    const handleCanvasInput = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const targetX = (clientX - rect.left) * scaleX;
      const targetY = (clientY - rect.top) * scaleY;

      // Nếu người chơi chạm trực tiếp vào một NPC hoặc đối tượng, tiến lại gần và mở hội thoại
      if (this.currentRoom && this.currentRoom.npcs) {
        for (let npc of this.currentRoom.npcs) {
          const d = Math.hypot(targetX - npc.x, targetY - npc.y);
          if (d < npc.interactRadius + 20) {
            this.player.targetMove = { x: npc.x, y: npc.y };
            setTimeout(() => {
              if (rpgState.activeInteractable) {
                this.handleInteraction();
              }
            }, 300);
            return;
          }
        }
      }
      this.player.targetMove = { x: targetX, y: targetY };
    };

    this.canvas.addEventListener('click', (e) => {
      handleCanvasInput(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        handleCanvasInput(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Hỗ trợ phím điều hướng ảo (Virtual D-Pad) cho điện thoại
    const bindBtn = (id, key) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const press = (e) => {
        if (e && e.cancelable) e.preventDefault();
        this.keys[key] = true;
      };
      const release = (e) => {
        if (e && e.cancelable) e.preventDefault();
        this.keys[key] = false;
      };

      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('touchcancel', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);
    };

    bindBtn('btn-up', 'ArrowUp');
    bindBtn('btn-down', 'ArrowDown');
    bindBtn('btn-left', 'ArrowLeft');
    bindBtn('btn-right', 'ArrowRight');

    // Nút hành động tương tác (Action button)
    const actionBtn = document.getElementById('btn-action');
    if (actionBtn) {
      const doAction = (e) => {
        if (e && e.cancelable) e.preventDefault();
        this.handleInteraction();
      };
      actionBtn.addEventListener('click', doAction);
      actionBtn.addEventListener('touchstart', doAction, { passive: false });
    }

    // Cho phép chạm trực tiếp vào bong bóng tương tác nổi ("Nói chuyện")
    const promptBubble = document.getElementById('interaction-prompt');
    if (promptBubble) {
      const doPrompt = (e) => {
        if (e && e.cancelable) e.preventDefault();
        this.handleInteraction();
      };
      promptBubble.addEventListener('click', doPrompt);
      promptBubble.addEventListener('touchstart', doPrompt, { passive: false });
    }

    const audioBtn = document.getElementById('rpg-audio-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        rpgAudio.enabled = !rpgAudio.enabled;
        audioBtn.title = rpgAudio.enabled ? "Tắt âm thanh nhã nhạc" : "Bật âm thanh nhã nhạc";
        audioBtn.style.opacity = rpgAudio.enabled ? "1" : "0.4";
        if (rpgAudio.enabled) rpgAudio.playGong();
      });
    }

    document.getElementById('close-minigame-btn').onclick = () => {
      document.getElementById('mini-game-modal').classList.add('hidden');
      rpgState.minigameOpen = false;
    };

    document.getElementById('han-target').onclick = () => {
      if (rpgState.flags.huy_hieu_an) return;
      rpgState.flags.huy_hieu_an = true;
      rpgAudio.playSuccess();
      const target = document.getElementById('han-target');
      target.style.background = '#8b1e1e';
      target.style.color = '#fff';
      const msg = document.getElementById('minigame-msg');
      msg.classList.remove('hidden');
      msg.className = 'hunt-result success';
      msg.innerText = '✦ Tinh tường! Đã tra đúng chữ phạm húy "Húy" (諱)! Khai mở ấn tích Kê Thê Tầm Văn.';
      document.getElementById('hud-badge-box').classList.remove('hidden');
    };

    document.getElementById('close-dialogue-btn').onclick = () => {
      this.closeDialogue();
    };

    document.getElementById('btn-restart-rpg').onclick = () => {
      rpgState.score = 0;
      rpgState.stageScoreAwarded = {};
      rpgState.flags = { khuynh_huong: null, da_gac_rieng: false, huy_hieu_an: false };
      document.getElementById('rpg-score').innerText = '0';
      document.getElementById('hud-flag-box').classList.add('hidden');
      document.getElementById('hud-badge-box').classList.add('hidden');
      document.getElementById('rpg-summary-overlay').classList.add('hidden');
      this.setRoom('M0');
    };
  }

  setRoom(roomKey) {
    const room = ROOMS[roomKey];
    if (!room) return;
    this.currentRoom = room;
    rpgState.currentStage = roomKey;
    this.player.x = room.playerStart.x;
    this.player.y = room.playerStart.y;
    this.player.targetMove = null;

    document.getElementById('hud-stage-name').innerText = room.name;
    document.getElementById('quest-text').innerText = room.objective;

    const m4Banner = document.getElementById('m4-rpg-warning');
    const altLabel = document.getElementById('alt-rpg-sticky-label');

    if (roomKey === 'M4') {
      m4Banner.classList.remove('hidden');
    } else {
      m4Banner.classList.add('hidden');
    }

    if (roomKey === 'END_ALT') {
      altLabel.classList.remove('hidden');
      rpgAudio.playDreamChime();
    } else {
      altLabel.classList.add('hidden');
    }

    rpgAudio.playGong();
  }

  handleInteraction() {
    if (rpgState.dialogueOpen || rpgState.minigameOpen) return;
    if (!rpgState.activeInteractable) return;

    rpgAudio.playInteract();
    const target = rpgState.activeInteractable;

    if (target.dialogueKey === 'M3_MINIGAME') {
      this.openMinigame();
      return;
    }

    this.openDialogue(target.dialogueKey);
  }

  openMinigame() {
    rpgState.minigameOpen = true;
    document.getElementById('mini-game-modal').classList.remove('hidden');
  }

  openDialogue(key) {
    rpgState.dialogueOpen = true;
    const overlay = document.getElementById('dialogue-overlay');
    const nameEl = document.getElementById('speaker-name');
    const roleEl = document.getElementById('speaker-role');
    const avatarEl = document.getElementById('speaker-avatar');
    const textEl = document.getElementById('dialogue-text');
    const choicesEl = document.getElementById('dialogue-choices');
    const feedbackEl = document.getElementById('dialogue-feedback');

    feedbackEl.classList.add('hidden');
    choicesEl.innerHTML = '';
    overlay.classList.remove('hidden');

    // 1. M0: Quan Chánh Chủ Khảo
    if (key === 'M0_INTRO' || key === 'M0_GATE') {
      nameEl.innerText = "Quan Chánh Chủ Khảo";
      if (roleEl) roleEl.innerText = "Trường thi Thừa Thiên (1841)";
      avatarEl.className = "speaker-avatar avatar-chanh-khao";
      textEl.innerHTML = "Chào Chu Thần Cao tiên sinh! Hàng nghìn quyển thi năm Tân Sửu đang chờ quý ngài chấm Sơ khảo. Vua Thiệu Trị tân cơ khai khoa, trường quy cực kỳ nghiêm mật. Xin mời tiên sinh bước vào trường!";

      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-id">VÀO TRƯỜNG</span><span class="choice-content">Bước vào thư phòng đêm trước ngày đóng cổng trường.</span><span class="choice-meta">Khởi hành</span>`;
      btn.onclick = () => {
        this.closeDialogue();
        this.setRoom('M1');
      };
      choicesEl.appendChild(btn);
    }
    // 2. M0: Lính Lệ Canh Cổng
    else if (key === 'M0_GUARD') {
      nameEl.innerText = "Lính Lệ Canh Cổng";
      if (roleEl) roleEl.innerText = "Binh đinh bộ Lễ";
      avatarEl.className = "speaker-avatar avatar-linh-le";
      textEl.innerHTML = "Bẩm quan Sơ khảo, trường thi đã nội bất xuất, ngoại bất nhập! Xin quan lại gặp quan Chánh Chủ Khảo đang đứng giữa sân để nhận thẻ bài vào trường.";

      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-id">ĐÃ RÕ</span><span class="choice-content">Ta sẽ đến diện kiến quan Chánh Chủ Khảo ngay.</span>`;
      btn.onclick = () => {
        this.closeDialogue();
      };
      choicesEl.appendChild(btn);
    }
    // 3. M1: Bàn Sách Trường Quy
    else if (key === 'M1_DECISION') {
      nameEl.innerText = "Cao Bá Quát (Chu Thần)";
      if (roleEl) roleEl.innerText = "Đêm suy ngẫm trường quy";
      avatarEl.className = "speaker-avatar avatar-quat";
      textEl.innerHTML = "Đêm. Trên bàn là tập <span class='glossary-term' onclick='openGlossary(\"trường quy\")'>[[trường quy]]</span>. <span class='glossary-term' onclick='openGlossary(\"phạm húy\")'>[[Phạm húy]]</span>, <span class='glossary-term' onclick='openGlossary(\"khiếm tị\")'>[[khiếm tị]]</span>, viết sai tên vua: trượt, bất kể văn hay đến đâu. Ta lật tới trang cuối rồi đặt bút xuống... Ta tự nhủ điều gì?";

      const choices = [
        { id: "M1-A", text: "Phép là phép. Ta chấm theo lệ.", score: 30, flag: "TRONG_PHEP", fb: "Ngươi gấp sách, thổi nến." },
        { id: "M1-B", text: "Văn chương là gốc. Lệ chỉ là cành.", score: 30, flag: "TRONG_TAI", fb: "Ngươi ngồi thêm một lúc nữa." },
        { id: "M1-C", text: "Chưa vào trường, chưa biết được.", score: 30, flag: "TRUNG_DUNG", fb: "Ngươi thổi nến, không kết luận gì." }
      ];

      choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="choice-id">${c.id}</span><span class="choice-content">${c.text}</span><span class="choice-meta">+30đ</span>`;
        btn.onclick = () => {
          this.applyChoice("M1", c.score, { khuynh_huong: c.flag }, c.fb);
          setTimeout(() => {
            this.closeDialogue();
            document.getElementById('quest-text').innerText = "Đã định khuynh hướng. Hãy bước qua cửa vào Nội Trường chấm thi.";
          }, 1200);
        };
        choicesEl.appendChild(btn);
      });
    }
    // 4. M1 Door
    else if (key === 'M1_DOOR') {
      if (!rpgState.flags.khuynh_huong) {
        nameEl.innerText = "Nội tâm Chu Thần";
        if (roleEl) roleEl.innerText = "Tự vấn";
        avatarEl.className = "speaker-avatar avatar-quat";
        textEl.innerHTML = "Ngươi chưa định rõ khuynh hướng chấm thi đêm nay. Hãy lại bàn đọc tập Trường Quy trước khi vào trường.";
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="choice-id">QUAY LẠI</span><span class="choice-content">Đọc lại tập Trường Quy trên bàn.</span>`;
        btn.onclick = () => this.closeDialogue();
        choicesEl.appendChild(btn);
      } else {
        this.closeDialogue();
        this.setRoom('M2');
      }
    }
    // 5. M2: Quyển Thi Thứ 17
    else if (key === 'M2_DECISION') {
      nameEl.innerText = "Cao Bá Quát (Sơ Khảo)";
      if (roleEl) roleEl.innerText = "Ngày chấm thứ hai";
      avatarEl.className = "speaker-avatar avatar-quat";
      textEl.innerHTML = "Ngày chấm thứ hai. Quyển thứ mười bảy: văn khí mạnh, lập luận sắc, đáng hạng ưu. Nhưng đến dòng thứ tư, tay ta dừng bút — một chữ <span class='glossary-term' onclick='openGlossary(\"phạm húy\")'>[[phạm húy]]</span>! Quyển này theo <span class='glossary-term' onclick='openGlossary(\"trường quy\")'>[[trường quy]]</span> phải trượt. Xử lý thế nào?";

      const choices = [
        { id: "M2-A", text: "Phê trượt, đúng theo trường quy.", score: 50, fb: "Ngươi hạ bút. Tay hơi chậm lại." },
        { id: "M2-B", text: "Trình quan Chánh chủ khảo xin ý.", score: 40, fb: "Câu trả lời nhận được: lệ đã rõ." },
        { id: "M2-C", text: "Gác riêng quyển ấy. Chấm tiếp đã.", score: 35, flag: { da_gac_rieng: true }, fb: "Quyển thi nằm lại một góc bàn." }
      ];

      choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="choice-id">${c.id}</span><span class="choice-content">${c.text}</span><span class="choice-meta">+${c.score}đ</span>`;
        btn.onclick = () => {
          this.applyChoice("M2", c.score, c.flag || {}, c.fb);
          setTimeout(() => {
            this.closeDialogue();
            document.getElementById('quest-text').innerText = "Đã xử lý quyển 17. Hãy tiến sang phòng Sơ khảo đêm gặp Phan Nhạ.";
          }, 1200);
        };
        choicesEl.appendChild(btn);
      });
    }
    // 6. M2 Door
    else if (key === 'M2_DOOR') {
      if (!rpgState.stageScoreAwarded["M2"]) {
        nameEl.innerText = "Nội tâm Chu Thần";
        if (roleEl) roleEl.innerText = "Tự vấn";
        avatarEl.className = "speaker-avatar avatar-quat";
        textEl.innerHTML = "Ngươi chưa xử lý quyển thi số mười bảy trên bàn.";
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="choice-id">QUAY LẠI</span><span class="choice-content">Đến bàn số 17 kiểm tra bài thi.</span>`;
        btn.onclick = () => this.closeDialogue();
        choicesEl.appendChild(btn);
      } else {
        this.closeDialogue();
        this.setRoom('M3');
      }
    }
    // 7. M3: Phan Nhạ & Đĩa Muội Đèn
    else if (key === 'M3_DECISION') {
      nameEl.innerText = "Phan Nhạ";
      if (roleEl) roleEl.innerText = "Đồng viện Sơ khảo";
      avatarEl.className = "speaker-avatar avatar-phan-nha";

      let opener = rpgState.flags.da_gac_rieng
        ? "Phan Nhạ nhìn góc bàn ngươi: 'Quyển bài khi chiều ông gác riêng đó, tôi cũng vừa xem qua...'"
        : "Phan Nhạ hạ giọng, vẻ mặt trầm tư: 'Tôi đếm được hai mươi tư quyển như thế...'";

      let mascotLine = "";
      if (rpgState.flags.khuynh_huong === 'TRONG_PHEP') {
        mascotLine = "<br><br><i>(Ngươi đã tự nhủ sẽ chấm theo lệ. Đêm nay lệ ấy đang nhìn ngươi.)</i>";
      } else if (rpgState.flags.khuynh_huong === 'TRONG_TAI') {
        mascotLine = "<br><br><i>(Ngươi từng nhủ văn chương là gốc. Đêm nay những tài năng ấy đang đặt trong tay ngươi.)</i>";
      }

      textEl.innerHTML = `${opener} Toàn văn hay. Chỉ vướng vài chữ. Ông ấy đặt xuống đĩa <span class='glossary-term' onclick='openGlossary(\"muội đèn\")'>[[muội đèn]]</span>: 'Chữa một nét, cứu một đời. Ông tính sao?'${mascotLine}`;

      const choices = [
        { id: "M3-A", text: "Không. Việc này là tội.", score: 50, fb: "Ông ấy không nói thêm. Đĩa muội đèn vẫn để đó." },
        { id: "M3-B", text: "Để tôi xem lại những quyển ấy.", score: 45, fb: "Ngươi cầm quyển đầu tiên lên." },
        { id: "M3-C", text: "Hai mươi tư người... ông nói tiếp đi.", score: 35, fb: "Phan Nhạ kể tên vài người. Ngươi nghe hết." }
      ];

      choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="choice-id">${c.id}</span><span class="choice-content">${c.text}</span><span class="choice-meta">+${c.score}đ</span>`;
        btn.onclick = () => {
          this.applyChoice("M3", c.score, {}, c.fb);
          setTimeout(() => {
            this.closeDialogue();
            document.getElementById('quest-text').innerText = "Thời khắc canh ba đã điểm. Tiến vào đại sảnh trường thi.";
          }, 1200);
        };
        choicesEl.appendChild(btn);
      });
    }
    // 8. M3 Door
    else if (key === 'M3_DOOR') {
      if (!rpgState.stageScoreAwarded["M3"]) {
        nameEl.innerText = "Nội tâm Chu Thần";
        if (roleEl) roleEl.innerText = "Tự vấn";
        avatarEl.className = "speaker-avatar avatar-quat";
        textEl.innerHTML = "Hãy đáp lời Phan Nhạ trước khi canh ba buông xuống.";
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="choice-id">QUAY LẠI</span><span class="choice-content">Trò chuyện với Phan Nhạ.</span>`;
        btn.onclick = () => this.closeDialogue();
        choicesEl.appendChild(btn);
      } else {
        this.closeDialogue();
        this.setRoom('M4');
      }
    }
    // 9. M4: Canh Ba Sinh Tử
    else if (key === 'M4_DECISION') {
      nameEl.innerText = "Cao Bá Quát (Chu Thần)";
      if (roleEl) roleEl.innerText = "Canh ba — Sinh tử nhị nguyên";
      avatarEl.className = "speaker-avatar avatar-quat";
      textEl.innerHTML = "Canh ba. Trường thi lặng như tờ. Trước mặt: hai mươi tư quyển thi, một đĩa <span class='glossary-term' onclick='openGlossary(\"muội đèn\")'>[[muội đèn]]</span>, một ngọn nến gần tàn. Ngoài kia, những người viết chúng đang chờ tin. Ngươi có chữa những chữ phạm quy ấy không?";

      const choices = [
        { id: "M4-A", text: "Chữa. Cứu người tài trước đã.", score: 50, target: "M5", fb: "Khớp sử liệu! Ngươi cùng Phan Nhạ nhúng ngọn bút vào muội đèn..." },
        { id: "M4-B", text: "Không chữa. Giữ mình, giữ phép.", score: 50, target: "END_ALT", fb: "Ngươi rụt tay lại. Lịch sử bắt đầu rẽ sang nhánh giả tưởng..." }
      ];

      choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="choice-id">${c.id}</span><span class="choice-content">${c.text}</span><span class="choice-meta">+50đ</span>`;
        btn.onclick = () => {
          this.applyChoice("M4", c.score, {}, c.fb);
          setTimeout(() => {
            this.closeDialogue();
            this.setRoom(c.target);
          }, 1300);
        };
        choicesEl.appendChild(btn);
      });
    }
    // 10. END_ALT Ghost Scholar
    else if (key === 'ALT_GHOST') {
      nameEl.innerText = "Linh Hồn Sĩ Tử";
      if (roleEl) roleEl.innerText = "Bóng hình trong mộng ảo";
      avatarEl.className = "speaker-avatar avatar-ghost";
      textEl.innerHTML = "Gương mặt sĩ tử hiện về trong làn sương mờ mộng, không hề lớn tiếng, chỉ lặng lẽ nhìn ngươi mà hỏi:<br><br><i>'Ngài đọc được văn hay của tôi, sao còn để tôi trượt vì một nét chữ?'</i>";

      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-id">LẮNG NGHE</span><span class="choice-content">Lòng trĩu nặng, tiếp tục bước đi trong cõi mộng...</span>`;
      btn.onclick = () => this.closeDialogue();
      choicesEl.appendChild(btn);
    }
    // 11. END_ALT Return
    else if (key === 'ALT_RETURN') {
      nameEl.innerText = "Bừng Tỉnh Giữa Canh Khuya";
      if (roleEl) roleEl.innerText = "Tâm cảnh Chu Thần";
      avatarEl.className = "speaker-avatar avatar-quat";
      textEl.innerHTML = "Ngươi choàng tỉnh giữa canh khuya, mồ hôi lạnh toát. Ngọn nến trước mặt vẫn cháy leo lét, đĩa muội đèn vẫn còn nguyên đó. Đêm ấy vẫn chưa qua!";

      const btn = document.createElement('button');
      btn.className = 'return-btn';
      btn.innerHTML = `Trở lại đêm ấy ↩ (Giữ nguyên điểm)`;
      btn.onclick = () => {
        this.closeDialogue();
        this.setRoom('M4');
      };
      choicesEl.appendChild(btn);
    }
    // 12. M5: Ngục Quan Bộ Hình
    else if (key === 'M5_DECISION') {
      nameEl.innerText = "Ngục Quan Bộ Hình";
      if (roleEl) roleEl.innerText = "Án thẩm trường thi";
      avatarEl.className = "speaker-avatar avatar-nguc-quan";

      let greeting = "Việc dùng muội đèn chữa bài thi đã bị phát giác! Bản án sơ thẩm là <span class='glossary-term' onclick='openGlossary(\"trảm quyết\")'>[[trảm quyết]]</span>. Trước mặt là <span class='glossary-term' onclick='openGlossary(\"tờ cung\")'>[[tờ cung]]</span> và cây bút. Ngươi khai thế nào?";
      if (rpgState.flags.khuynh_huong === 'TRONG_PHEP') {
        greeting = "Kẻ luôn miệng xưng trọng phép tắc, hóa ra lại to gan đổi trắng thay đen nơi trường quy! Khai mau!";
      } else if (rpgState.flags.khuynh_huong === 'TRONG_TAI') {
        greeting = "Chỉ vì tiếc mấy câu văn của lũ hàn sĩ mà chuốc vạ diệt thân, có đáng không? Viết cung khai!";
      }
      textEl.innerHTML = greeting;

      const choices = [
        { id: "M5-A", text: "Nhận hết. Việc do tôi làm.", score: 50, fb: "Ngươi viết, không thêm một chữ biện bạch." },
        {
          id: "M5-B",
          text: "Khai rõ vì tiếc người tài.",
          score: 50,
          verbatim: true,
          fb: `"Tôi thấy các bài hay sính bút làm vậy chứ không ai gửi gắm, dặn dò gì cả."`
        },
        { id: "M5-C", text: "Phủ nhận toàn bộ.", score: 15, fb: "Lời khai không khớp với vật chứng còn đó." }
      ];

      choices.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="choice-id">${c.id}</span><span class="choice-content">${c.text}</span><span class="choice-meta">+${c.score}đ</span>`;
        btn.onclick = () => {
          this.applyChoice("M5", c.score, {}, c.fb, c.verbatim);
          setTimeout(() => {
            this.closeDialogue();
            this.showSummary();
          }, 1800);
        };
        choicesEl.appendChild(btn);
      });
    }
  }

  applyChoice(stageId, score, flags, feedback, isVerbatim = false) {
    rpgAudio.playChoice();
    if (!rpgState.stageScoreAwarded[stageId]) {
      rpgState.score += score;
      rpgState.stageScoreAwarded[stageId] = score;
      document.getElementById('rpg-score').innerText = rpgState.score;
    }

    if (flags.khuynh_huong) {
      rpgState.flags.khuynh_huong = flags.khuynh_huong;
      const box = document.getElementById('hud-flag-box');
      const text = document.getElementById('hud-flag-text');
      box.classList.remove('hidden');
      if (flags.khuynh_huong === 'TRONG_PHEP') text.innerText = "Trọng Phép";
      if (flags.khuynh_huong === 'TRONG_TAI') text.innerText = "Trọng Tài";
      if (flags.khuynh_huong === 'TRUNG_DUNG') text.innerText = "Trung Dung";
    }

    if (flags.da_gac_rieng) {
      rpgState.flags.da_gac_rieng = true;
    }

    const fbBox = document.getElementById('dialogue-feedback');
    fbBox.classList.remove('hidden');
    if (isVerbatim) {
      fbBox.innerHTML = `
        <div class="verbatim-badge">Hồ Sơ Án Lịch Sử • Trích Nguyên Văn</div>
        <div class="court-record-exact-italic">${feedback}</div>
      `;
    } else {
      fbBox.innerText = feedback;
    }

    const btns = document.querySelectorAll('.dialogue-choices-grid .choice-btn');
    btns.forEach(b => b.disabled = true);
  }

  closeDialogue() {
    rpgState.dialogueOpen = false;
    document.getElementById('dialogue-overlay').classList.add('hidden');
  }

  showSummary() {
    const overlay = document.getElementById('rpg-summary-overlay');
    overlay.classList.remove('hidden');

    document.getElementById('sum-score').innerText = rpgState.score;
    document.getElementById('sum-badge').innerText = rpgState.flags.huy_hieu_an ? '1' : '0';

    let trait = "Khảng Khái Trọng Tài";
    if (rpgState.flags.khuynh_huong === 'TRONG_PHEP') trait = "Nghiêm Cẩn Trọng Phép";
    if (rpgState.flags.khuynh_huong === 'TRUNG_DUNG') trait = "Thận Trọng Trung Dung";
    document.getElementById('sum-trait').innerText = trait;

    document.getElementById('sum-truth').innerText =
      "Trong lịch sử, vua Thiệu Trị sau khi thẩm định kỹ đã giảm án từ 'Trảm quyết' xuống 'Giảo giam hậu', sau đó tha tội chết, đày đi hiệu lực ở quân thứ Trấn Tây (Campuchia), rồi cử theo đoàn đi sứ Hạ Châu (Singapore). 24 quyển thi được chữa đều bị hủy kết quả để thi lại.";

    document.getElementById('sum-character').innerText =
      "Dù vi phạm trường quy phong kiến, hành động của Cao Bá Quát hoàn toàn vì tiếc nuối nhân tài đất nước, không mảy may tư lợi hay ăn hối lộ. Khí phách 'thấy bài hay sính bút' đã làm rạng danh tiết tháo của bậc Thánh thi văn chương một thời.";
  }

  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.player.update(dt, this.keys, this.currentRoom.colliders);
    this.checkInteractions();
    this.render(currentTime);

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  checkInteractions() {
    let closest = null;
    let minD = Infinity;

    for (let npc of this.currentRoom.npcs) {
      const d = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
      if (d < npc.interactRadius && d < minD) {
        minD = d;
        closest = npc;
      }
    }

    for (let obj of this.currentRoom.objects) {
      const centerX = obj.x + obj.w / 2;
      const centerY = obj.y + obj.h / 2;
      const d = Math.hypot(this.player.x - centerX, this.player.y - centerY);
      if (d < obj.interactRadius && d < minD) {
        minD = d;
        closest = obj;
      }
    }

    rpgState.activeInteractable = closest;
    const prompt = document.getElementById('interaction-prompt');

    if (closest && !rpgState.dialogueOpen && !rpgState.minigameOpen) {
      prompt.classList.remove('hidden');
      const label = closest.name ? `Nói chuyện với ${closest.name}` : (closest.label || 'Tương tác');
      document.getElementById('prompt-label').innerText = label;
    } else {
      prompt.classList.add('hidden');
    }
  }

  render(time) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const room = this.currentRoom;

    // 1. Draw High-Quality Scene Background
    let bgImg = SCENE_ASSETS.exam;
    if (room.bgType === 'M0') bgImg = SCENE_ASSETS.M0;
    else if (room.bgType === 'dream') bgImg = SCENE_ASSETS.dream;
    else if (room.bgType === 'prison') bgImg = SCENE_ASSETS.prison;

    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      ctx.drawImage(bgImg, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#1c1511';
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Draw Interactive World Objects
    for (let obj of room.objects) {
      const isTarget = rpgState.activeInteractable === obj;
      SpriteRenderer.drawObject(ctx, obj, time, isTarget);
    }

    // 3. Draw NPCs
    for (let npc of room.npcs) {
      const isTarget = rpgState.activeInteractable === npc;
      SpriteRenderer.drawNPC(ctx, npc, time, isTarget);
    }

    // 4. Draw Player Character (Cao Bá Quát)
    SpriteRenderer.drawCaoBaQuat(
      ctx,
      this.player.x,
      this.player.y,
      this.player.dir,
      this.player.animFrame,
      this.player.isMoving
    );

    // 5. Draw Atmospheric 2D Candlelight & Lantern Glow
    this.renderLighting(ctx, w, h, time);
  }

  renderLighting(ctx, w, h, time) {
    ctx.save();
    if (!this.lightCanvas) {
      this.lightCanvas = document.createElement('canvas');
      this.lightCanvas.width = w;
      this.lightCanvas.height = h;
    }
    const lightCanvas = this.lightCanvas;
    const lctx = lightCanvas.getContext('2d');
    lctx.clearRect(0, 0, w, h);

    // Base ambient darkness
    lctx.fillStyle = rpgState.currentStage === 'END_ALT' ? 'rgba(8, 5, 20, 0.65)' : 'rgba(5, 5, 8, 0.45)';
    lctx.fillRect(0, 0, w, h);

    // Player Light (Warm lantern radius)
    const flicker = Math.sin(time * 0.015) * 6;
    const radius = 160 + flicker;

    lctx.globalCompositeOperation = 'destination-out';
    const radG = lctx.createRadialGradient(
      this.player.x,
      this.player.y,
      10,
      this.player.x,
      this.player.y,
      radius
    );
    radG.addColorStop(0, 'rgba(0,0,0,1)');
    radG.addColorStop(0.75, 'rgba(0,0,0,0.6)');
    radG.addColorStop(1, 'rgba(0,0,0,0)');
    lctx.fillStyle = radG;
    lctx.beginPath();
    lctx.arc(this.player.x, this.player.y, radius, 0, Math.PI * 2);
    lctx.fill();

    // Secondary object lights
    for (let obj of this.currentRoom.objects) {
      if (obj.type.includes('desk') || obj.type.includes('soot') || obj.type.includes('gate')) {
        const objX = obj.x + obj.w / 2;
        const objY = obj.y + obj.h / 2;
        const oRad = lctx.createRadialGradient(objX, objY, 8, objX, objY, 110 + flicker);
        oRad.addColorStop(0, 'rgba(0,0,0,1)');
        oRad.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = oRad;
        lctx.beginPath();
        lctx.arc(objX, objY, 110 + flicker, 0, Math.PI * 2);
        lctx.fill();
      }
    }

    ctx.drawImage(lightCanvas, 0, 0);
    ctx.restore();
  }
}

// ==========================================================================
// 7. Sino-Vietnamese Glossary Popover
// ==========================================================================
function openGlossary(termKey) {
  const modal = document.getElementById('glossary-modal');
  const wordEl = document.getElementById('modal-term-word');
  const hanEl = document.getElementById('modal-term-han');
  const defEl = document.getElementById('modal-term-def');
  const noteEl = document.getElementById('modal-term-note');

  const dict = {
    "phạm húy": { w: "Phạm húy", han: "犯諱", def: "Viết trúng tên thật của vua, chúa, hoàng tộc thời xưa. Lỗi này bị đánh trượt ngay lập tức dù văn hay tới đâu.", note: "⚠ Cần cố vấn duyệt cách diễn giải cho Gen Z" },
    "khiếm tị": { w: "Khiếm tị", han: "欠避", def: "Quên né chữ kiêng hoặc thiếu nét né âm húy theo quy tắc trường thi, nhẹ hơn phạm húy nhưng vẫn rớt đài.", note: "⚠ Cần cố vấn duyệt cách diễn giải" },
    "trường quy": { w: "Trường quy", han: "場規", def: "Bộ luật nội quy thi cử phong kiến siêu nghiêm ngặt, sai sót một ly là hỏng cả sự nghiệp khoa cử.", note: "⚠ Cần cố vấn duyệt" },
    "muội đèn": { w: "Muội đèn", han: "燈煤", def: "Bồ hóng than cạo từ đáy đĩa dầu thắp nến, trộn nước tạo mực đen tiệp màu để chữa nét chữ phạm quy.", note: "⚠ Cố vấn xác nhận công dụng" },
    "trảm quyết": { w: "Trảm quyết", han: "斬決", def: "Bản án tử hình xử chém đầu ngay lập tức, không đợi xét giảm vào mùa thu." },
    "tờ cung": { w: "Tờ cung", han: "供狀", def: "Văn bản ghi lời khai báo, nhận tội trước hội đồng thẩm án triều đình." }
  };

  const item = dict[termKey.toLowerCase()] || { w: termKey, han: "字", def: "Thuật ngữ Hán Việt trong khoa cử triều Nguyễn." };

  wordEl.innerText = item.w;
  hanEl.innerText = item.han;
  defEl.innerText = item.def;
  if (item.note) {
    noteEl.innerText = item.note;
    noteEl.classList.remove('hidden');
  } else {
    noteEl.classList.add('hidden');
  }

  modal.classList.remove('hidden');
  rpgAudio.playInteract();
}

document.getElementById('close-modal-btn').onclick = () => {
  document.getElementById('glossary-modal').classList.add('hidden');
};

// Auto Start Game Engine on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.rpgGame = new RPGGame();
});
