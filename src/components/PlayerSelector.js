import React, { useState } from 'react';
import '../styles/PlayerSelector.css';

const PlayerSelector = ({ players, selectedPlayer, setSelectedPlayer, addPlayer, updatePlayerName }) => {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editPlayerName, setEditPlayerName] = useState('');

  const handlePlayerSelect = (e) => {
    const playerId = parseInt(e.target.value);
    const player = players.find(p => p.id === playerId);
    setSelectedPlayer(player);
  };

  const handlePlayerButtonClick = (player) => {
    setSelectedPlayer(player);
  };

  const handleAddPlayerSubmit = (e) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };
  
  const startEditingPlayer = (player) => {
    setEditingPlayerId(player.id);
    setEditPlayerName(player.name);
  };
  
  const handleEditPlayerSubmit = (e, playerId) => {
    e.preventDefault();
    if (editPlayerName.trim()) {
      updatePlayerName(playerId, editPlayerName.trim());
      setEditingPlayerId(null);
      setEditPlayerName('');
    }
  };
  
  const cancelEditing = () => {
    setEditingPlayerId(null);
    setEditPlayerName('');
  };

  return (
    <div className="player-selector">
      <div className="player-select-container">
        <label htmlFor="player-select">Player:</label>
        <select
          id="player-select"
          value={selectedPlayer ? selectedPlayer.id : ''}
          onChange={handlePlayerSelect}
        >
          <option value="" disabled>Select a player</option>
          {players.map(player => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        
        <button 
          type="button" 
          className="add-player-button"
          onClick={() => setShowAddPlayer(!showAddPlayer)}
        >
          {showAddPlayer ? 'Cancel' : 'Add Player'}
        </button>
      </div>

      <div className="player-quick-select">
        {players.map(player => (
          <div key={player.id} className="player-button-container">
            {editingPlayerId === player.id ? (
              <form onSubmit={(e) => handleEditPlayerSubmit(e, player.id)} className="edit-player-form">
                <input
                  type="text"
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                  autoFocus
                />
                <div className="edit-buttons">
                  <button type="submit" className="save-button">Save</button>
                  <button type="button" onClick={cancelEditing} className="cancel-button">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  className={`player-button ${selectedPlayer && selectedPlayer.id === player.id ? 'active' : ''}`}
                  onClick={() => handlePlayerButtonClick(player)}
                >
                  {player.name}
                </button>
                <button 
                  type="button" 
                  className="edit-name-button"
                  onClick={() => startEditingPlayer(player)}
                  title="Rename player"
                >
                  ✏️
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {showAddPlayer && (
        <form onSubmit={handleAddPlayerSubmit} className="add-player-form">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Enter player name"
            required
          />
          <button type="submit">Add</button>
        </form>
      )}
    </div>
  );
};

export default PlayerSelector; 