import React, { useState, useRef, useEffect } from 'react';
import basketballCourt from 'basketball-court';
import '../styles/CourtTracker.css';
import ShotStats from './ShotStats';
import PlayerSelector from './PlayerSelector';

const CourtTracker = () => {
  const [shots, setShots] = useState([]);
  const [freeThrows, setFreeThrows] = useState([]);
  const [currentSelection, setCurrentSelection] = useState('make'); // 'make' or 'miss'
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', team: 'home' },
    { id: 2, name: 'Player 2', team: 'home' },
    { id: 3, name: 'Player 3', team: 'away' },
    { id: 4, name: 'Player 4', team: 'away' },
  ]);
  const [courtType, setCourtType] = useState('nba');
  const [courtTheme, setCourtTheme] = useState('plain');
  const [isHorizontal, setIsHorizontal] = useState(true); // Default to horizontal
  const [courtSize, setCourtSize] = useState(70); // Default to 70% to ensure it's fully visible
  const [courtBackgroundUrl, setCourtBackgroundUrl] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('home'); // 'home' or 'away'
  const [teamNames, setTeamNames] = useState({
    home: 'Home Team',
    away: 'Away Team'
  });
  const [shotFilterMode, setShotFilterMode] = useState('team'); // 'team', 'player', or 'all'
  const [filteredPlayerId, setFilteredPlayerId] = useState(null);
  
  const courtContainerRef = useRef(null);
  
  // Court dimensions in feet (NBA regulation)
  const courtWidth = 50;
  const courtLength = 94;
  const threePointRadius = 23.75;

  // Generate court using basketball-court library and convert to background image
  useEffect(() => {
    if (courtContainerRef.current) {
      // Get container dimensions
      const containerWidth = courtContainerRef.current.clientWidth;
      
      // Generate court
      const court = basketballCourt({
        width: containerWidth * (courtSize / 100), // Use percentage of container width
        type: courtType,
        theme: courtTheme,
        horizontal: isHorizontal
      });
      
      // Get SVG string
      const svgString = court.toString();
      
      // Create a blob URL for the SVG
      const blob = new Blob([svgString], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      
      // Set as background URL
      setCourtBackgroundUrl(url);
      
      // Clean up the URL when the component unmounts or when dependencies change
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [courtType, courtTheme, isHorizontal, courtSize, courtContainerRef]);
  
  // Add a shot
  const addShot = (e) => {
    if (!courtContainerRef.current || !selectedPlayer) return;
    
    const rect = courtContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to percentage of court dimensions
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    
    // Convert to actual court coordinates in feet
    let courtX, courtY;
    
    if (isHorizontal) {
      // For horizontal court
      courtX = xPercent * courtLength;
      courtY = yPercent * courtWidth;
    } else {
      // For vertical court
      courtX = xPercent * courtWidth;
      courtY = yPercent * courtLength;
    }
    
    // Determine the shot zone
    let zone;
    if (isInPaint(courtX, courtY)) {
      zone = 'paint';
    } else if (isThreePoint(courtX, courtY)) {
      zone = 'threePoint';
    } else {
      zone = 'midRange';
    }
    
    const newShot = {
      id: Date.now(),
      x: xPercent,
      y: yPercent,
      courtX,
      courtY,
      isMake: currentSelection === 'make',
      timestamp: new Date(),
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      team: selectedPlayer.team,
      zone: zone
    };
    
    setShots(prevShots => [...prevShots, newShot]);
  };
  
  // Undo last shot
  const undoLastShot = () => {
    const lastShot = shots[shots.length - 1];
    const lastFreeThrow = freeThrows[freeThrows.length - 1];

    if (!lastShot && !lastFreeThrow) return;

    if (!lastShot || (lastFreeThrow && lastFreeThrow.timestamp > lastShot.timestamp)) {
      setFreeThrows(prev => {
        const newFreeThrows = [...prev];
        newFreeThrows.pop();
        return newFreeThrows;
      });
    } else {
      setShots(prev => {
        const newShots = [...prev];
        newShots.pop();
        return newShots;
      });
    }
  };
  
  // Update team name
  const updateTeamName = (team, newName) => {
    if (!newName || !newName.trim()) return;
    
    setTeamNames(prev => ({
      ...prev,
      [team]: newName.trim()
    }));
  };
  
  // Calculate shooting stats
  const calculateStats = (player = null, team = null) => {
    let filteredShots = shots;
    let filteredFreeThrows = freeThrows;
    
    if (player) {
      filteredShots = shots.filter(shot => shot.playerId === player.id);
      filteredFreeThrows = freeThrows.filter(ft => ft.playerId === player.id);
    } else if (team) {
      filteredShots = shots.filter(shot => shot.team === team);
      filteredFreeThrows = freeThrows.filter(ft => ft.team === team);
    }
    
    const fieldGoalTotal = filteredShots.length;
    const fieldGoalMakes = filteredShots.filter(shot => shot.isMake).length;
    const fieldGoalMisses = fieldGoalTotal - fieldGoalMakes;
    const fieldGoalPercentage = fieldGoalTotal > 0 ? Math.round((fieldGoalMakes / fieldGoalTotal) * 100) : 0;

    const freeThrowTotal = filteredFreeThrows.length;
    const freeThrowMakes = filteredFreeThrows.filter(ft => ft.isMake).length;
    const freeThrowMisses = freeThrowTotal - freeThrowMakes;
    const freeThrowPercentage = freeThrowTotal > 0 ? Math.round((freeThrowMakes / freeThrowTotal) * 100) : 0;
    
    // Zone calculations for field goals
    const zones = {
      paint: { makes: 0, attempts: 0 },
      midRange: { makes: 0, attempts: 0 },
      threePoint: { makes: 0, attempts: 0 },
      freeThrow: { makes: freeThrowMakes, attempts: freeThrowTotal }
    };
    
    filteredShots.forEach(shot => {
      const zone = shot.zone || 'midRange';
      zones[zone].attempts++;
      if (shot.isMake) {
        zones[zone].makes++;
      }
    });
    
    return {
      total: fieldGoalTotal + freeThrowTotal,
      makes: fieldGoalMakes + freeThrowMakes,
      misses: fieldGoalMisses + freeThrowMisses,
      percentage: (fieldGoalTotal + freeThrowTotal) > 0 
        ? Math.round(((fieldGoalMakes + freeThrowMakes) / (fieldGoalTotal + freeThrowTotal)) * 100) 
        : 0,
      fieldGoals: {
        total: fieldGoalTotal,
        makes: fieldGoalMakes,
        misses: fieldGoalMisses,
        percentage: fieldGoalPercentage
      },
      freeThrows: {
        total: freeThrowTotal,
        makes: freeThrowMakes,
        misses: freeThrowMisses,
        percentage: freeThrowPercentage
      },
      zones: {
        paint: {
          ...zones.paint,
          percentage: zones.paint.attempts > 0 
            ? Math.round((zones.paint.makes / zones.paint.attempts) * 100) 
            : 0
        },
        midRange: {
          ...zones.midRange,
          percentage: zones.midRange.attempts > 0 
            ? Math.round((zones.midRange.makes / zones.midRange.attempts) * 100) 
            : 0
        },
        threePoint: {
          ...zones.threePoint,
          percentage: zones.threePoint.attempts > 0 
            ? Math.round((zones.threePoint.makes / zones.threePoint.attempts) * 100) 
            : 0
        },
        freeThrow: {
          ...zones.freeThrow,
          percentage: zones.freeThrow.attempts > 0 
            ? Math.round((zones.freeThrow.makes / zones.freeThrow.attempts) * 100) 
            : 0
        }
      }
    };
  };
  
  const calculatePlayerStats = (team) => {
    const teamPlayers = players.filter(p => p.team === team);
    const playerStats = {};
    
    teamPlayers.forEach(player => {
      playerStats[player.id] = calculateStats(player);
    });
    
    return playerStats;
  };
  
  // Helper functions for zone determination
  const isInPaint = (x, y) => {
    // NBA paint is 16ft wide and extends 19ft from baseline
    if (isHorizontal) {
      // For horizontal court - x is length, y is width
      const paintWidth = 16;
      const paintLength = 19;
      const halfWidth = courtWidth / 2;
      
      // Check if point is within the paint rectangle from either baseline
      const fromLowerBaseline = y >= halfWidth - paintWidth/2 && 
                              y <= halfWidth + paintWidth/2 && 
                              x <= paintLength;
      
      const fromUpperBaseline = y >= halfWidth - paintWidth/2 && 
                              y <= halfWidth + paintWidth/2 && 
                              x >= courtLength - paintLength;
      
      return fromLowerBaseline || fromUpperBaseline;
    } else {
      // For vertical court - x is width, y is length
      const paintWidth = 16;
      const paintLength = 19;
      const halfWidth = courtWidth / 2;
      
      // Check if point is within the paint rectangle from either baseline
      const fromLeftBaseline = x >= halfWidth - paintWidth/2 && 
                             x <= halfWidth + paintWidth/2 && 
                             y <= paintLength;
      
      const fromRightBaseline = x >= halfWidth - paintWidth/2 && 
                              x <= halfWidth + paintWidth/2 && 
                              y >= courtLength - paintLength;
      
      return fromLeftBaseline || fromRightBaseline;
    }
  };
  
  const isThreePoint = (x, y) => {
    // Get the appropriate three-point radius for the court type
    let radius;
    
    if (courtType === 'nba') {
      radius = 23.75; // NBA three-point distance in feet (22ft in corners, but we'll handle that separately)
    } else if (courtType === 'fiba' || courtType === 'wnba') {
      radius = 22.15; // FIBA/WNBA three-point distance in feet
    } else if (courtType === 'ncaa') {
      radius = 22.15; // NCAA three-point distance in feet (post-2019)
    }
    
    // Using distance from basket formula
    if (isHorizontal) {
      // For horizontal court
      const halfWidth = courtWidth / 2;
      
      // NBA baskets are positioned at 5.25ft from each baseline
      const basketY = halfWidth;
      const lowerBasketX = 5.25;
      const upperBasketX = courtLength - 5.25;
      
      // Distance from each basket
      const lowerBasketDist = Math.sqrt(
        Math.pow(x - lowerBasketX, 2) + 
        Math.pow(y - basketY, 2)
      );
      
      const upperBasketDist = Math.sqrt(
        Math.pow(x - upperBasketX, 2) + 
        Math.pow(y - basketY, 2)
      );
      
      // In NBA courts, corner threes are only 22ft
      const cornerThreeRadius = 22;
      
      // Check for corner three scenarios - 14ft is the approx width at which corner three starts
      const isLowerCornerThree = Math.abs(y - basketY) >= 14 && x <= 14;
      const isUpperCornerThree = Math.abs(y - basketY) >= 14 && x >= courtLength - 14;
      
      const isCornerThree = isLowerCornerThree || isUpperCornerThree;
      
      // If it's a potential corner three, use the corner distance
      if (isCornerThree) {
        return courtType === 'nba' ? 
          Math.min(lowerBasketDist, upperBasketDist) > cornerThreeRadius :
          Math.min(lowerBasketDist, upperBasketDist) > radius;
      }
      
      // Otherwise use the standard arc distance
      return Math.min(lowerBasketDist, upperBasketDist) > radius;
    } else {
      // For vertical court
      const halfWidth = courtWidth / 2;
      
      // NBA baskets are positioned at 5.25ft from each baseline
      const basketX = halfWidth;
      const lowerBasketY = 5.25;
      const upperBasketY = courtLength - 5.25;
      
      // Distance from each basket
      const lowerBasketDist = Math.sqrt(
        Math.pow(x - basketX, 2) + 
        Math.pow(y - lowerBasketY, 2)
      );
      
      const upperBasketDist = Math.sqrt(
        Math.pow(x - basketX, 2) + 
        Math.pow(y - upperBasketY, 2)
      );
      
      // In NBA courts, corner threes are only 22ft
      const cornerThreeRadius = 22;
      
      // Check for corner three scenarios
      const isLeftCornerThree = Math.abs(x - basketX) >= 14 && y <= 14;
      const isRightCornerThree = Math.abs(x - basketX) >= 14 && y >= courtLength - 14;
      
      const isCornerThree = isLeftCornerThree || isRightCornerThree;
      
      // If it's a potential corner three, use the corner distance
      if (isCornerThree) {
        return courtType === 'nba' ? 
          Math.min(lowerBasketDist, upperBasketDist) > cornerThreeRadius :
          Math.min(lowerBasketDist, upperBasketDist) > radius;
      }
      
      // Otherwise use the standard arc distance
      return Math.min(lowerBasketDist, upperBasketDist) > radius;
    }
  };
  
  // Clear all shots
  const clearShots = () => {
    setShots([]);
    setFreeThrows([]);
  };
  
  // Handle shot type selection
  const handleSelectionChange = (e) => {
    setCurrentSelection(e.target.value);
  };

  // Handle team selection
  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
    setSelectedPlayer(null); // Reset player when changing team
  };

  // Handle court type selection
  const handleCourtTypeChange = (e) => {
    setCourtType(e.target.value);
  };

  // Handle court theme selection
  const handleCourtThemeChange = (e) => {
    setCourtTheme(e.target.value);
  };

  // Handle court size change
  const handleCourtSizeChange = (e) => {
    setCourtSize(Number(e.target.value));
  };

  // Add a new player
  const addPlayer = (playerName) => {
    const newPlayer = {
      id: Date.now(),
      name: playerName,
      team: selectedTeam
    };
    setPlayers([...players, newPlayer]);
    setSelectedPlayer(newPlayer);
  };
  
  // Update player name
  const updatePlayerName = (playerId, newName) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId 
          ? { ...player, name: newName } 
          : player
      )
    );
    
    // Update the selected player if it's the one being renamed
    if (selectedPlayer && selectedPlayer.id === playerId) {
      setSelectedPlayer(prev => ({ ...prev, name: newName }));
    }
    
    // Update player name in shots
    setShots(prevShots => 
      prevShots.map(shot => 
        shot.playerId === playerId 
          ? { ...shot, playerName: newName } 
          : shot
      )
    );
  };
  
  // Delete a player
  const deletePlayer = (playerId) => {
    // Remove player from the players list
    setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerId));
    
    // Remove shots associated with the player
    setShots(prevShots => prevShots.filter(shot => shot.playerId !== playerId));
    
    // Unselect the player if it's currently selected
    if (selectedPlayer && selectedPlayer.id === playerId) {
      setSelectedPlayer(null);
    }
  };
  
  // Handle shot filter mode change
  const handleShotFilterModeChange = (mode) => {
    setShotFilterMode(mode);
    
    // If switching to player filter, use the currently selected player
    if (mode === 'player' && selectedPlayer) {
      setFilteredPlayerId(selectedPlayer.id);
    } else {
      setFilteredPlayerId(null);
    }
  };
  
  // Select player directly
  const selectPlayer = (player) => {
    setSelectedPlayer(player);
    setSelectedTeam(player.team);
    
    // If in player filter mode, update the filtered player too
    if (shotFilterMode === 'player') {
      setFilteredPlayerId(player.id);
    }
  };
  
  // Filter players by team
  const homePlayers = players.filter(player => player.team === 'home');
  const awayPlayers = players.filter(player => player.team === 'away');
  
  // Calculate overall stats
  const overallStats = calculateStats();
  // Calculate team stats
  const teamStats = calculateStats(null, selectedTeam);
  // Calculate player stats if a player is selected
  const playerStats = selectedPlayer ? calculateStats(selectedPlayer) : null;
  
  // Filter shots for display based on current mode
  const getFilteredShots = () => {
    if (shotFilterMode === 'team') {
      return shots.filter(shot => shot.team === selectedTeam);
    } else if (shotFilterMode === 'player' && filteredPlayerId) {
      return shots.filter(shot => shot.playerId === filteredPlayerId);
    } else {
      return shots; // All shots
    }
  };
  
  // Add free throw handler
  const handleFreeThrow = () => {
    if (!selectedPlayer) {
      alert('Please select a player first');
      return;
    }

    const newFreeThrow = {
      id: Date.now(),
      isMake: currentSelection === 'make',
      timestamp: new Date(),
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      team: selectedPlayer.team
    };

    setFreeThrows(prev => [...prev, newFreeThrow]);
  };
  
  return (
    <div className="court-tracker">
      <div className="tracker-header">
        <h1>SWAMY Basketball Tracker</h1>
      </div>
      
      <div className="controls">
        <div className="primary-controls">
          <div className="team-selection">
            <label htmlFor="team-select">Team:</label>
            <select 
              id="team-select" 
              value={selectedTeam} 
              onChange={handleTeamChange}
            >
              <option value="home">{teamNames.home}</option>
              <option value="away">{teamNames.away}</option>
            </select>
          </div>
          
          <div className="shot-selection">
            <label>
              <input
                type="radio"
                value="make"
                checked={currentSelection === 'make'}
                onChange={handleSelectionChange}
              />
              Make
            </label>
            <label>
              <input
                type="radio"
                value="miss"
                checked={currentSelection === 'miss'}
                onChange={handleSelectionChange}
              />
              Miss
            </label>
          </div>
          
          <div className="shot-filter-selection">
            <label>Filter Shots:</label>
            <div className="filter-options">
              <label>
                <input
                  type="radio"
                  value="team"
                  checked={shotFilterMode === 'team'}
                  onChange={() => handleShotFilterModeChange('team')}
                />
                <span>By Team</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="player"
                  checked={shotFilterMode === 'player'}
                  onChange={() => handleShotFilterModeChange('player')}
                />
                <span>By Player</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="all"
                  checked={shotFilterMode === 'all'}
                  onChange={() => handleShotFilterModeChange('all')}
                />
                <span>All Shots</span>
              </label>
            </div>
          </div>
          
          <div className="shot-actions">
            <button 
              onClick={handleFreeThrow} 
              className="free-throw-button"
              disabled={!selectedPlayer}
            >
              Record Free Throw
            </button>
            <button 
              onClick={undoLastShot} 
              className="undo-button" 
              disabled={shots.length === 0 && freeThrows.length === 0}
            >
              Undo Last Shot
            </button>
            <button 
              onClick={clearShots} 
              className="clear-button" 
              disabled={shots.length === 0 && freeThrows.length === 0}
            >
              Clear All Shots
            </button>
          </div>
        </div>
        
        <div className="court-controls">
          <div className="court-type-selection">
            <label htmlFor="court-type">Court Type:</label>
            <select 
              id="court-type" 
              value={courtType} 
              onChange={handleCourtTypeChange}
            >
              <option value="nba">NBA</option>
              <option value="fiba">FIBA</option>
              <option value="ncaa">NCAA</option>
              <option value="wnba">WNBA</option>
            </select>
          </div>
          
          <div className="court-theme-selection">
            <label htmlFor="court-theme">Court Theme:</label>
            <select 
              id="court-theme" 
              value={courtTheme} 
              onChange={handleCourtThemeChange}
            >
              <option value="plain">Plain</option>
              <option value="beach">Beach</option>
              <option value="steppe">Steppe</option>
              <option value="volcano">Volcano</option>
            </select>
          </div>
          
          <div className="court-size-selection">
            <label htmlFor="court-size">Court Size:</label>
            <input
              type="range"
              id="court-size"
              min="40"
              max="90"
              value={courtSize}
              onChange={handleCourtSizeChange}
            />
            <span>{courtSize}%</span>
          </div>
        </div>
      </div>

      <div className="court-message">
        {!selectedPlayer && <p>Please select a player before recording shots</p>}
        {shotFilterMode === 'player' && filteredPlayerId && (
          <p className="filter-message">
            Showing shots for: {players.find(p => p.id === filteredPlayerId)?.name || 'Selected Player'}
          </p>
        )}
      </div>
      
      <div className="court-layout">
        {/* Home Team Side Panel */}
        <div className="team-panel home-panel">
          <h3>
            <span className="team-name">{teamNames.home}</span>
            <button 
              className="edit-team-name-btn"
              onClick={() => {
                const newName = prompt('Enter new team name:', teamNames.home);
                if (newName) updateTeamName('home', newName);
              }}
              title="Edit team name"
            >
              ✏️
            </button>
          </h3>
          <div className="team-player-list">
            {homePlayers.map(player => (
              <div 
                key={player.id} 
                className={`team-player-item ${selectedPlayer && selectedPlayer.id === player.id ? 'active' : ''}`}
                onClick={() => selectPlayer(player)}
              >
                <span className="player-name">{player.name}</span>
                <div className="player-actions">
                  <button 
                    className="player-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newName = prompt('Enter new player name:', player.name);
                      if (newName && newName.trim()) {
                        updatePlayerName(player.id, newName.trim());
                      }
                    }}
                    title="Edit player"
                  >
                    ✏️
                  </button>
                  <button 
                    className="player-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete ${player.name}?`)) {
                        deletePlayer(player.id);
                      }
                    }}
                    title="Delete player"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            <button 
              className="add-team-player-btn"
              onClick={() => {
                setSelectedTeam('home');
                const newName = prompt('Enter new player name:');
                if (newName && newName.trim()) {
                  addPlayer(newName.trim());
                }
              }}
            >
              + Add Player
            </button>
          </div>
        </div>
        
        {/* Court */}
        <div className="court-wrapper">
          <div 
            className="court-container" 
            ref={courtContainerRef} 
            onClick={addShot}
            style={{
              backgroundImage: `url(${courtBackgroundUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: `100%`,
              aspectRatio: isHorizontal ? '1.88/1' : '1/1.88' // Approximate court aspect ratio
            }}
          >
            {/* Shot markers - directly on top of background */}
            {getFilteredShots().map(shot => (
              <div
                key={shot.id}
                className={`shot-marker ${shot.isMake ? 'make' : 'miss'}`}
                style={{
                  left: `${shot.x * 100}%`,
                  top: `${shot.y * 100}%`
                }}
                title={`${shot.playerName}: ${shot.isMake ? 'Make' : 'Miss'} - ${shot.zone || 'Unknown'}`}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Away Team Side Panel */}
        <div className="team-panel away-panel">
          <h3>
            <span className="team-name">{teamNames.away}</span>
            <button 
              className="edit-team-name-btn"
              onClick={() => {
                const newName = prompt('Enter new team name:', teamNames.away);
                if (newName) updateTeamName('away', newName);
              }}
              title="Edit team name"
            >
              ✏️
            </button>
          </h3>
          <div className="team-player-list">
            {awayPlayers.map(player => (
              <div 
                key={player.id} 
                className={`team-player-item ${selectedPlayer && selectedPlayer.id === player.id ? 'active' : ''}`}
                onClick={() => selectPlayer(player)}
              >
                <span className="player-name">{player.name}</span>
                <div className="player-actions">
                  <button 
                    className="player-edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newName = prompt('Enter new player name:', player.name);
                      if (newName && newName.trim()) {
                        updatePlayerName(player.id, newName.trim());
                      }
                    }}
                    title="Edit player"
                  >
                    ✏️
                  </button>
                  <button 
                    className="player-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete ${player.name}?`)) {
                        deletePlayer(player.id);
                      }
                    }}
                    title="Delete player"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            <button 
              className="add-team-player-btn"
              onClick={() => {
                setSelectedTeam('away');
                const newName = prompt('Enter new player name:');
                if (newName && newName.trim()) {
                  addPlayer(newName.trim());
                }
              }}
            >
              + Add Player
            </button>
          </div>
        </div>
      </div>
      
      <div className="overall-stats-container">
          <h3>Overall Stats</h3>
          <ShotStats 
            stats={overallStats} 
            showDownload={false} 
          />
        </div>

      <div className="stats-container">
        {playerStats && (
          <div className="player-stats">
            <h3>Player Stats: {selectedPlayer.name}</h3>
            <ShotStats 
              stats={playerStats} 
              showDownload={true} 
              playerName={selectedPlayer.name} 
              teamName={selectedTeam === 'home' ? teamNames.home : teamNames.away} 
            />
          </div>
        )}

        <div className="team-stats">
          <h3>Team Stats: {selectedTeam === 'home' ? teamNames.home : teamNames.away}</h3>
          <ShotStats 
            stats={teamStats} 
            showDownload={true} 
            isTeam={true}
            teamName={selectedTeam === 'home' ? teamNames.home : teamNames.away}
            otherTeamName={selectedTeam === 'home' ? teamNames.away : teamNames.home}
            otherTeamStats={calculateStats(null, selectedTeam === 'home' ? 'away' : 'home')}
            players={selectedTeam === 'home' ? homePlayers : awayPlayers}
            playerStats={calculatePlayerStats(selectedTeam)}
            otherTeamPlayers={selectedTeam === 'home' ? awayPlayers : homePlayers}
            otherTeamPlayerStats={calculatePlayerStats(selectedTeam === 'home' ? 'away' : 'home')}
          />
        </div>
      </div>
    </div>
  );
};

export default CourtTracker; 