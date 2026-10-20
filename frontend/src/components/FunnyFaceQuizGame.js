import { useState } from "react";
import { RotateCcw } from "lucide-react";

const questions = [
  { face: "😂", prompt: "This face is laughing so hard it is…? / यह चेहरा किस बात पर हँस रहा है?", answers: ["Crying with laughter / हँसी के आँसू", "Feeling sleepy / नींद", "Feeling cold / ठंड", "Eating lunch / खाना"], correct: 0 },
  { face: "😴", prompt: "What does this face need? / इस चेहरे को क्या चाहिए?", answers: ["A dance party / डांस", "A nap / झपकी", "A bicycle / साइकिल", "A mango / आम"], correct: 1 },
  { face: "🤔", prompt: "What is this face doing? / यह चेहरा क्या कर रहा है?", answers: ["Thinking hard / सोच रहा है", "Singing loudly / गा रहा है", "Running fast / दौड़ रहा है", "Eating cake / केक"], correct: 0 },
  { face: "😋", prompt: "How is the food? / खाना कैसा लग रहा है?", answers: ["Too spicy / बहुत तीखा", "Yummy / स्वादिष्ट", "Too cold / बहुत ठंडा", "Invisible / गायब"], correct: 1 },
  { face: "😱", prompt: "This face just saw…? / इसने अभी क्या देखा?", answers: ["A surprise / कुछ चौंकाने वाला", "A pillow / तकिया", "A tiny ant / चींटी", "Its shoes / जूते"], correct: 0 },
  { face: "😎", prompt: "How does this face feel? / इसे कैसा महसूस हो रहा है?", answers: ["Super cool / बहुत कूल", "Very shy / शर्मीला", "Very hungry / भूखा", "Very wet / भीगा"], correct: 0 },
  { face: "🤯", prompt: "What happened to this brain? / इसके दिमाग का क्या हुआ?", answers: ["Mind blown / दिमाग चकरा गया", "It is sleeping / सो रहा है", "It is dancing / नाच रहा है", "It is cooking / पका रहा है"], correct: 0 },
  { face: "🥺", prompt: "What is this face asking for? / यह चेहरा क्या माँग रहा है?", answers: ["A little favor / छोटी सी मदद", "A big truck / ट्रक", "A haircut / हेयरकट", "A raincoat / बरसाती"], correct: 0 },
  { face: "🤪", prompt: "This face is being… / यह चेहरा कैसा है?", answers: ["A little silly / थोड़ा शरारती", "Very serious / गंभीर", "Very sleepy / नींद में", "Very neat / साफ़-सुथरा"], correct: 0 },
  { face: "🥶", prompt: "What is the weather like? / मौसम कैसा है?", answers: ["Freezing cold / बहुत ठंडा", "Very sunny / धूप", "Very windy / हवा", "Very warm / गर्म"], correct: 0 },
  { face: "🤭", prompt: "Why is this face covering its mouth? / इसने मुँह क्यों ढका?", answers: ["Trying not to giggle / हँसी रोक रहा है", "Brushing teeth / दाँत साफ़", "Drinking water / पानी", "Whistling / सीटी"], correct: 0 },
  { face: "😬", prompt: "This face feels a little… / इसे थोड़ा कैसा लग रहा है?", answers: ["Awkward / अजीब", "Sleepy / नींद", "Hungry / भूख", "Musical / संगीत"], correct: 0 },
  { face: "🥳", prompt: "What is this face celebrating? / यह चेहरा क्या मना रहा है?", answers: ["A party / पार्टी", "A rainy day / बारिश", "A long queue / लंबी लाइन", "A broken pencil / टूटी पेंसिल"], correct: 0 },
  { face: "😇", prompt: "This face is acting… / यह चेहरा कैसा बन रहा है?", answers: ["Like an angel / भोला-भाला", "Like a tiger / बाघ", "Like a robot / रोबोट", "Like a chef / रसोइया"], correct: 0 },
  { face: "🙃", prompt: "Why is this face upside down? / यह उल्टा क्यों है?", answers: ["Just being goofy / बस मज़ाकिया", "Doing homework / पढ़ाई", "Taking a bath / नहाना", "Catching a bus / बस पकड़ना"], correct: 0 },
];

export default function FunnyFaceQuizGame() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [finished, setFinished] = useState(false);
  const question = questions[questionIndex];

  const chooseAnswer = (index) => {
    if (answer !== null) return;
    setAnswer(index);
    if (index === question.correct) setScore((current) => current + 1);
  };

  const nextQuestion = () => {
    if (questionIndex === questions.length - 1) {
      setFinished(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setAnswer(null);
  };

  const restart = () => {
    setQuestionIndex(0);
    setScore(0);
    setAnswer(null);
    setFinished(false);
  };

  return (
    <div className="mini-game quiz-game" data-testid="quiz-game">
      {finished ? (
        <div className="quiz-finish" role="status">
          <span className="quiz-final-emoji">{score >= 12 ? "🏆" : score >= 8 ? "😄" : "😂"}</span>
          <h4>Quiz complete! शानदार!</h4>
          <p>Your score: {score} / {questions.length}</p>
          <p>{score >= 12 ? "आप तो इमोजी एक्सपर्ट हैं!" : "हँसते रहें और फिर से कोशिश करें!"}</p>
          <button type="button" className="game-primary-button" onClick={restart}><RotateCcw size={17} /> Play Again</button>
        </div>
      ) : (
        <>
          <div className="quiz-status"><span>Question {questionIndex + 1} / {questions.length}</span><strong>Score: {score}</strong></div>
          <div className="quiz-question">
            <span className="quiz-face" aria-hidden="true">{question.face}</span>
            <h4>{question.prompt}</h4>
          </div>
          <div className="quiz-answers">
            {question.answers.map((option, index) => (
              <button
                type="button"
                key={option}
                className={[
                  "quiz-answer",
                  answer !== null && index === question.correct ? "correct" : "",
                  answer === index && index !== question.correct ? "incorrect" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => chooseAnswer(index)}
                disabled={answer !== null}
              >
                <span>{String.fromCharCode(65 + index)}</span>{option}
              </button>
            ))}
          </div>
          {answer !== null && (
            <div className="quiz-feedback" role="status">
              <strong>{answer === question.correct ? "Correct! सही जवाब! 🎉" : "Oops! Try the next one 😄"}</strong>
              <button type="button" className="game-primary-button" onClick={nextQuestion}>
                {questionIndex === questions.length - 1 ? "See Result" : "Next Question"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
