import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

function DraftRoom({ leagueId, onBack }) {
  const [draftData, setDraftData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{"id": 1}');

  useEffect(() => {
    fetchDraftState();
  }, [leagueId]);

  const fetchDraftState = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/draft/${leagueId}`);
      const data = await response.json();
      if (response.ok) {
        setDraftData(data);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const makePick = async (playerId) => {
    if (!draftData?.draftState?.currentTeam) return;

    const currentTeam = draftData.draftState.currentTeam;
    const isCommissioner = draftData.league.commissioner_id === user.id;

    if (!isCommissioner) {
      setMessage('❌ Only the commissioner can make picks');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/draft/${leagueId}/pick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: currentTeam.id,
          player_id: playerId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        fetchDraftState();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const resetDraft = async () => {
    if (!window.confirm('Are you sure you want to reset the draft? All picks will be lost.')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/draft/${leagueId}/reset`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        fetchDraftState();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const filteredPlayers = draftData?.availablePlayers?.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isCommissioner = draftData?.league?.commissioner_id === user.id;

  if (isLoading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading draft room...</p>
      </div>
    );
  }

  if (!draftData) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Error loading draft</p>
        <button onClick={onBack} style={styles.backButton}>Back</button>
      </div>
    );
  }

  const { league, teams, picks, draftState } = draftData;

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>← Back to League</button>

      <div style={styles.header}>
        <h1 style={styles.title}>🏝️ Draft Room</h1>
        <h2 style={styles.leagueName}>{league.name}</h2>
      </div>

      {/* Draft Status Bar */}
      <div style={styles.statusBar}>
        {draftState.isDraftComplete ? (
          <div style={styles.completeStatus}>
            🎉 Draft Complete!
          </div>
        ) : (
          <div style={styles.currentPickInfo}>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Round</span>
              <span style={styles.statusValue}>{draftState.currentRound}</span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>Pick</span>
              <span style={styles.statusValue}>#{draftState.totalPicks + 1}</span>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>On The Clock</span>
              <span style={styles.statusValue}>
                {draftState.currentTeam?.team_name}
              </span>
            </div>
          </div>
        )}

        {isCommissioner && picks.length > 0 && (
          <button onClick={resetDraft} style={styles.resetButton}>
            🔄 Reset Draft
          </button>
        )}
      </div>

      {message && (
        <div style={{
          ...styles.message,
          ...(message.includes('✅') ? styles.messageSuccess : styles.messageError)
        }}>
          {message}
        </div>
      )}

      <div style={styles.draftLayout}>

        {/* Available Players */}
        <div style={styles.playersSection}>
          <h3 style={styles.sectionTitle}>
            Available Players ({filteredPlayers.length})
          </h3>
          <input
            type="text"
            placeholder="🔍 Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.playersList}>
            {filteredPlayers.map(player => (
              <div key={player.id} style={styles.playerRow}>
                <div style={styles.playerInfo}>
                  <span style={styles.playerName}>{player.name}</span>
                  <span style={styles.playerDetails}>
                    S{player.season} • {player.tribe}
                  </span>
                </div>
                {!draftState.isDraftComplete && isCommissioner && (
                  <button
                    onClick={() => makePick(player.id)}
                    style={styles.pickButton}
                  >
                    Draft
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Team Rosters */}
        <div style={styles.rostersSection}>
          <h3 style={styles.sectionTitle}>Team Rosters</h3>
          {teams.map(team => {
            const teamPicks = picks.filter(p => p.team_id === team.id);
            const isOnClock = draftState.currentTeam?.id === team.id;

            return (
              <div
                key={team.id}
                style={{
                  ...styles.teamRoster,
                  ...(isOnClock ? styles.teamOnClock : {})
                }}
              >
                <div style={styles.teamRosterHeader}>
                  <strong>{team.team_name}</strong>
                  {isOnClock && !draftState.isDraftComplete && (
                    <span style={styles.onClockBadge}>⏰ On The Clock</span>
                  )}
                  <span style={styles.pickCount}>{teamPicks.length} picks</span>
                </div>
                {teamPicks.length === 0 ? (
                  <p style={styles.noPicksText}>No picks yet</p>
                ) : (
                  <div style={styles.rosterList}>
                    {teamPicks.map((pick, index) => (
                      <div key={pick.id} style={styles.rosterItem}>
                        <span style={styles.pickNumber}>#{pick.pick_number}</span>
                        <span style={styles.pickedPlayerName}>{pick.player_name}</span>
                        <span style={styles.pickedPlayerTribe}>{pick.tribe}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Pick History */}
      {picks.length > 0 && (
        <div style={styles.historyCard}>
          <h3 style={styles.sectionTitle}>📋 Pick History</h3>
          <div style={styles.historyList}>
            {picks.map(pick => (
              <div key={pick.id} style={styles.historyItem}>
                <span style={styles.historyPickNum}>#{pick.pick_number}</span>
                <span style={styles.historyTeam}>{pick.team_name}</span>
                <span style={styles.historyPlayer}>{pick.player_name}</span>
              </div>
            ))}
          </div>
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
    marginBottom: '20px'
  },
  title: {
    color: 'white',
    fontSize: '36px',
    margin: 0
  },
  leagueName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '20px',
    marginTop: '5px'
  },
  statusBar: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    maxWidth: '1200px',
    margin: '0 auto 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  currentPickInfo: {
    display: 'flex',
    gap: '30px'
  },
  statusItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statusLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  statusValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#667eea'
  },
  completeStatus: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#48bb78'
  },
  resetButton: {
    padding: '8px 16px',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  message: {
    padding: '15px',
    borderRadius: '8px',
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto 20px'
  },
  messageSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  messageError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  },
  draftLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto 20px'
  },
  playersSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  rostersSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '15px',
    color: '#333',
    fontSize: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginBottom: '15px'
  },
  playersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '500px',
    overflowY: 'auto'
  },
  playerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px'
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  playerName: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px'
  },
  playerDetails: {
    fontSize: '12px',
    color: '#666'
  },
  pickButton: {
    padding: '6px 14px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  teamRoster: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  teamOnClock: {
    border: '3px solid #48bb78',
    boxShadow: '0 0 15px rgba(72, 187, 120, 0.4)'
  },
  teamRosterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  onClockBadge: {
    backgroundColor: '#48bb78',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  pickCount: {
    fontSize: '12px',
    color: '#666'
  },
  noPicksText: {
    color: '#999',
    fontSize: '13px',
    textAlign: 'center',
    margin: '10px 0'
  },
  rosterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  rosterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px',
    backgroundColor: '#f7fafc',
    borderRadius: '5px'
  },
  pickNumber: {
    fontSize: '11px',
    color: '#999',
    minWidth: '25px'
  },
  pickedPlayerName: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  pickedPlayerTribe: {
    fontSize: '11px',
    color: '#667eea'
  },
  historyCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  historyItem: {
    display: 'flex',
    gap: '15px',
    padding: '8px',
    backgroundColor: '#f7fafc',
    borderRadius: '5px',
    alignItems: 'center'
  },
  historyPickNum: {
    fontWeight: 'bold',
    color: '#667eea',
    minWidth: '35px'
  },
  historyTeam: {
    color: '#333',
    fontWeight: 'bold',
    flex: 1
  },
  historyPlayer: {
    color: '#666',
    flex: 1
  },
  loading: {
    color: 'white',
    fontSize: '18px',
    textAlign: 'center',
    marginTop: '100px'
  }
};

export default DraftRoom;