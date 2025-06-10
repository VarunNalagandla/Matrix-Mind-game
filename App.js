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

---------------------------------------------------------------------------------------------

import React from 'react'
import './index.css'

class GamePlayingView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showRules: false,
      gameState: 'waiting',
      gridSize: Math.min(5, props.level + 2),
      activeTiles: [],
      userSelections: [],
      score: 0,
    }
    this.hideTimeout = null
  }

  componentDidMount() {
    this.generatePattern()
  }

  componentDidUpdate(prevProps) {
    const {level} = this.props
    if (prevProps.level !== level) {
      this.generatePattern()
    }
  }

  componentWillUnmount() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout)
    }
  }

  generatePattern = () => {
    const {level, onGameEnd} = this.props

    if (level > 4) {
      onGameEnd(4)
      return
    }

    const gridSize = Math.min(5, level + 2)
    const numTiles = Math.min(level + 1, gridSize * gridSize)
    const tiles = []

    while (tiles.length < numTiles) {
      const randomTile = Math.floor(Math.random() * gridSize * gridSize)
      if (!tiles.includes(randomTile)) {
        tiles.push(randomTile)
      }
    }

    this.setState({
      gridSize,
      activeTiles: tiles,
      gameState: 'showing',
      userSelections: [],
    })

    // Show all active tiles briefly, then switch to guessing
    this.hideTimeout = setTimeout(() => {
      this.setState({gameState: 'guessing'})
    }, 2000) // Show all for 2 seconds
  }

  handleTileClick = tileIndex => {
    const {gameState, userSelections, activeTiles} = this.state
    const {level, onGameEnd, setLevel} = this.props

    if (gameState !== 'guessing') return
    if (userSelections.includes(tileIndex)) return

    const newSelections = [...userSelections, tileIndex]
    const isCorrect = activeTiles.includes(tileIndex)

    if (!isCorrect) {
      this.setState({gameState: 'result', userSelections: newSelections})
      setTimeout(() => onGameEnd(level), 1500)
      return
    }

    if (newSelections.length === activeTiles.length) {
      this.setState(
        prevState => ({
          score: prevState.score + level * 10,
          gameState: 'result',
          userSelections: newSelections,
        }),
        () => {
          setTimeout(() => {
            if (level < 4) {
              setLevel(level + 1)
            } else {
              onGameEnd(4)
            }
          }, 1500)
        },
      )
    } else {
      this.setState({userSelections: newSelections})
    }
  }

  renderTile = index => {
    const {gameState, activeTiles, userSelections} = this.state
    const isActive = activeTiles.includes(index)
    const isUserSelected = userSelections.includes(index)
    const isWrongGuess = gameState === 'result' && isUserSelected && !isActive
    const isCorrectGuess = isUserSelected && isActive
    const isShowingPhase = gameState === 'showing' && isActive

    let className = 'tile'
    if (isShowingPhase) className += ' showing'
    if (isCorrectGuess) className += ' correct'
    if (isWrongGuess) className += ' wrong'

    return (
      <button
        key={index}
        className={className}
        onClick={() => this.handleTileClick(index)}
        type="button"
        aria-label={`Tile ${index + 1}`}
      />
    )
  }

  render() {
    const {onGoBack, level} = this.props
    const {showRules, score, gridSize} = this.state

    return (
      <div className="game-playing-view">
        <div className="game-header">
          <button className="back-button" onClick={onGoBack} type="button">
            ← Back
          </button>
          <button
            className="rules-button"
            onClick={() => this.setState({showRules: true})}
            type="button"
          >
            Rules
          </button>
        </div>

        <div className="game-info">
          <h2>Level: {level}</h2>
          <h3>Score: {score}</h3>
        </div>

        <div
          className="game-grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 60px)`,
            gridTemplateRows: `repeat(${gridSize}, 60px)`,
          }}
        >
          {Array.from({length: gridSize * gridSize}).map((_, index) =>
            this.renderTile(index),
          )}
        </div>

        {showRules && (
          <div className="rules-popup">
            <div className="rules-popup-content">
              <h3>Memory Matrix Rules</h3>
              <p>
                Memorize the highlighted tiles, then select them in any order.
              </p>
              <p>Each level increases difficulty. You have 4 levels total.</p>
              <button
                onClick={() => this.setState({showRules: false})}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default GamePlayingView

---------------------------------------------------------------------------------------------

  import React from 'react'
import './index.css'

class GameResultsView extends React.Component {
  render() {
    const {level, onGoBack, onPlayAgain} = this.props
    const maxLevel = 4
    const percentage = Math.min(100, (level / maxLevel) * 100)

    let message
    if (level === 4) {
      message = "Amazing! You've mastered Memory Matrix!"
    } else if (level === 3) {
      message = "Great job! You're getting really good at this!"
    } else if (level === 2) {
      message = 'Good effort! Keep practicing to improve!'
    } else {
      message = "Nice try! You'll do better next time!"
    }

    return (
      <div className="game-results-view">
        <button className="back-button" onClick={onGoBack} type="button">
          ← Back
        </button>

        <h1>Game Complete!</h1>
        <h2>You reached level {level}</h2>

        <div className="progress-container">
          <div className="progress-bar" style={{width: `${percentage}%`}}>
            {percentage}%
          </div>
        </div>

        <div className="result-message">
          <p>{message}</p>
        </div>

        <button
          className="play-again-button"
          onClick={onPlayAgain}
          type="button"
        >
          Play Again
        </button>
      </div>
    )
  }
}

export default GameResultsView

---------------------------------------------------------------------------------------------

import React from 'react'
import './index.css'

class GameRulesView extends React.Component {
  render() {
    const {onGoBack, onStartPlaying} = this.props

    return (
      <div className="game-rules-view">
        <button type="button" className="back-button" onClick={onGoBack}>
          ← Back
        </button>
        <h1>Memory Matrix Rules</h1>

        <div className="rules-content">
          <h2>How to Play</h2>
          <ol>
            <li>Watch as tiles light up in a specific pattern</li>
            <li>Remember the pattern</li>
            <li>Click on the tiles in the same order they lit up</li>
            <li>Correct answers advance you to the next level</li>
            <li>Each level increases the pattern complexity</li>
          </ol>

          <h2>Scoring</h2>
          <ul>
            <li>+10 points for each correct pattern</li>
            <li>Bonus points for completing levels quickly</li>
            <li>Reach level 10 to complete the game</li>
          </ul>
        </div>

        <button type="button" className="start-button" onClick={onStartPlaying}>
          Start Playing
        </button>
      </div>
    )
  }
}

export default GameRulesView

---------------------------------------------------------------------------------------------

import React from 'react'
import './index.css'

class HomeRoute extends React.Component {
  render() {
    const {onMemoryMatrixClick} = this.props

    return (
      <div className="home-route">
        <h1>Brain Games</h1>
        <div className="game-cards">
          <button
            className="game-card"
            onClick={onMemoryMatrixClick}
            type="button"
          >
            <h2>Memory Matrix</h2>
            <p>Test your memory by repeating patterns</p>
          </button>
          {/* Add other game cards as needed */}
        </div>
      </div>
    )
  }
}

export default HomeRoute

---------------------------------------------------------------------------------------------

class RulesPopup extends React.Component {
  render() {
    return (
      <div className="modal">
        <div className="modal-content">
          <h3>Memory Matrix Rules</h3>
          <p>1. Observe the highlighted tiles...</p>
          <button onClick={this.props.onClose}>Close</button>
        </div>
      </div>
    )
  }
}

