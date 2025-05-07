import { useState, useEffect } from 'react';
import { ref, set, onValue, push, remove } from 'firebase/database';
import { database } from './firebase';
import { GameState, Player } from './types/game';
import { initializeGame, dealCards } from './utils/gameLogic';
import './App.css';

function App() {
  const [gameId, setGameId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (gameId) {
      const gameRef = ref(database, `games/${gameId}`);
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGameState(data);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [gameId]);

  const createGame = async () => {
    if (!playerName) return;

    const newGameRef = push(ref(database, 'games'));
    const newGameId = newGameRef.key!;
    
    const initialGame = initializeGame();
    const gameWithCards = dealCards(initialGame);
    
    const player: Player = {
      id: '1',
      name: playerName,
      cards: gameWithCards.players[0].cards,
      isHost: true
    };

    const gameState: GameState = {
      ...gameWithCards,
      players: [player],
      currentTurn: '1',
      status: 'waiting'
    };

    await set(newGameRef, gameState);
    setGameId(newGameId);
  };

  const joinGame = async () => {
    if (!gameId || !playerName) return;

    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.players.length >= 4) {
          alert('Game is full!');
          return;
        }

        const newPlayer: Player = {
          id: (data.players.length + 1).toString(),
          name: playerName,
          cards: data.players[0].cards,
          isHost: false
        };

        const updatedGame: GameState = {
          ...data,
          players: [...data.players, newPlayer]
        };

        set(gameRef, updatedGame);
        setGameState(updatedGame);
      }
    }, { once: true });
  };

  const startGame = async () => {
    if (!gameId || !gameState) return;

    const gameRef = ref(database, `games/${gameId}`);
    const updatedGame: GameState = {
      ...gameState,
      status: 'playing'
    };

    await set(gameRef, updatedGame);
  };

  const leaveGame = async () => {
    if (!gameId || !gameState) return;

    const gameRef = ref(database, `games/${gameId}`);
    if (gameState.players.length === 1) {
      await remove(gameRef);
    } else {
      const updatedPlayers = gameState.players.filter(p => p.name !== playerName);
      const updatedGame: GameState = {
        ...gameState,
        players: updatedPlayers
      };
      await set(gameRef, updatedGame);
    }

    setGameId('');
    setGameState(null);
  };

  return (
    <div className="container">
      {!gameId ? (
        <div className="form">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <div className="buttons">
            <button onClick={createGame}>Create New Game</button>
            <div className="join-game">
              <input
                type="text"
                placeholder="Enter game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
              />
              <button onClick={joinGame}>Join Game</button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2>Game ID: {gameId}</h2>
          {gameState && (
            <div className="game-info">
              <h3>Players:</h3>
              <ul>
                {gameState.players.map((player) => (
                  <li key={player.id}>
                    {player.name} {player.isHost ? '(Host)' : ''}
                  </li>
                ))}
              </ul>
              {gameState.status === 'waiting' && gameState.players[0].name === playerName && (
                <button onClick={startGame}>Start Game</button>
              )}
              <button onClick={leaveGame}>Leave Game</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App; 