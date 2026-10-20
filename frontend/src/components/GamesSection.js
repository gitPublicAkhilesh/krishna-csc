import { useState } from "react";
import { ArrowLeft, Clock3, X } from "lucide-react";
import CatchSamosaGame from "./CatchSamosaGame";
import PakdoPaisaGame from "./PakdoPaisaGame";
import MurgiChorGame from "./MurgiChorGame";
import BhaiBalanceGame from "./BhaiBalanceGame";
import ChaiWalaRushGame from "./ChaiWalaRushGame";
import ChaiBiscuitGame from "./ChaiBiscuitGame";
import DontTapRedGame from "./DontTapRedGame";
import FunnyFaceQuizGame from "./FunnyFaceQuizGame";
import BhaagoBhaiGame from "./BhaagoBhaiGame";
import WhackAMoleGame from "./WhackAMoleGame";
import TapChappalGame from "./TapChappalGame";
import "./games.css";

const games = [
  {
    id: "samosa",
    icon: "🥟",
    title: "Catch the Samosa",
    hindi: "गिरते समोसे पकड़ें",
    description: "Move your basket and catch as many as you can.",
    time: "30 sec",
  },
  {
    id: "chai",
    icon: "☕",
    title: "Chai vs Biscuit",
    hindi: "चाय-बिस्कुट की जोड़ी मिलाएँ",
    description: "Find every matching chai and biscuit pair.",
    time: "1–2 min",
  },
  {
    id: "quiz",
    icon: "😂",
    title: "Funny Face Quiz",
    hindi: "इमोजी देखकर जवाब दें",
    description: "Guess the expression in 15 silly questions.",
    time: "2–3 min",
  },
  {
    id: "chappal",
    icon: "🩴",
    title: "Tap the Chappal",
    hindi: "चप्पल पर जल्दी टैप करें",
    description: "Test your reflexes before the targets disappear.",
    time: "30 sec",
  },
  {
    id: "mole",
    icon: "😆",
    title: "Whack-a-Mole",
    hindi: "मज़ेदार चेहरे पर टैप करें",
    description: "Tap the funny faces before they pop away.",
    time: "30 sec",
  },
  {
    id: "red",
    icon: "🔴",
    title: "Don't Tap Red!",
    hindi: "लाल को मत छूना!",
    description: "Tap green targets and dodge the red ones.",
    time: "30 sec",
  },
  {
    id: "runner",
    icon: "🏃",
    title: "Bhaago Bhai Bhaago!",
    hindi: "कूदें और बाधाओं से बचें",
    description: "Jump over obstacles and see how far you can run.",
    time: "1–3 min",
  },
  {
    id: "paisa",
    icon: "💸",
    title: "Pakdo Pakdo Paisa!",
    hindi: "गिरते पैसे पकड़ें",
    description: "Catch rupees and coins, but watch out for fakes!",
    time: "30 sec",
  },
  {
    id: "murgi",
    icon: "🐔",
    title: "Murgi Chor Pakdo!",
    hindi: "मुर्गी पकड़ें, चोर से बचें",
    description: "Tap chickens for points, but don't let the thief fool you!",
    time: "30 sec",
  },
  {
    id: "balance",
    icon: "🥴",
    title: "Bhai Ka Balance!",
    hindi: "सामान गिरने से बचाएँ",
    description: "Keep bhai steady while balancing a wobbly stack.",
    time: "1–3 min",
  },
  {
    id: "chai-rush",
    icon: "🍵",
    title: "Chai Wala Rush!",
    hindi: "चाय पहुँचाएँ, रास्ते से बचें",
    description: "Collect tea cups and dodge road trouble.",
    time: "45 sec",
  },
];

function GameContent({ id }) {
  if (id === "samosa") return <CatchSamosaGame />;
  if (id === "chai") return <ChaiBiscuitGame />;
  if (id === "quiz") return <FunnyFaceQuizGame />;
  if (id === "chappal") return <TapChappalGame />;
  if (id === "mole") return <WhackAMoleGame />;
  if (id === "red") return <DontTapRedGame />;
  if (id === "runner") return <BhaagoBhaiGame />;
  if (id === "paisa") return <PakdoPaisaGame />;
  if (id === "murgi") return <MurgiChorGame />;
  if (id === "balance") return <BhaiBalanceGame />;
  return <ChaiWalaRushGame />;
}

export default function GamesSection() {
  const [selectedGame, setSelectedGame] = useState(null);
  const activeGame = games.find((game) => game.id === selectedGame);

  return (
    <section className="games-section section-pad" id="games" data-testid="games-section">
      <div className="container">
        <div className="section-heading games-heading">
          <div>
            <div className="eyebrow dark">
              <span />
              Play While You Wait
            </div>
            <h2>थोड़ा खेलें, <em>थोड़ा मुस्कुराएँ!</em></h2>
          </div>
          <p>अपनी बारी का इंतज़ार करते हुए मजेदार गेम खेलें।</p>
        </div>

        {activeGame ? (
          <div className="game-panel" data-testid="active-game-panel">
            <div className="game-panel-heading">
              <div>
                <button
                  type="button"
                  className="game-back-button"
                  onClick={() => setSelectedGame(null)}
                >
                  <ArrowLeft size={17} /> Back to games
                </button>
                <h3>{activeGame.title} <span>· {activeGame.hindi}</span></h3>
              </div>
              <button
                type="button"
                className="game-close-button"
                onClick={() => setSelectedGame(null)}
                aria-label="Close game and return to game selection"
              >
                <X size={20} />
              </button>
            </div>
            <GameContent key={activeGame.id} id={activeGame.id} />
          </div>
        ) : (
          <div className="games-grid">
            {games.map((game) => (
              <article className="game-card" key={game.id}>
                <div className="game-card-top">
                  <span className="game-card-icon" aria-hidden="true">{game.icon}</span>
                  <span className="game-time"><Clock3 size={14} /> {game.time}</span>
                </div>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <p className="game-card-hindi">{game.hindi}</p>
                <button
                  type="button"
                  className="game-play-button"
                  onClick={() => setSelectedGame(game.id)}
                  aria-label={`Play ${game.title}, ${game.hindi}`}
                >
                  Play Now / खेलें <ArrowLeft size={16} />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
