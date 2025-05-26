import React from 'react';
import '../styles/ShotStats.css';
import { generatePlayerStatsPDF, generateBoxScorePDF } from '../utils/pdfGenerator';

const ShotStats = ({ 
  stats, 
  showDownload = false, 
  playerName = '', 
  teamName = '', 
  isTeam = false,
  players = [], 
  playerStats = {},
  otherTeamName = '',
  otherTeamStats = null,
  otherTeamPlayers = [],
  otherTeamPlayerStats = {}
}) => {
  // If no shots have been recorded
  if (stats.total === 0) {
    return (
      <div className="shot-stats empty-stats">
        <p>No shots recorded yet.</p>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    if (isTeam && otherTeamStats) {
      // Determine which team is home/away based on teamName
      const isHome = teamName.toLowerCase().includes('home');
      const gameData = {
        homeTeam: isHome ? teamName : otherTeamName,
        awayTeam: isHome ? otherTeamName : teamName,
        homeStats: isHome ? stats : otherTeamStats,
        awayStats: isHome ? otherTeamStats : stats,
        homePlayers: isHome ? players : otherTeamPlayers,
        awayPlayers: isHome ? otherTeamPlayers : players,
        homePlayerStats: isHome ? playerStats : otherTeamPlayerStats,
        awayPlayerStats: isHome ? otherTeamPlayerStats : playerStats
      };
      generateBoxScorePDF(gameData);
    } else {
      generatePlayerStatsPDF(playerName, stats, teamName);
    }
  };

  return (
    <div className="shot-stats">
      {showDownload && (
        <div className="download-stats">
          <button onClick={handleDownloadPDF} className="download-pdf-btn">
            Download {isTeam ? 'Box Score' : 'Player Stats'} PDF
          </button>
        </div>
      )}

      <div className="overall-stats">
        <div className="stat-box">
          <div className="stat-label">Total Shots</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Makes</div>
          <div className="stat-value">{stats.makes}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Misses</div>
          <div className="stat-value">{stats.misses}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Percentage</div>
          <div className="stat-value">{stats.percentage}%</div>
        </div>
      </div>
      
      <div className="shooting-breakdown">
        <div className="field-goals">
          <h4>Field Goals</h4>
          <div className="stat-details">
            <div className="stat-row">
              <span>Makes:</span>
              <span>{stats.fieldGoals.makes}</span>
            </div>
            <div className="stat-row">
              <span>Attempts:</span>
              <span>{stats.fieldGoals.total}</span>
            </div>
            <div className="stat-row">
              <span>Percentage:</span>
              <span>{stats.fieldGoals.percentage}%</span>
            </div>
          </div>
        </div>

        <div className="free-throws">
          <h4>Free Throws</h4>
          <div className="stat-details">
            <div className="stat-row">
              <span>Makes:</span>
              <span>{stats.freeThrows.makes}</span>
            </div>
            <div className="stat-row">
              <span>Attempts:</span>
              <span>{stats.freeThrows.total}</span>
            </div>
            <div className="stat-row">
              <span>Percentage:</span>
              <span>{stats.freeThrows.percentage}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <h4>Zone Statistics</h4>
      <div className="zone-stats">
        <div className="zone-stat-box">
          <h5>Paint</h5>
          <div className="zone-stat-details">
            <div className="zone-stat-row">
              <span>Makes:</span>
              <span>{stats.zones.paint.makes}</span>
            </div>
            <div className="zone-stat-row">
              <span>Attempts:</span>
              <span>{stats.zones.paint.attempts}</span>
            </div>
            <div className="zone-stat-row">
              <span>Percentage:</span>
              <span>{stats.zones.paint.percentage}%</span>
            </div>
          </div>
        </div>
        
        <div className="zone-stat-box">
          <h5>Mid-Range</h5>
          <div className="zone-stat-details">
            <div className="zone-stat-row">
              <span>Makes:</span>
              <span>{stats.zones.midRange.makes}</span>
            </div>
            <div className="zone-stat-row">
              <span>Attempts:</span>
              <span>{stats.zones.midRange.attempts}</span>
            </div>
            <div className="zone-stat-row">
              <span>Percentage:</span>
              <span>{stats.zones.midRange.percentage}%</span>
            </div>
          </div>
        </div>
        
        <div className="zone-stat-box">
          <h5>3-Point</h5>
          <div className="zone-stat-details">
            <div className="zone-stat-row">
              <span>Makes:</span>
              <span>{stats.zones.threePoint.makes}</span>
            </div>
            <div className="zone-stat-row">
              <span>Attempts:</span>
              <span>{stats.zones.threePoint.attempts}</span>
            </div>
            <div className="zone-stat-row">
              <span>Percentage:</span>
              <span>{stats.zones.threePoint.percentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShotStats; 