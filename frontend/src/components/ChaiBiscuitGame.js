import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

const PAIRS = [
  { id: "masala", chai: "☕", biscuit: "🍪", label: "Masala chai & biscuit" },
  { id: "kulhad", chai: "🫖", biscuit: "🥠", label: "Kulhad chai & nankhatai" },
  { id: "ginger", chai: "🥛", biscuit: "🍘", label: "Ginger chai & rusk" },
  { id: "elaichi", chai: "☕", biscuit: "🍩", label: "Elaichi chai & sweet biscuit" },
  { id: "lemon", chai: "🍵", biscuit: "🥨", label: "Lemon tea & khari" },
  { id: "cutting", chai: "🧋", biscuit: "🍞", label: "Cutting chai & toast" },
];

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createCards(level) {
  const pairs = PAIRS.slice(0, level === "Easy" ? 3 : 6);
  return shuffled(pairs.flatMap((pair) => [
    { id: `${pair.id}-chai`, pairId: pair.id, face: pair.chai, label: `Chai: ${pair.label}` },
    { id: `${pair.id}-biscuit`, pairId: pair.id, face: pair.biscuit, label: `Biscuit: ${pair.label}` },
  ]));
}

export default function ChaiBiscuitGame() {
  const [level, setLevel] = useState("Easy");
  const [cards, setCards] = useState(() => createCards("Easy"));
  const [revealed, setRevealed] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(60);
  const [status, setStatus] = useState("ready");
  const statusRef = useRef(status);

  statusRef.current = status;
  const totalPairs = cards.length / 2;
  const complete = matched.length === totalPairs;
  const finalScore = Math.max(0, matched.length * 100 - moves * 5 + seconds * 2);

  useEffect(() => {
    if (status !== "playing") return undefined;
    const timer = window.setInterval(() => {
      setSeconds((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status === "playing" && seconds === 0) setStatus("over");
  }, [seconds, status]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && statusRef.current === "playing") setStatus("paused");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (status !== "playing" || revealed.length !== 2) return undefined;
    const first = cards.find((card) => card.id === revealed[0]);
    const second = cards.find((card) => card.id === revealed[1]);
    if (first?.pairId === second?.pairId) return undefined;
    const timeout = window.setTimeout(() => setRevealed([]), 800);
    return () => window.clearTimeout(timeout);
  }, [cards, revealed, status]);

  const start = (nextLevel = level) => {
    setLevel(nextLevel);
    setCards(createCards(nextLevel));
    setRevealed([]);
    setMatched([]);
    setMoves(0);
    setSeconds(nextLevel === "Easy" ? 60 : 90);
    setStatus("playing");
  };

  const flip = (card) => {
    if (status !== "playing" || revealed.length >= 2 || revealed.includes(card.id) || matched.includes(card.pairId)) return;
    const next = [...revealed, card.id];
    setRevealed(next);
    if (next.length === 2) {
      setMoves((current) => current + 1);
      const first = cards.find((item) => item.id === next[0]);
      if (first?.pairId === card.pairId) {
        const nextMatched = [...matched, card.pairId];
        setMatched(nextMatched);
        setRevealed([]);
        if (nextMatched.length === totalPairs) setStatus("over");
      }
    }
  };

  return (
    <div className="mini-game chai-game" data-testid="chai-game">
      <div className="game-toolbar">
        <label className="game-level-control">Difficulty
          <select aria-label="Chai game difficulty" value={level} onChange={(event) => start(event.target.value)}>
            <option>Easy</option><option>Hard</option>
          </select>
        </label>
        <div className="score-box"><small>Moves</small><strong>{moves}</strong></div>
        <div className="score-box"><small>Time</small><strong>{seconds}s</strong></div>
        <div className="score-box"><small>Pairs</small><strong>{matched.length}/{totalPairs}</strong></div>
      </div>
      <p className="game-instruction">चाय और बिस्कुट की सही जोड़ी मिलाएँ · Match the matching pair!</p>
      <div className={`chai-board chai-${level.toLowerCase()}`}>
        {cards.map((card, index) => {
          const open = revealed.includes(card.id) || matched.includes(card.pairId);
          return (
            <button
              type="button"
              className={`chai-card${open ? " is-open" : ""}${matched.includes(card.pairId) ? " is-matched" : ""}`}
              key={card.id}
              onClick={() => flip(card)}
              aria-label={open ? card.label : `Reveal card ${index + 1}`}
              aria-pressed={open}
              disabled={status !== "playing" || matched.includes(card.pairId)}
            >
              {open ? <><span>{card.face}</span><small>{card.label.split(":")[0]}</small></> : "?"}
            </button>
          );
        })}
        {(status === "ready" || status === "paused" || status === "over") && (
          <div className="game-overlay" role={status === "over" ? "status" : undefined}>
            {status === "ready" && <><strong>चाय तैयार है? ☕</strong><span>सभी चाय-बिस्कुट की जोड़ियाँ ढूँढ़ें।</span><button type="button" className="game-primary-button" onClick={() => start()}><Play size={17} /> Start Game</button></>}
            {status === "paused" && <><strong>गेम रुका हुआ है</strong><button type="button" className="game-primary-button" onClick={() => setStatus("playing")}><Play size={17} /> Resume</button></>}
            {status === "over" && <><strong>{complete ? "सभी जोड़ियाँ मिल गईं! शानदार! 🎉" : "समय पूरा हुआ!"}</strong><span>Final score: {finalScore} · Moves: {moves}</span><button type="button" className="game-primary-button" onClick={() => start()}><RotateCcw size={17} /> Play Again</button></>}
          </div>
        )}
      </div>
      <div className="game-actions">
        {status === "playing" && <button type="button" className="game-utility-button" onClick={() => setStatus("paused")}><Pause size={16} /> Pause</button>}
        {status !== "ready" && <button type="button" className="game-utility-button" onClick={() => start()}><RotateCcw size={16} /> Restart</button>}
      </div>
    </div>
  );
}
