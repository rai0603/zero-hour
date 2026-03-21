import { AnimatePresence } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import StartScreen from './screens/StartScreen'
import ProfileSurvey from './screens/ProfileSurvey'
import ProfileCard from './screens/ProfileCard'
import ScenarioSelect from './screens/ScenarioSelect'
import ScenarioIntro from './screens/ScenarioIntro'
import QuestionScreen from './screens/QuestionScreen'
import FeedbackOverlay from './screens/FeedbackOverlay'
import GameOverScreen from './screens/GameOverScreen'
import ResultScreen from './screens/ResultScreen'
import WishPool from './screens/WishPool'
import AccountScreen from './screens/AccountScreen'

export default function App() {
  const screen = useGameStore(s => s.screen)

  return (
    <div className="min-h-screen bg-gray-950">
      <AnimatePresence mode="wait">
        {screen === 'start' && <StartScreen key="start" />}
        {screen === 'survey' && <ProfileSurvey key="survey" />}
        {screen === 'profile_card' && <ProfileCard key="profile_card" />}
        {screen === 'scenario_select' && <ScenarioSelect key="scenario_select" />}
        {screen === 'intro' && <ScenarioIntro key="intro" />}
        {screen === 'question' && (
          <div key="question" className="relative">
            <QuestionScreen />
            <AnimatePresence>
              {/* FeedbackOverlay is shown at screen level via store */}
            </AnimatePresence>
          </div>
        )}
        {screen === 'feedback' && <FeedbackOverlay key="feedback" />}
        {screen === 'gameover' && <GameOverScreen key="gameover" />}
        {screen === 'result' && <ResultScreen key="result" />}
        {screen === 'wishpool' && <WishPool key="wishpool" />}
        {screen === 'account' && <AccountScreen key="account" />}
      </AnimatePresence>
    </div>
  )
}
