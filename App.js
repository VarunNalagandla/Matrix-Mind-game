import React from 'react'
import HomeRoute from './components/HomeRoute'
import GameRulesView from './components/GameRulesView'
import GamePlayingView from './components/GamePlayingView'
import GameResultsView from './components/GameResultsView'
import './App.css'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentView: 'home',
      gameLevel: 1,
      finalLevel: 1,
    }
  }

  navigateToRules = () => this.setState({currentView: 'rules'})

  startGame = () => this.setState({currentView: 'playing'})

  endGame = level => this.setState({finalLevel: level, currentView: 'results'})

  playAgain = () => this.setState({gameLevel: 1, currentView: 'playing'})

  goHome = () => this.setState({currentView: 'home'})

  render() {
    const {currentView, gameLevel, finalLevel} = this.state

    return (
      <div className="app">
        {currentView === 'home' && (
          <HomeRoute onMemoryMatrixClick={this.navigateToRules} />
        )}

        {currentView === 'rules' && (
          <GameRulesView
            onStartPlaying={this.startGame}
            onGoBack={this.goHome}
          />
        )}

        {currentView === 'playing' && (
          <GamePlayingView
            level={gameLevel}
            setLevel={level => this.setState({gameLevel: level})}
            onGameEnd={this.endGame}
            onGoBack={this.goHome}
          />
        )}

        {currentView === 'results' && (
          <GameResultsView
            level={finalLevel}
            onPlayAgain={this.playAgain}
            onGoBack={this.goHome}
          />
        )}
      </div>
    )
  }
}

export default App
