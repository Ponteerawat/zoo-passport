// src/components/MemoryCard.tsx
// การ์ดคว่ำ/หงายในเกม Memory Match (หน้า Mini Game)

export type MemoryCardData = {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
};

export default function MemoryCard({
  card,
  onFlip,
}: {
  card: MemoryCardData;
  onFlip: (card: MemoryCardData) => void;
}) {
  return (
    <button
      onClick={() => onFlip(card)}
      aria-label={card.flipped || card.matched ? card.icon : "การ์ดคว่ำ"}
      className={`flip-card h-24 w-24 rounded-2xl shadow-sm transition-transform hover:-translate-y-0.5 ${
        card.matched ? "opacity-60" : ""
      } ${card.flipped || card.matched ? "is-flipped" : ""}`}
    >
      <div className="flip-card-inner">
        <div className="flip-face bg-white text-3xl text-forest/30">🐾</div>
        <div className="flip-face flip-face-back bg-gold/20 text-4xl">
          {card.icon}
        </div>
      </div>
    </button>
  );
}
