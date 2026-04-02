import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

function PlayerDatabase({ onBack }) {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedTribe, setSelectedTribe] = useState('all');

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [searchTerm, selectedSeason, selectedTribe, players]);

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/players`);
      const data = await response.json();
      if (response.ok) {
        setPlayers(data.players);
        setFilteredPlayers(data.players);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlayers = () => {
    let filtered = [...players];

    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSeason !== 'all') {
      filtered = filtered.filter(player =>
        player.season === parseInt(selectedSeason)
      );
    }

    if (selectedTribe !== 'all') {
      filtered = filtered.filter(player =>
        player.tribe.toLowerCase() === selectedTribe.toLowerCase()
      );
    }

    setFilteredPlayers(filtered);
  };

  const seasons = [...new Set(players.map(p => p.season))].sort();
  const tribes = [...new Set(players.map(p => p.tribe))].sort();

  const getPlacementLabel = (placement) => {
    if (placement === 1) return '🥇 Winner';
    if (placement === 2) return '🥈 Runner-up';
    if (placement === 3) return '🥉 3rd Place';
    return `${placement}th place`;
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>← Back to Dashboard</button>

      <div style={styles.header}>
        <h1 style={styles.title}>🏝️ Player Database</h1>
        <p style={styles.subtitle}>{filteredPlayers.length} players found</p>
      </div>

      <div style={styles.filtersCard}>
        <input
          type="text"
          placeholder="🔍 Search by player name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Season</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Seasons</option>
              {seasons.map(season => (
                <option key={season} value={season}>Season {season}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Tribe</label>
            <select
              value={selectedTribe}
              onChange={(e) => setSelectedTribe(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Tribes</option>
              {tribes.map(tribe => (
                <option key={tribe} value={tribe}>{tribe}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSeason('all');
              setSelectedTribe('all');
            }}
            style={styles.clearButton}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {isLoading ? (
        <p style={styles.loading}>Loading players...</p>
      ) : filteredPlayers.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No players found matching your search.</p>
        </div>
      ) : (
        <div style={styles.playersGrid}>
          {filteredPlayers.map(player => (
            <div key={player.id} style={styles.playerCard}>
              <div style={styles.playerHeader}>
                <h3 style={styles.playerName}>{player.name}</h3>
                <span style={styles.seasonBadge}>S{player.season}</span>
              </div>
              <div style={styles.playerInfo}>
                <p style={styles.infoItem}>
                  <strong>Tribe:</strong> {player.tribe}
                </p>
                <p style={styles.infoItem}>
                  <strong>Age:</strong> {player.age}
                </p>
                <p style={styles.infoItem}>
                  <strong>Placement:</strong> {getPlacementLabel(player.placement)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px'
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    color: 'white',
    fontSize: '36px',
    marginBottom: '10px'
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '18px'
  },
  filtersCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    maxWidth: '1200px',
    margin: '0 auto 30px'
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    marginBottom: '15px'
  },
  filterRow: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-end'
  },
  filterGroup: {
    flex: 1
  },
  filterLabel: {
    display: 'block',
    marginBottom: '5px',
    color: '#333',
    fontWeight: '500',
    fontSize: '14px'
  },
  filterSelect: {
    width: '100%',
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  clearButton: {
    padding: '10px 20px',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  loading: {
    textAlign: 'center',
    color: 'white',
    fontSize: '18px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyText: {
    color: 'white',
    fontSize: '20px'
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  playerCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  playerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  playerName: {
    margin: 0,
    color: '#333',
    fontSize: '18px'
  },
  seasonBadge: {
    padding: '4px 10px',
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  infoItem: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  }
};

export default PlayerDatabase;