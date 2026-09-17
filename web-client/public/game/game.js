/**
 * Cao Bá Quát — Đêm Chấm Thi (1841)
 * Interactive Narrative Game Engine & Visual Novel State Controller
 * Fully implements GDD M0-M5 + END_ALT, scoring, flags, Gen Z glossary, audio synthesis & timers.
 */

// Global Game State
const gameState = {
  stageId: "M0",
  score: 0,
  stageScoreAwarded: {},
  flags: {
    khuynh_huong: null, // "TRONG_PHEP" | "TRONG_TAI" | "TRUNG_DUNG"
    da_gac_rieng: false,
    huy_hieu_an: false
  },
  timerSecondsRemaining: 0,
  timerInterval: null,
  audioEnabled: true,
  currentAltBeat: 1,
  gameData: null
};

// ==========================================================================
// Web Audio API Procedural Sound Synthesizer (Zero External Dependencies)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playGong() {
    if (!gameState.audioEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(130, this.ctx.currentTime + 2.5);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 2.5);
  }

  playPaper() {
    if (!gameState.audioEnabled) return;
    this.init();
    if (!this.ctx) return;

    // Buffer noise for paper rustle
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playTenseTick() {
    if (!gameState.audioEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playDreamChime() {
    if (!gameState.audioEnabled) return;
    this.init();
    if (!this.ctx) return;

    const freqs = [330, 440, 523.25, 659.25];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.15);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.15 + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.15);
      osc.stop(this.ctx.currentTime + idx * 0.15 + 1.8);
    });
  }

  playAwakenShock() {
    if (!gameState.audioEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(240, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playSuccessBell() {
    if (!gameState.audioEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }
}

const sfx = new SoundFX();

// ==========================================================================
// Ambient Canvas Particle & Light Animation
// ==========================================================================
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedY: -(Math.random() * 0.4 + 0.15),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      flickerSpeed: Math.random() * 0.04 + 0.01,
      color: Math.random() > 0.4 ? 'rgba(230, 176, 66,' : 'rgba(192, 57, 43,'
    });
  }

  let candlePulse = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Subtle Candlelight Radial Ambient at bottom
    candlePulse += 0.04;
    const flickerRadius = Math.min(width, height) * 0.55 + Math.sin(candlePulse) * 15;
    const radial = ctx.createRadialGradient(
      width * 0.5,
      height * 0.95,
      10,
      width * 0.5,
      height * 0.95,
      flickerRadius
    );
    radial.addColorStop(0, 'rgba(230, 160, 45, 0.08)');
    radial.addColorStop(0.5, 'rgba(140, 50, 20, 0.03)');
    radial.addColorStop(1, 'rgba(11, 14, 20, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Drifting Ink & Ember Motes
    for (let p of particles) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.alpha += Math.sin(candlePulse * 2) * p.flickerSpeed;
      if (p.alpha < 0.1) p.alpha = 0.1;
      if (p.alpha > 0.8) p.alpha = 0.8;

      if (p.y < 0) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      ctx.fillStyle = `${p.color} ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}

// ==========================================================================
// Data Loader & Initialization
// ==========================================================================
async function loadGameData() {
  try {
    const res = await fetch('game_data.json');
    if (!res.ok) throw new Error('Không thể tải file dữ liệu game_data.json');
    gameState.gameData = await res.json();
    setupGlossaryTerms();
    renderStage('M0');
  } catch (err) {
    console.error('Lỗi nạp game_data.json:', err);
    document.getElementById('narrative-body').innerText =
      'Đang nạp dữ liệu trực tiếp từ bộ nhớ hệ thống...';
    // Fallback if running from file:// without local server
    applyEmbeddedDataFallback();
  }
}

// Embedded Fallback ensures zero setup failures even if opened via direct file:// protocol
function applyEmbeddedDataFallback() {
  // Built-in clone of the GDD dataset
  gameState.gameData = {
    "project": {
      "title": "Cao Bá Quát — Đêm Chấm Thi",
      "year_setting": 1841
    },
    "glossary": {
      "phạm húy": {
        "word": "Phạm húy",
        "han_tu": "犯諱",
        "definition_genz": "Viết trúng tên thật của vua, chúa, hoàng tộc thời xưa. Lỗi này là án tử cho bài thi, bị loại ngay lập tức dù văn chương đỉnh cỡ nào.",
        "advisor_note": "⚠ Cần cố vấn duyệt cách diễn giải cho người đọc phổ thông."
      },
      "khiếm tị": {
        "word": "Khiếm tị",
        "han_tu": "欠避",
        "definition_genz": "Quên né chữ kiêng hoặc thiếu nét né âm húy theo quy tắc trường thi (thiếu tôn kính ngầm), nhẹ hơn phạm húy trực tiếp nhưng vẫn rớt đài.",
        "advisor_note": "⚠ Cần cố vấn duyệt cách diễn giải cho người đọc phổ thông."
      },
      "trường quy": {
        "word": "Trường quy",
        "han_tu": "場規",
        "definition_genz": "Bộ luật nội quy siêu nghiêm ngặt trong phòng thi khoa cử phong kiến, sai một ly là đi cả đời học vấn.",
        "advisor_note": "⚠ Cần cố vấn duyệt cách diễn giải cho người đọc phổ thông."
      },
      "sơ khảo": {
        "word": "Sơ khảo",
        "han_tu": "初考",
        "definition_genz": "Quan chấm thi vòng 1, có nhiệm vụ đọc và chấm ban đầu trước khi chuyển lên quan Phúc khảo và Chánh/Phó chủ khảo."
      },
      "hành tẩu": {
        "word": "Hành tẩu",
        "han_tu": "行走",
        "definition_genz": "Chức quan tập sự, chuyên phụ trách giấy tờ sự vụ tại các bộ (ở đây là bộ Lễ triều Nguyễn)."
      },
      "muội đèn": {
        "word": "Muội đèn",
        "han_tu": "燈煤",
        "definition_genz": "Bồ hóng than cạo từ đĩa dầu thắp nến/đèn dầu, thời xưa trộn với nước để tạo màu đen tiệp màu mực son/mực tàu nhằm chữa nét chữ.",
        "advisor_note": "⚠ Cần cố vấn xác nhận cách mô tả công dụng."
      },
      "trảm quyết": {
        "word": "Trảm quyết",
        "han_tu": "斬決",
        "definition_genz": "Bản án tử hình xử chém đầu ngay lập tức, không chờ đến mùa thu xét giảm án."
      },
      "tờ cung": {
        "word": "Tờ cung",
        "han_tu": "供狀",
        "definition_genz": "Văn bản ghi lời nhận tội hoặc khai báo trước cơ quan tư pháp/hội đồng thẩm án phong kiến."
      }
    },
    "stages": [
      {
        "id": "M0",
        "type": "intro",
        "title": "Mở đầu",
        "time_limit": 0,
        "period": "Trước ngày vào trường thi, năm 1841",
        "location": "Kinh thành Huế",
        "mascot_dialogue": "Ngươi là Cao Bá Quát, hiệu Chu Thần — người ta gọi ngươi là Thánh của văn chương Bắc Hà.",
        "narrative": "Huế, năm 1841. Vua Thiệu Trị vừa lên ngôi. Ngươi giữ chức [[Hành tẩu]], đang tập sự ở bộ Lễ, vừa được cử làm [[Sơ khảo]] trường thi Thừa Thiên. Hàng nghìn quyển thi đang chờ chấm — trong đó có những quyển sẽ định lại cả phần đời còn lại của ngươi.",
        "next_stage": "M1"
      },
      {
        "id": "M1",
        "type": "chon_khuynh_huong",
        "title": "Đêm trước ngày vào trường",
        "time_limit": 40,
        "period": "Đêm trước giờ đóng cửa trường thi",
        "location": "Thư phòng riêng, quán trọ quan lại",
        "narrative": "Đêm. Trên bàn là tập [[trường quy]]. [[Phạm húy]], [[khiếm tị]], viết sai tên vua: trượt, bất kể văn hay đến đâu. Ngươi lật tới trang cuối rồi đặt bút xuống, chưa ngủ.",
        "mission": "Ngươi tự nhủ điều gì?",
        "choices": [
          {
            "id": "M1-A",
            "text": "Phép là phép. Ta chấm theo lệ.",
            "score": 30,
            "immediate_feedback": "Ngươi gấp sách, thổi nến.",
            "set_flags": { "khuynh_huong": "TRONG_PHEP" },
            "next_stage": "M2"
          },
          {
            "id": "M1-B",
            "text": "Văn chương là gốc. Lệ chỉ là cành.",
            "score": 30,
            "immediate_feedback": "Ngươi ngồi thêm một lúc nữa.",
            "set_flags": { "khuynh_huong": "TRONG_TAI" },
            "next_stage": "M2"
          },
          {
            "id": "M1-C",
            "text": "Chưa vào trường, chưa biết được.",
            "score": 30,
            "immediate_feedback": "Ngươi thổi nến, không kết luận gì.",
            "set_flags": { "khuynh_huong": "TRUNG_DUNG" },
            "next_stage": "M2"
          }
        ]
      },
      {
        "id": "M2",
        "type": "thuong",
        "title": "Quyển thi thứ mười bảy",
        "time_limit": 45,
        "period": "Ngày chấm thứ hai",
        "location": "Nội trường thi Thừa Thiên",
        "narrative": "Ngày chấm thứ hai. Quyển thứ mười bảy: văn khí mạnh, lập luận sắc, đáng hạng ưu. Nhưng đến dòng thứ tư, ngươi dừng bút — một chữ [[phạm húy]]. Theo [[trường quy]], quyển này phải trượt. Người viết hẳn không hề hay biết mình vừa mất cả kỳ thi vì một nét chữ.",
        "mission": "Ngươi xử lý quyển thi này thế nào?",
        "choices": [
          {
            "id": "M2-A",
            "text": "Phê trượt, đúng theo trường quy.",
            "score": 50,
            "immediate_feedback": "Ngươi hạ bút. Tay hơi chậm lại.",
            "set_flags": {},
            "next_stage": "M3"
          },
          {
            "id": "M2-B",
            "text": "Trình quan Chánh chủ khảo xin ý.",
            "score": 40,
            "immediate_feedback": "Câu trả lời nhận được: lệ đã rõ.",
            "set_flags": {},
            "next_stage": "M3"
          },
          {
            "id": "M2-C",
            "text": "Gác riêng quyển ấy. Chấm tiếp đã.",
            "score": 35,
            "immediate_feedback": "Quyển thi nằm lại một góc bàn.",
            "set_flags": { "da_gac_rieng": true },
            "next_stage": "M3"
          }
        ]
      },
      {
        "id": "M3",
        "type": "thuong",
        "title": "Đĩa muội đèn",
        "time_limit": 50,
        "period": "Đêm trường thi, canh hai",
        "location": "Phòng chấm Sơ khảo",
        "flavor_openers": {
          "da_gac_rieng_true": "Phan Nhạ bước tới nhìn góc bàn ngươi: 'Quyển bài khi chiều ông gác riêng đó, tôi cũng vừa xem qua...'",
          "da_gac_rieng_false": "Phan Nhạ tới bên bàn ngươi, vẻ mặt trầm tư kéo ghế ngồi xuống."
        },
        "mascot_voice": {
          "TRONG_PHEP": "Ngươi đã tự nhủ sẽ chấm theo lệ. Đêm nay lệ ấy đang nhìn ngươi.",
          "TRONG_TAI": "Ngươi từng nhủ văn chương là gốc. Đêm nay những tài năng ấy đang đặt trong tay ngươi.",
          "TRUNG_DUNG": "Ngươi từng nhủ chưa vào trường chưa biết. Giờ ngươi đã ở giữa lòng trường thi."
        },
        "narrative": "Phan Nhạ hạ giọng: 'Tôi đếm được hai mươi tư quyển như thế. Toàn văn hay. Chỉ vướng vài chữ.' Ông đặt xuống một đĩa [[muội đèn]], thứ dùng để chữa nét chữ. 'Chữa một nét, cứu một đời. Ông tính sao?'",
        "mission": "Ngươi đáp lại thế nào?",
        "choices": [
          {
            "id": "M3-A",
            "text": "Không. Việc này là tội.",
            "score": 50,
            "immediate_feedback": "Ông ấy không nói thêm. Đĩa muội đèn vẫn để đó.",
            "next_stage": "M4"
          },
          {
            "id": "M3-B",
            "text": "Để tôi xem lại những quyển ấy.",
            "score": 45,
            "immediate_feedback": "Ngươi cầm quyển đầu tiên lên.",
            "next_stage": "M4"
          },
          {
            "id": "M3-C",
            "text": "Hai mươi tư người... ông nói tiếp đi.",
            "score": 35,
            "immediate_feedback": "Phan Nhạ kể tên vài người. Ngươi nghe hết.",
            "next_stage": "M4"
          }
        ]
      },
      {
        "id": "M4",
        "type": "sinh_tu",
        "title": "SINH TỬ — Canh ba",
        "time_limit": 60,
        "period": "Canh ba đêm ấy",
        "location": "Bàn chấm thi trường Thừa Thiên",
        "narrative": "Canh ba. Trường thi lặng như không người. Trước mặt ngươi: hai mươi tư quyển thi, một đĩa [[muội đèn]], một ngọn nến gần tàn. Ngoài kia, những người viết chúng đang chờ tin. Ngươi đặt tay lên quyển đầu tiên.",
        "mission": "Ngươi có chữa những chữ phạm quy ấy không?",
        "choices": [
          {
            "id": "M4-A",
            "text": "Chữa. Cứu người tài trước đã.",
            "score": 50,
            "immediate_feedback": "Quyết định khớp với lịch sử. Ngươi cùng Phan Nhạ nhúng ngọn bút vào muội đèn...",
            "next_stage": "M5"
          },
          {
            "id": "M4-B",
            "text": "Không chữa. Giữ mình, giữ phép.",
            "score": 50,
            "immediate_feedback": "Ngươi rụt tay lại. Lịch sử bắt đầu rẽ sang một nhánh giả tưởng...",
            "next_stage": "END_ALT"
          }
        ]
      },
      {
        "id": "END_ALT",
        "type": "gia_tuong",
        "title": "Dòng lịch sử chưa từng xảy ra",
        "beats": [
          {
            "beat_index": 1,
            "title": "Đêm ấy trôi qua êm",
            "lines": [
              "Trường thi kết thúc êm.",
              "Hai mươi tư quyển văn hay bị phê trượt vì vài nét chữ. Không ai hay biết, không có án nào mang tên ngươi."
            ],
            "tone": "cold_neutral"
          },
          {
            "beat_index": 2,
            "title": "Đêm sau, và đêm sau nữa",
            "lines": [
              "Ngươi không ngủ được.",
              "Càng chắc mình đã đọc đúng thứ văn hay hiếm có, càng khó chợp mắt. Đêm nào cũng vậy."
            ],
            "tone": "darkening_restless"
          },
          {
            "beat_index": 3,
            "title": "Giấc mơ",
            "lines": [
              "Trong cơn mơ chập chờn, năm gương mặt hiện về — những người lẽ ra đã đỗ cử nhân.",
              "Không ai lớn tiếng, chỉ lặng lẽ hỏi: 'Ngài đọc được văn hay của tôi, sao còn để tôi trượt vì một nét chữ?'"
            ],
            "tone": "blurred_ghostly_dream"
          },
          {
            "beat_index": 4,
            "title": "Tỉnh giấc",
            "lines": [
              "Ngươi choàng tỉnh giữa canh khuya, mồ hôi lạnh.",
              "Ngọn nến trước mặt vẫn cháy, đĩa muội đèn vẫn còn nguyên đó. Đêm ấy vẫn chưa qua."
            ],
            "tone": "m4_candlelight_rekindle"
          }
        ]
      },
      {
        "id": "M5",
        "type": "thuong",
        "title": "Tờ cung",
        "time_limit": 50,
        "period": "Vụ việc bị phát giác",
        "location": "Ngục thất bộ Hình",
        "npc_addressing": {
          "TRONG_PHEP": "Ngục quan cười gằn: 'Kẻ luôn miệng xưng trọng phép tắc, hóa ra lại to gan đổi trắng thay đen nơi trường quy!'",
          "TRONG_TAI": "Ngục quan lắc đầu: 'Chỉ vì tiếc mấy câu văn của lũ hàn sĩ mà chuốc vạ diệt thân, có đáng không?'",
          "TRONG_DUNG": "Ngục quan gõ bàn: 'Cao Bá Quát! Nay tang chứng rành rành, người còn do dự gì nữa?'"
        },
        "narrative": "Việc bị phát giác. Ngươi bị bắt, bị tra khảo. Bản án đầu tiên đưa ra là [[trảm quyết]] — chém ngay. Trước mặt là [[tờ cung]] và một cây bút. Người ta chờ ngươi viết.",
        "mission": "Ngươi khai thế nào?",
        "choices": [
          {
            "id": "M5-A",
            "text": "Nhận hết. Việc do tôi làm.",
            "score": 50,
            "immediate_feedback": "Ngươi viết, không thêm một chữ biện bạch.",
            "next_stage": "SUMMARY"
          },
          {
            "id": "M5-B",
            "text": "Khai rõ vì tiếc người tài.",
            "score": 50,
            "immediate_feedback": "\"Tôi thấy các bài hay sính bút làm vậy chứ không ai gửi gắm, dặn dò gì cả.\"",
            "verbatim_quote": true,
            "next_stage": "SUMMARY"
          },
          {
            "id": "M5-C",
            "text": "Phủ nhận toàn bộ.",
            "score": 15,
            "immediate_feedback": "Lời khai không khớp với vật chứng còn đó.",
            "next_stage": "SUMMARY"
          }
        ]
      }
    ],
    "epilogue": {
      "historical_truth": "Trong lịch sử, vua Thiệu Trị sau khi thẩm định kỹ đã giảm án từ 'Trảm quyết' xuống 'Giảo giam hậu' (giam chờ thắt cổ), sau đó tha tội chết, đày đi hiệu lực ở quân thứ Trấn Tây (Campuchia), rồi được cử đi sứ Singapore (Hạ Châu). 24 sĩ tử được vớt bài sau đó đều bị hủy kết quả và thi lại.",
      "character_assessment": "Dù hành động phạm vào trường quy nghiêm ngặt của triều đình, động cơ của Cao Bá Quát xuất phát từ tấm lòng mến mộ hiền tài, không vụ lợi cá nhân hay ăn hối lộ. Tinh thần khảng khái 'thấy bài hay sính bút' đã tạc nên nhân cách Chu Thần một đời bất khuất."
    }
  };
  setupGlossaryTerms();
  renderStage('M0');
}

// ==========================================================================
// Sino-Vietnamese Glossary Setup & Interactive Popovers
// ==========================================================================
function setupGlossaryTerms() {
  const modal = document.getElementById('glossary-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
}

function openGlossary(termKey) {
  const cleanKey = termKey.toLowerCase().trim();
  const termData = gameState.gameData.glossary[cleanKey];
  if (!termData) return;

  document.getElementById('modal-term-word').innerText = termData.word;
  document.getElementById('modal-term-han').innerText = termData.han_tu || '字';
  document.getElementById('modal-term-def').innerText = termData.definition_genz;

  const noteEl = document.getElementById('modal-term-note');
  if (termData.advisor_note) {
    noteEl.innerText = termData.advisor_note;
    noteEl.classList.remove('hidden');
  } else {
    noteEl.classList.add('hidden');
  }

  document.getElementById('glossary-modal').classList.remove('hidden');
  sfx.playPaper();
}

function formatNarrativeTextWithGlossary(text) {
  // Replaces [[term]] with clickable spans
  return text.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
    return `<span class="glossary-term" onclick="openGlossary('${p1.toLowerCase()}')" title="Bấm xem nghĩa">${p1}</span>`;
  });
}

// ==========================================================================
// Timer Logic
// ==========================================================================
function startStageTimer(seconds) {
  clearInterval(gameState.timerInterval);
  const wrapper = document.getElementById('timer-wrapper');
  const display = document.getElementById('timer-display');
  const fill = document.getElementById('timer-fill');

  if (!seconds || seconds <= 0) {
    wrapper.classList.add('hidden');
    return;
  }

  wrapper.classList.remove('hidden');
  wrapper.classList.remove('urgent');
  gameState.timerSecondsRemaining = seconds;
  const initialSeconds = seconds;

  display.innerText = `${gameState.timerSecondsRemaining}s`;
  fill.style.width = '100%';

  gameState.timerInterval = setInterval(() => {
    gameState.timerSecondsRemaining--;
    display.innerText = `${gameState.timerSecondsRemaining}s`;
    const percent = Math.max(0, (gameState.timerSecondsRemaining / initialSeconds) * 100);
    fill.style.width = `${percent}%`;

    if (gameState.timerSecondsRemaining <= 10) {
      wrapper.classList.add('urgent');
      sfx.playTenseTick();
    }

    if (gameState.timerSecondsRemaining <= 0) {
      clearInterval(gameState.timerInterval);
      display.innerText = `0s — Hết giờ!`;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(gameState.timerInterval);
}

// ==========================================================================
// Stage Renderer
// ==========================================================================
function renderStage(stageId) {
  stopTimer();
  gameState.stageId = stageId;
  sfx.playGong();

  // Scroll to top of viewport
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Handle Summary End Screen
  if (stageId === 'SUMMARY') {
    renderSummary();
    return;
  }

  // Handle END_ALT Fantasy Branch
  if (stageId === 'END_ALT') {
    renderEndAlt();
    return;
  }

  // Reset Special Warning / Sticky Banners
  document.getElementById('m4-warning-banner').classList.add('hidden');
  document.getElementById('end-alt-sticky-label').classList.add('hidden');
  document.getElementById('alt-beats-container').classList.add('hidden');
  document.getElementById('summary-container').classList.add('hidden');
  document.getElementById('feedback-box').classList.add('hidden');
  document.getElementById('m3-hidden-item-container').classList.add('hidden');
  document.getElementById('mission-prompt').classList.remove('hidden');
  document.getElementById('choices-container').classList.remove('hidden');

  const stage = gameState.gameData.stages.find((s) => s.id === stageId);
  if (!stage) {
    console.error('Không tìm thấy màn:', stageId);
    return;
  }

  // Update HUD
  document.getElementById('stage-badge').innerText = `${stage.id} • ${stage.title}`;
  document.getElementById('stage-period').innerText = `Thời gian: ${stage.period || '1841'}`;
  document.getElementById('stage-location').innerText = `Địa điểm: ${stage.location || 'Trường thi Thừa Thiên'}`;
  document.getElementById('stage-title').innerText = `${stage.id} · ${stage.title}`;

  // Start Timer if required
  startStageTimer(stage.time_limit);

  // M4 Warning Banner Requirement (distinct warning color & text before choices)
  if (stage.id === 'M4') {
    const banner = document.getElementById('m4-warning-banner');
    banner.classList.remove('hidden');
  }

  // Flavor Box / Mascot Voice & Dynamic Opener
  const flavorBox = document.getElementById('flavor-box');
  const flavorText = document.getElementById('flavor-text');
  flavorBox.classList.add('hidden');

  let dynamicNarrative = stage.narrative;

  // M0 Intro Special Dialogue
  if (stage.id === 'M0' && stage.mascot_dialogue) {
    flavorBox.classList.remove('hidden');
    flavorText.innerText = stage.mascot_dialogue;
  }

  // M3 Flavor variations (da_gac_rieng & khuynh_huong)
  if (stage.id === 'M3') {
    // Opener variation based on da_gac_rieng
    const opener = gameState.flags.da_gac_rieng
      ? stage.flavor_openers?.da_gac_rieng_true || "Phan Nhạ bước tới nhìn góc bàn ngươi: 'Quyển bài khi chiều ông gác riêng đó, tôi cũng vừa xem qua...'"
      : stage.flavor_openers?.da_gac_rieng_false || "Phan Nhạ tới bên bàn ngươi, vẻ mặt trầm tư kéo ghế ngồi xuống.";
    dynamicNarrative = `${opener} ${stage.narrative}`;

    // Mascot reflection based on khuynh_huong
    if (gameState.flags.khuynh_huong && stage.mascot_voice) {
      flavorBox.classList.remove('hidden');
      flavorText.innerText = stage.mascot_voice[gameState.flags.khuynh_huong] || "";
    }

    // M3 Nice-to-have Hidden Item (Search Character)
    renderM3HiddenItem();
  }

  // M5 Flavor variation (NPC addressing based on khuynh_huong)
  if (stage.id === 'M5' && gameState.flags.khuynh_huong && stage.npc_addressing) {
    flavorBox.classList.remove('hidden');
    flavorText.innerText = stage.npc_addressing[gameState.flags.khuynh_huong] || "";
  }

  // Render Body with Glossary links
  document.getElementById('narrative-body').innerHTML = formatNarrativeTextWithGlossary(dynamicNarrative);

  // Mission prompt
  document.getElementById('mission-text').innerText = stage.mission || "Ngươi sẽ làm gì?";

  // Disclaimer tag if stage has unapproved historical details
  const disclaimerEl = document.getElementById('advisor-disclaimer');
  if (stage.historical_notes && stage.historical_notes.includes('⚠')) {
    disclaimerEl.classList.remove('hidden');
    disclaimerEl.innerText = stage.historical_notes;
  } else {
    disclaimerEl.classList.add('hidden');
  }

  // Render Choices
  const choicesContainer = document.getElementById('choices-container');
  choicesContainer.innerHTML = '';

  if (stage.id === 'M0') {
    // Single Advance Button for M0
    const startBtn = document.createElement('button');
    startBtn.className = 'choice-btn';
    startBtn.innerHTML = `
      <span class="choice-id">VÀO TRƯỜNG</span>
      <span class="choice-content">Bắt đầu đêm trước giờ đóng cửa trường thi.</span>
      <span class="choice-meta">Khởi hành</span>
    `;
    startBtn.onclick = () => renderStage('M1');
    choicesContainer.appendChild(startBtn);
    return;
  }

  // Regular Choices Grid
  stage.choices.forEach((c) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `
      <span class="choice-id">${c.id}</span>
      <span class="choice-content">${c.text}</span>
      <span class="choice-meta">+${c.score}đ</span>
    `;
    btn.onclick = () => handleChoice(stage, c);
    choicesContainer.appendChild(btn);
  });
}

// ==========================================================================
// Choice Handling & Flag Updates
// ==========================================================================
function handleChoice(stage, choice) {
  stopTimer();
  sfx.playPaper();

  // Score Awarding (Guaranteed exactly as designed in GDD)
  // Ensure score is only awarded once per stage transition
  if (!gameState.stageScoreAwarded[stage.id]) {
    gameState.score += choice.score;
    gameState.stageScoreAwarded[stage.id] = choice.score;
    document.getElementById('current-score').innerText = gameState.score;
  }

  // Set Flags
  if (choice.set_flags) {
    if (choice.set_flags.khuynh_huong) {
      gameState.flags.khuynh_huong = choice.set_flags.khuynh_huong;
      updateFlagDisplay();
    }
    if (choice.set_flags.da_gac_rieng) {
      gameState.flags.da_gac_rieng = true;
    }
  }

  // Show Feedback Box
  const feedbackBox = document.getElementById('feedback-box');
  const feedbackText = document.getElementById('feedback-text');
  feedbackBox.classList.remove('hidden');

  if (choice.verbatim_quote) {
    // M5-B Verbatim quote styling strictly adhering to requirements
    feedbackText.innerHTML = `
      <div class="verbatim-badge">Hồ Sơ Án Lịch Sử • Trích Nguyên Văn</div>
      <div class="court-record-exact-italic">
        ${choice.immediate_feedback}
      </div>
    `;
  } else {
    feedbackText.innerText = choice.immediate_feedback;
  }

  // Disable buttons temporarily to prevent double click
  const buttons = document.querySelectorAll('.choice-btn');
  buttons.forEach((b) => (b.disabled = true));

  // Advance after short beat
  setTimeout(() => {
    renderStage(choice.next_stage);
  }, 1400);
}

function updateFlagDisplay() {
  const flagDisplay = document.getElementById('flag-display');
  const flagLabel = document.getElementById('flag-khuynh-huong');
  flagDisplay.classList.remove('hidden');

  if (gameState.flags.khuynh_huong === 'TRONG_PHEP') {
    flagLabel.innerText = 'Khuynh hướng: Trọng Phép';
  } else if (gameState.flags.khuynh_huong === 'TRONG_TAI') {
    flagLabel.innerText = 'Khuynh hướng: Trọng Tài';
  } else if (gameState.flags.khuynh_huong === 'TRUNG_DUNG') {
    flagLabel.innerText = 'Khuynh hướng: Trung Dung';
  }
}

// ==========================================================================
// M3 Hidden Item: Ancient Scroll Character Hunt (Nice-To-Have)
// ==========================================================================
function renderM3HiddenItem() {
  const container = document.getElementById('m3-hidden-item-container');
  container.classList.remove('hidden');

  const huntChar = document.getElementById('hunt-target-char');
  const resultMsg = document.getElementById('hunt-result-msg');

  if (gameState.flags.huy_hieu_an) {
    huntChar.classList.add('found');
    resultMsg.className = 'hunt-result success';
    resultMsg.innerText = '✓ Ngươi đã phát hiện chữ phạm húy "Húy" (諱)! Nhận huy hiệu Kê Thê Tầm Văn.';
    resultMsg.classList.remove('hidden');
    return;
  }

  huntChar.onclick = () => {
    if (gameState.flags.huy_hieu_an) return;
    gameState.flags.huy_hieu_an = true;
    huntChar.classList.add('found');
    sfx.playSuccessBell();

    resultMsg.className = 'hunt-result success';
    resultMsg.innerText = '🌟 Tinh tường! Ngươi đã phát hiện chữ phạm quy "Húy" (諱) giấu trong bài thi! +1 Huy hiệu Kê Thê Tầm Văn.';
    resultMsg.classList.remove('hidden');

    document.getElementById('badge-display').classList.remove('hidden');
  };
}

// ==========================================================================
// END_ALT: Fantasy Branch 4-Beat Progression
// ==========================================================================
function renderEndAlt() {
  // Always visible sticky label (cannot scroll away)
  document.getElementById('end-alt-sticky-label').classList.remove('hidden');
  document.getElementById('m4-warning-banner').classList.add('hidden');
  document.getElementById('mission-prompt').classList.add('hidden');
  document.getElementById('choices-container').classList.add('hidden');
  document.getElementById('feedback-box').classList.add('hidden');
  document.getElementById('m3-hidden-item-container').classList.add('hidden');
  document.getElementById('alt-beats-container').classList.remove('hidden');

  document.getElementById('stage-badge').innerText = `END_ALT • Giả tưởng`;
  document.getElementById('stage-title').innerText = `Dòng Lịch Sử Chưa Từng Xảy Ra`;
  document.getElementById('stage-period').innerText = `Nhánh hư cấu không có trong sử liệu`;
  document.getElementById('stage-location').innerText = `Tâm cảnh Cao Bá Quát`;

  document.getElementById('narrative-body').innerText =
    'Ngươi đã chọn "Không chữa. Giữ mình, giữ phép". Đêm trường thi khép lại trong im lặng, nhưng một chuỗi dằn vặt khôn nguôi bắt đầu nảy sinh trong tâm tưởng Chu Thần...';

  gameState.currentAltBeat = 1;
  renderAltBeat(1);

  const nextBtn = document.getElementById('beat-next-btn');
  const returnBtn = document.getElementById('beat-return-btn');

  nextBtn.onclick = () => {
    sfx.playPaper();
    if (gameState.currentAltBeat < 4) {
      gameState.currentAltBeat++;
      renderAltBeat(gameState.currentAltBeat);
    }
  };

  returnBtn.onclick = () => {
    sfx.playPaper();
    // Return to M4 keeping existing score as mandatory requirement
    renderStage('M4');
  };
}

function renderAltBeat(beatNum) {
  const dots = document.querySelectorAll('.beat-dot');
  dots.forEach((d, idx) => {
    if (idx + 1 === beatNum) d.classList.add('active');
    else d.classList.remove('active');
  });

  const titleEl = document.getElementById('beat-title');
  const line1El = document.getElementById('beat-line-1');
  const line2El = document.getElementById('beat-line-2');
  const beatCard = document.getElementById('alt-beat-content');
  const nextBtn = document.getElementById('beat-next-btn');
  const returnBtn = document.getElementById('beat-return-btn');

  // Clear tone classes
  beatCard.className = 'beat-card';

  if (beatNum === 1) {
    titleEl.innerText = "1. Đêm ấy trôi qua êm";
    line1El.innerText = "Trường thi kết thúc êm.";
    line2El.innerText = "Hai mươi tư quyển văn hay bị phê trượt vì vài nét chữ. Không ai hay biết, không có án nào mang tên ngươi.";
    beatCard.classList.add('tone-cold-neutral');
    nextBtn.classList.remove('hidden');
    returnBtn.classList.add('hidden');
    nextBtn.innerText = "Tiếp tục trăn trở →";
  } else if (beatNum === 2) {
    titleEl.innerText = "2. Đêm sau, và đêm sau nữa";
    line1El.innerText = "Ngươi không ngủ được.";
    line2El.innerText = "Càng chắc mình đã đọc đúng thứ văn hay hiếm có, càng khó chợp mắt. Đêm nào cũng vậy.";
    beatCard.classList.add('tone-darkening-restless');
    nextBtn.classList.remove('hidden');
    returnBtn.classList.add('hidden');
    nextBtn.innerText = "Chìm vào cơn mê →";
  } else if (beatNum === 3) {
    // Tone 3: Ghostly Blurred Dream
    sfx.playDreamChime();
    titleEl.innerText = "3. Giấc mơ";
    line1El.innerText = "Trong cơn mơ chập chờn, năm gương mặt hiện về — những người lẽ ra đã đỗ cử nhân.";
    line2El.innerText = "Không ai lớn tiếng, chỉ lặng lẽ hỏi: 'Ngài đọc được văn hay của tôi, sao còn để tôi trượt vì một nét chữ?'";
    beatCard.classList.add('tone-blurred-ghostly-dream');
    nextBtn.classList.remove('hidden');
    returnBtn.classList.add('hidden');
    nextBtn.innerText = "Bừng tỉnh! →";
  } else if (beatNum === 4) {
    // Tone 4: Burst of Warm M4 Light (Candle & Soot dish return)
    sfx.playAwakenShock();
    titleEl.innerText = "4. Tỉnh giấc";
    line1El.innerText = "Ngươi choàng tỉnh giữa canh khuya, mồ hôi lạnh.";
    line2El.innerText = "Ngọn nến trước mặt vẫn cháy, đĩa muội đèn vẫn còn nguyên đó. Đêm ấy vẫn chưa qua.";
    beatCard.classList.add('tone-m4-rekindle');
    nextBtn.classList.add('hidden');
    returnBtn.classList.remove('hidden'); // Only button "Trở lại đêm ấy"
  }
}

// ==========================================================================
// Summary / Ending Screen Renderer
// ==========================================================================
function renderSummary() {
  document.getElementById('stage-badge').innerText = 'KẾT THÚC • Tổng kết';
  document.getElementById('stage-period').innerText = 'Năm 1841 — Vua Thiệu Trị';
  document.getElementById('stage-location').innerText = 'Hồ sơ Đại Nam Thực Lục';
  document.getElementById('stage-title').innerText = 'Đêm Chấm Thi — Tổng Kết Hành Trình';

  document.getElementById('mission-prompt').classList.add('hidden');
  document.getElementById('choices-container').classList.add('hidden');
  document.getElementById('feedback-box').classList.add('hidden');
  document.getElementById('m4-warning-banner').classList.add('hidden');
  document.getElementById('end-alt-sticky-label').classList.add('hidden');
  document.getElementById('narrative-body').innerText = '';

  const summary = document.getElementById('summary-container');
  summary.classList.remove('hidden');

  // Fill Metrics
  document.getElementById('final-score-val').innerText = gameState.score;
  document.getElementById('final-badge-count').innerText = gameState.flags.huy_hieu_an ? '1' : '0';

  let personalityText = 'Khảng Khái Trọng Tài';
  if (gameState.flags.khuynh_huong === 'TRONG_PHEP') {
    personalityText = 'Nghiêm Cẩn Trọng Phép';
  } else if (gameState.flags.khuynh_huong === 'TRUNG_DUNG') {
    personalityText = 'Thận Trọng Trung Dung';
  }
  document.getElementById('final-personality').innerText = personalityText;

  document.getElementById('summary-history-text').innerText =
    gameState.gameData.epilogue.historical_truth;
  document.getElementById('summary-assessment-text').innerText =
    gameState.gameData.epilogue.character_assessment;

  document.getElementById('restart-game-btn').onclick = () => {
    gameState.score = 0;
    gameState.stageScoreAwarded = {};
    gameState.flags = { khuynh_huong: null, da_gac_rieng: false, huy_hieu_an: false };
    document.getElementById('current-score').innerText = '0';
    document.getElementById('flag-display').classList.add('hidden');
    document.getElementById('badge-display').classList.add('hidden');
    renderStage('M0');
  };
}

// ==========================================================================
// Setup Audio Button & Global Events
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();

  const audioBtn = document.getElementById('audio-toggle-btn');
  audioBtn.addEventListener('click', () => {
    gameState.audioEnabled = !gameState.audioEnabled;
    audioBtn.innerText = gameState.audioEnabled ? '🔔' : '🔕';
    audioBtn.title = gameState.audioEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt';
    if (gameState.audioEnabled) sfx.playGong();
  });

  loadGameData();
});
