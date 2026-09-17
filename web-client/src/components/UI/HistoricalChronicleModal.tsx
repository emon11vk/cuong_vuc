import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { X, BookOpen, Compass, Shield } from 'lucide-react';

interface EventItem {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  description: string;
  quote?: string;
  lat: number;
  lng: number;
  tag: 'Mở Màn' | 'Chiến Lũy' | 'Trọng Điểm' | 'Bảo Vật';
  isMission?: boolean;
}

const HISTORICAL_EVENTS: EventItem[] = [
  {
    id: 'phao-dai-lang',
    date: '20:03 • 19/12/1946',
    title: 'Pháo Đài Láng Nổ Súng Khai Hỏa',
    subtitle: 'Hiệu lệnh Toàn quốc Kháng chiến',
    description: 'Đèn thành phố Yên Phụ phụt tắt, những quả đạn pháo 75mm từ Pháo đài Láng gầm vang nhắm thẳng vào các căn cứ quân Pháp trong thành, mở đầu 60 ngày đêm quyết tử.',
    quote: '"Hỡi đồng bào toàn quốc! Chúng ta muốn hòa bình, chúng ta phải nhân nhượng. Nhưng chúng ta càng nhân nhượng, thực dân Pháp càng lấn tới..."',
    lat: 21.02105,
    lng: 105.80665,
    tag: 'Mở Màn'
  },
  {
    id: 'ftu-chua-lang',
    date: 'Tháng 12/1946',
    title: 'Địa Bàn 91 Chùa Láng — ĐH Ngoại Thương',
    subtitle: 'Vành đai liên lạc vành đai Tô Lịch',
    description: 'Khu vực Láng Thượng nằm sát bờ sông Tô Lịch là bàn đạp tiếp tế bí mật, kết nối giữa các đơn vị tự vệ nội thành và căn cứ du kích ngoại vi phía Tây.',
    quote: 'Nơi diễn ra nhiệm vụ bí mật tiếp nhận mật lệnh tác chiến bảo vệ cửa ngõ Thủ đô.',
    lat: 21.0227,
    lng: 105.8045,
    tag: 'Trọng Điểm',
    isMission: true
  },
  {
    id: 'lien-khu-1',
    date: '1946 - 1947',
    title: 'Chiến Lũy Liên Khu 1 — Lũy Hoa',
    subtitle: 'Đục tường thông nhà khắp 36 phố phường',
    description: 'Quyết tử quân và nhân dân đục tường nối liền các ngôi nhà từ phố này sang phố khác, dựng chiến lũy bằng bàn ghế, toa tàu điện để chặn đứng xe tăng thiết giáp địch.',
    quote: '"Quyết tử để Tổ quốc quyết sinh!" — Lời thề son sắt của Trung đoàn Thủ đô.',
    lat: 21.0365,
    lng: 105.8400,
    tag: 'Chiến Lũy'
  },
  {
    id: 'giang-vo',
    date: 'Mùa đông 1946',
    title: 'Mặt Trận Ô Chợ Dừa — Giảng Võ',
    subtitle: 'Chặn đứng gọng kìm cơ giới Pháp',
    description: 'Các chiến sĩ tự vệ sử dụng súng ba càng, bom xăng chai cháy chặn đứng mũi tiến công cơ giới của địch muốn đánh thốc vào cửa ngõ phía Tây Nam.',
    quote: 'Từng mét hào, từng góc phố trở thành pháo đài thép kiên cường.',
    lat: 21.0275,
    lng: 105.8175,
    tag: 'Chiến Lũy'
  },
  {
    id: 'hoan-kiem',
    date: 'Đêm 19/12/1946',
    title: 'Trận Địa Quanh Hồ Hoàn Kiếm',
    subtitle: 'Trái tim kháng chiến Thủ đô',
    description: 'Quân dân tự vệ bảo vệ Tòa Thị chính, Nhà Bưu điện Bờ Hồ, kiên quyết bám trụ đánh lui nhiều đợt tập kích của quân đội viễn chinh Pháp.',
    quote: 'Mỗi tấc đất Ba Đình, Hoàn Kiếm thấm đượm ý chí độc lập tự do.',
    lat: 21.0287,
    lng: 105.8523,
    tag: 'Bảo Vật'
  }
];

interface HistoricalChronicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoricalChronicleModal: React.FC<HistoricalChronicleModalProps> = ({ isOpen, onClose }) => {
  const setUserLocation = useGameStore((state) => state.setUserLocation);
  const setGameModalOpen = useGameStore((state) => state.setGameModalOpen);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredEvents = activeFilter === 'all' 
    ? HISTORICAL_EVENTS 
    : HISTORICAL_EVENTS.filter((e) => e.tag === activeFilter);

  const handleFlyTo = (event: EventItem) => {
    setUserLocation(event.lat, event.lng);
    onClose();
    if (event.isMission) {
      setTimeout(() => setGameModalOpen(true), 400);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-auto"
      style={{
        background: 'rgba(8, 5, 4, 0.88)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          background: 'linear-gradient(180deg, #18100a 0%, #120b07 100%)',
          borderColor: 'rgba(229, 186, 99, 0.45)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(229, 186, 99, 0.15)',
        }}
      >
        {/* Header Strip */}
        <div 
          className="flex items-center justify-between px-5 py-4 border-b select-none"
          style={{
            background: 'linear-gradient(90deg, #24160d 0%, #2f1c10 50%, #24160d 100%)',
            borderColor: 'rgba(229, 186, 99, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center crimson-badge text-amber-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-cinzel tracking-wider text-amber-400">
                  SỔ TAY SỬ LƯỢC • 60 NGÀY ĐÊM HÀ NỘI 1946
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                  19/12/1946 - 17/02/1947
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5 font-body">
                Biên niên sử các cứ điểm quân sự & địa bàn kháng chiến lịch sử
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-white/5 transition-all cursor-pointer btn-tactile"
            title="Đóng (ESC)"
            aria-label="Đóng sổ tay"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-500/20 bg-black/25 overflow-x-auto">
          {[
            { id: 'all', label: 'Tất Cả Mốc Lịch Sử' },
            { id: 'Mở Màn', label: '💥 Khai Hỏa' },
            { id: 'Trọng Điểm', label: '🏛️ Địa Bàn FTU' },
            { id: 'Chiến Lũy', label: '🛡️ Chiến Lũy' },
            { id: 'Bảo Vật', label: '📜 Trận Địa Bờ Hồ' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer btn-tactile ${
                activeFilter === f.id
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/70 shadow-[0_0_10px_rgba(229,186,99,0.3)]'
                  : 'bg-stone-900/60 text-stone-400 border border-white/10 hover:text-stone-200 hover:border-amber-500/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Scrollable Event List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 hanoi-scrollbar">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                evt.isMission
                  ? 'bg-gradient-to-r from-red-950/40 via-stone-900/80 to-stone-950/80 border-amber-500/60 shadow-[0_4px_20px_rgba(161,35,35,0.25)]'
                  : 'bg-stone-900/40 border-amber-500/25 hover:border-amber-500/50 hover:bg-stone-900/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {evt.date}
                  </span>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-stone-300 border border-white/10">
                    {evt.tag}
                  </span>
                  {evt.isMission && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-500/50 animate-pulse">
                      Nhiệm Vụ RPG Sẵn Sàng
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleFlyTo(evt)}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer btn-tactile shadow"
                  style={{
                    background: evt.isMission 
                      ? 'linear-gradient(135deg, #a12323 0%, #781515 100%)' 
                      : 'rgba(229, 186, 99, 0.2)',
                    color: evt.isMission ? '#ffffff' : '#f5d47a',
                    border: evt.isMission ? '1px solid rgba(245, 212, 122, 0.6)' : '1px solid rgba(229, 186, 99, 0.4)'
                  }}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{evt.isMission ? 'Vào Nhiệm Vụ FTU' : 'Bay Đến Vị Trí'}</span>
                </button>
              </div>

              <h3 className="text-base font-bold font-cinzel text-amber-300 mt-2">
                {evt.title}
              </h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">
                {evt.subtitle}
              </p>

              <p className="text-xs text-stone-300 font-body leading-relaxed mt-2">
                {evt.description}
              </p>

              {evt.quote && (
                <blockquote className="mt-3 pl-3 border-l-2 border-amber-500/50 text-xs italic text-amber-200/90 bg-amber-500/5 py-1 rounded-r">
                  {evt.quote}
                </blockquote>
              )}
            </div>
          ))}
        </div>

        {/* Footer Summary */}
        <div className="px-5 py-3 border-t border-amber-500/20 bg-black/40 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span>Tài liệu lưu trữ: Bảo tàng Lịch sử Quân sự Việt Nam & Khu di tích Pháo Đài Láng</span>
          </div>
          <span className="font-mono text-[11px] text-amber-400/80">91 Chùa Láng • Vành Đai Tô Lịch</span>
        </div>
      </div>
    </div>
  );
};
