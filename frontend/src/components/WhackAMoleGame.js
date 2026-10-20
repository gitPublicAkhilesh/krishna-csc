import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

const ROUND_SECONDS = 30;
const BEST_KEY = "shri-krishna-whack-a-mole-best";
const FACES = ["😆", "🤪", "😜", "😂", "😎", "🤭"];

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    console.warn("Could not read the Whack-a-Mole best score.", error);
    return 0;
  }
}

function nextMole(previous = -1) {
  if (previous < 0) return Math.floor(Math.random() * 9);
  const next = Math.floor(Math.random() * 8);
  return next >= previous ? next + 1 : next;
}

export default function WhackAMoleGame() {
  const [phase, setPhase] = useState("ready");
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [mole, setMole] = useState(null);
  const [face, setFace] = useState(FACES[0]);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const saveScore = (value) => {
    setBest((current) => {
      if (value <= current) return current;
      try {
        localStorage.setItem(BEST_KEY, String(value));
      } catch (error) {
        console.warn("Could not save the Whack-a-Mole best score.", error);
      }
      return value;
    });
  };

  const start = () => {
    setSeconds(ROUND_SECONDS);
    setScore(0);
    setMole(nextMole());
    setFace(FACES[Math.floor(Math.random() * FACES.length)]);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const timer = window.setInterval(() => {
      setSeconds((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && seconds === 0) {
      saveScore(score);
      setPhase("over");
    }
  }, [phase, score, seconds]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === "playing") setPhase("paused");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (phase !== "playing" || mole === null) return undefined;
    const timeout = window.setTimeout(() => {
      setMole((current) => {
        const next = nextMole(current);
        setFace(FACES[Math.floor(Math.random() * FACES.length)]);
        return next;
      });
    }, Math.max(320, 900 - score * 22));
    return () => window.clearTimeout(timeout);
  }, [mole, phase, score]);

  const hitMole = (index) => {
    if (phase !== "playing" || index !== mole) return;
    const nextScore = score + 1;
    setScore(nextScore);
    saveScore(nextScore);
    setMole(nextMole(mole));
    setFace(FACES[Math.floor(Math.random() * FACES.length)]);
  };

  return (
    <div className="mini-game mole-game" data-testid="mole-game">
      <div className="game-toolbar">
        <div className="score-box"><small>Score</small><strong>{score}</strong></div>
        <div className="score-box"><small>Best</small><strong>{best}</strong></div>
        <div className="score-box"><small>Time</small><strong>{seconds}s</strong></div>
      </div>
      <p className="game-instruction">Tap the funny face! मज़ेदार चेहरे पर जल्दी टैप करें!</p>
      <div className="mole-grid">
        {Array.from({ length: 9 }, (_, index) => (
          <button
            type="button"
            key={index}
            className={`mole-hole${mole === index && phase === "playing" ? " mole-visible" : ""}`}
            onClick={() => hitMole(index)}
            aria-label={mole === index && phase === "playing" ? "Whack the funny mole" : `Empty mole hole ${index + 1}`}
            disabled={phase !== "playing"}
          >
            {mole === index && phase === "playing" ? face : ""}
          </button>
        ))}
        {(phase === "ready" || phase === "paused" || phase === "over") && (
          <div className="game-overlay" role={phase === "over" ? "status" : undefined}>
            {phase === "ready" && <><strong>मज़ेदार चेहरे को पकड़ो! 😆</strong><span>30 सेकंड में ज़्यादा से ज़्यादा चेहरे पर टैप करें।</span><button type="button" className="game-primary-button" onClick={start}><Play size={17} /> Start Game</button></>}
            {phase === "paused" && <><strong>गेम रुका हुआ है</strong><button type="button" className="game-primary-button" onClick={() => setPhase("playing")}><Play size={17} /> Resume</button></>}
            {phase === "over" && <><strong>{score >= 20 ? "वाह! आपकी नज़र बहुत तेज़ है! 🏆" : "चेहरे फिर से बिल में छिप गए! 😄"}</strong><span>Final score: {score} · Best: {best}</span><button type="button" className="game-primary-button" onClick={start}><RotateCcw size={17} /> Play Again</button></>}
          </div>
        )}
      </div>
      <div className="game-actions">
        {phase !== "ready" && <button type="button" className="game-utility-button" onClick={start}><RotateCcw size={16} /> Restart</button>}
      </div>
    </div>
  );
}
