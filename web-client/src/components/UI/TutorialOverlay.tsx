import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Map, Clock, Glasses, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';

// ─── Step content definition ─────────────────────────────────────────────────

interface StepContent {
  icon: React.ReactNode;
  title: string;
  description: string;
  hint: string;
}

const TOTAL_STEPS = 6;

function getStepContent(step: number): StepContent {
  switch (step) {
    case 1:
      return {
        icon: <Map className="w-7 h-7 text-amber-400" />,
        title: 'Warning',
        description:
          'Đây chỉ là bản prototype, chỉ mang tính giả định về gameplay chứ không chính xác về vị trí ' +
          'diễn ra sự kiện cũng như vị trí của người dùng. Vui lòng không sử dụng bản đồ này để tham gia giao thông hay di chuyển ngoài đời thực.',
        hint: '💡 Nhấn giữ và kéo để khám phá từng con phố cổ.',
      };
    case 2:
      return {
        icon: <Map className="w-7 h-7 text-amber-400" />,
        title: 'Bản Đồ Tác Chiến',
        description:
          'Đây là bản đồ tương tác tái hiện Hà Nội 1946 – 2026. Kéo để di chuyển, cuộn để zoom. ' +
          'Nhấn vào bất kỳ điểm di tích nào để xem thông tin lịch sử chi tiết.',
        hint: '💡 Nhấn giữ và kéo để khám phá từng con phố cổ.',
      };
    case 3:
      return {
        icon: <Clock className="w-7 h-7 text-amber-400" />,
        title: 'Thanh Thời Gian',
        description:
          'Thanh trượt ở phía dưới cho phép bạn chuyển đổi giữa lớp bản đồ năm 1946 và hiện tại. ' +
          'Kéo sang trái để nhìn lại Hà Nội thời kháng chiến, sang phải để xem thành phố ngày nay.',
        hint: '💡 Thử kéo về 0 để thấy ụ pháo và chiến lũy hiển thị trên bản đồ.',
      };
    
    case 4:
      return {
        icon: <Sparkles className="w-7 h-7 text-amber-400" />,
        title: 'Nhiệm Vụ & Sử Lược',
        description:
          'Nhấn "Nhiệm Vụ FTU" để mở nhiệm vụ tác chiến tại Đại Học Ngoại Thương. Nhiệm vụ của người chơi là ' +
          'khám phá các công trình lịch sử, thu thập thông tin, hoàn thành các thử thách và lựa chọn các hành động để hoàn thành cốt truyện. Mỗi lựa chọn sẽ ảnh hưởng đến kết quả và trải nghiệm của bạn.',
        hint: '💡 Chúc bạn khám phá và ghi nhớ lịch sử hào hùng của Thủ đô!',
      };
    case 5:
      return {
        icon: <Sparkles className="w-7 h-7 text-amber-400" />,
        title: 'Cách chơi & Di chuyển',
        description:
          'Di chuyển bằng nút W/A/S/D hoặc click chuột trái vào một điểm trên bản đồ, ' +
          'click E để tương tác với các điểm di tích, nhiệm vụ của mỗi màn chơi đều được hiện ở góc trên màn hình',
        hint: '💡 Chúc bạn khám phá và ghi nhớ lịch sử hào hùng của Thủ đô!',
      };
    case 6:
      return {
        icon: <Sparkles className="w-7 h-7 text-amber-400" />,
        title: 'Sẵn Sàng Khám Phá!',
        description:
          'Nhấn nút "Chơi Game FTU" trên thanh điều hướng hoặc bấm nút bên dưới để trực tiếp bước vào trường thi Thừa Thiên 1841, nhập vai danh sĩ Cao Bá Quát trong vụ án chữa bài thi chấn động lịch sử.',
        hint: '💡 Bạn có thể mở lại hướng dẫn bất kỳ lúc nào bằng nút (?) ở góc màn hình.',
      };
    default:
      return {
        icon: <Sparkles className="w-7 h-7 text-amber-400" />,
        title: '',
        description: '',
        hint: '',
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TutorialOverlay: React.FC = () => {
  const isTutorialActive = useGameStore((state) => state.isTutorialActive);
  const tutorialStep     = useGameStore((state) => state.tutorialStep);
  const nextStep         = useGameStore((state) => state.nextStep);
  const prevStep         = useGameStore((state) => state.prevStep);
  const endTutorial      = useGameStore((state) => state.endTutorial);
  const setGameModalOpen = useGameStore((state) => state.setGameModalOpen);

  if (!isTutorialActive) return null;

  const step    = tutorialStep === 0 ? 1 : tutorialStep; // treat step 0 as step 1
  const content = getStepContent(step);
  const isFirst = step <= 1;
  const isLast  = step >= TOTAL_STEPS;

  const handleNext = () => {
    if (isLast) {
      endTutorial();
      setGameModalOpen(true);
    } else {
      nextStep();
    }
  };

  return (
    /* Full-screen backdrop — pointer-events-none so the map is still pannable
       behind the card; only the card itself captures events. */
    <div className="absolute inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center pb-24 sm:pb-0 px-4">

      {/* Tutorial card */}
      <div
        className="pointer-events-auto w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl select-none"
        style={{
          background: 'linear-gradient(160deg, rgba(14,9,6,0.97) 0%, rgba(20,13,8,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(229,186,99,0.45)',
          boxShadow:
            '0 8px 40px rgba(0,0,0,0.85), 0 0 0 1px rgba(229,186,99,0.08), inset 0 1px 0 rgba(245,212,122,0.12)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Hướng dẫn bước ${step} / ${TOTAL_STEPS}`}
      >

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'rgba(229,186,99,0.25)' }}
        >
          <div className="flex items-center gap-2">
            {/* Step pills */}
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <span
                  key={i}
                  className="block w-5 h-1 rounded-full transition-all duration-300"
                  style={{
                    background:
                      i + 1 === step
                        ? 'rgba(229,186,99,1)'
                        : i + 1 < step
                        ? 'rgba(229,186,99,0.45)'
                        : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-stone-500 ml-1">
              {step} / {TOTAL_STEPS}
            </span>
          </div>

          {/* Skip / close */}
          <button
            onClick={endTutorial}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-stone-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-all cursor-pointer btn-tactile"
            aria-label="Bỏ qua hướng dẫn"
            title="Bỏ qua hướng dẫn"
          >
            <X className="w-3 h-3" />
            Bỏ qua
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-5">
          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2.5 rounded-xl shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(162,84,18,0.35) 0%, rgba(100,50,10,0.25) 100%)',
                border: '1px solid rgba(229,186,99,0.3)',
              }}
            >
              {content.icon}
            </div>
            <h2 className="text-base font-bold font-cinzel text-amber-300 leading-tight">
              {content.title}
            </h2>
          </div>

          {/* Description */}
          <p className="text-sm text-stone-300 leading-relaxed font-body mb-3">
            {content.description}
          </p>

          {/* Hint badge */}
          <div
            className="text-[11px] text-amber-400/80 font-medium px-3 py-2 rounded-lg"
            style={{ background: 'rgba(229,186,99,0.08)', border: '1px solid rgba(229,186,99,0.18)' }}
          >
            {content.hint}
          </div>
        </div>

        {/* ── Footer / Navigation ── */}
        <div
          className="flex items-center justify-between px-4 pb-4 pt-1 gap-2"
        >
          {/* Previous */}
          <button
            onClick={prevStep}
            disabled={isFirst}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer btn-tactile border border-white/10 bg-stone-900/60 text-stone-400 hover:text-amber-300 hover:border-amber-500/40 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Bước trước"
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </button>

          {/* Step label */}
          <span className="text-[10px] text-stone-600 font-mono">
            Bước {step}
          </span>

          {/* Next / Finish */}
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer btn-tactile shadow-lg"
            style={{
              background: isLast
                ? 'linear-gradient(135deg, #a12323 0%, #781515 100%)'
                : 'linear-gradient(135deg, #c59b27 0%, #a17812 100%)',
              color: isLast ? '#fff' : '#120b07',
              border: isLast
                ? '1.5px solid rgba(245,212,122,0.6)'
                : '1px solid rgba(245,212,122,0.55)',
              boxShadow: isLast
                ? '0 0 14px rgba(203,45,45,0.35)'
                : '0 0 10px rgba(197,155,39,0.25)',
            }}
            aria-label={isLast ? 'Hoàn thành hướng dẫn' : 'Bước tiếp theo'}
          >
            {isLast ? '⚔️ Vào Chơi Game Ngay' : 'Tiếp Theo'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

