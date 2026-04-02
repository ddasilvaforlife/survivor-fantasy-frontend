import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

function BrowseLeagues({ onBack }) {
  const [leagues, setLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [teamName, setTeamName] = useState('');
  const [joiningLeagueId, setJoiningLeagueId] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{"id": 1}');

  useEffect(() => {
    fetchAllLeagues();
  }, []);

  const fetchAllLeagues = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/leagues`);
      const data = await response.json();
      if (response.ok) {
        setLeagues(data.leagues);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const joinLeague = async (leagueId) => {
    if (!teamName) {
      setMessage('❌ Please enter a team name');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/leagues/${leagueId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          team_name: teamName
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setJoiningLeagueId(null);
        setTeamName('');
        fetchAllLeagues();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>← Back to Dashboard</button>

      <div style={styles.header}>
        <h1 style={styles.title}>🏝️ Browse Leagues</h1>
        <p style={styles.subtitle}>Find a league to join</p>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          ...(message.includes('✅') ? styles.messageSuccess : styles.messageError)
        }}>
          {message}
        </div>
      )}

      {isLoading ? (
        <p style={styles.loading}>Loading leagues...</p>
      ) : leagues.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No leagues available to join.</p>
        </div>
      ) : (
        <div style={styles.leagueGrid}>
          {leagues.map(league => {
            const isFull = league.team_count >= league.max_teams;
            const isCommissioner = league.commissioner_id === user.id;
            const isJoining = joiningLeagueId === league.id;

            return (
              <div key={league.id} style={styles.leagueCard}>
                <div style={styles.leagueHeader}>
                  <h3 style={styles.leagueName}>{league.name}</h3>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: isFull ? '#fed7d7' : '#c6f6d5'
                  }}>
                    {isFull ? 'Full' : 'Open'}
                  </span>
                </div>

                <div style={styles.leagueInfo}>
                  <p style={styles.detail}><strong>Season:</strong> {league.season}</p>
                  <p style={styles.detail}><strong>Teams:</strong> {league.team_count}/{league.max_teams}</p>
                  <p style={styles.detail}><strong>Commissioner:</strong> {league.commissioner_username}</p>
                </div>

                {isCommissioner ? (
                  <p style={styles.ownLeague}>You own this league</p>
                ) : isFull ? (
                  <p style={styles.fullText}>This league is full</p>
                ) : isJoining ? (
                  <div style={styles.joinForm}>
                    <input
                      type="text"
                      placeholder="Enter your team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      style={styles.joinInput}
                    />
                    <div style={styles.joinActions}>
                      <button
                        onClick={() => joinLeague(league.id)}
                        style={styles.confirmButton}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setJoiningLeagueId(null);
                          setTeamName('');
                        }}
                        style={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setJoiningLeagueId(league.id)}
                    style={styles.joinButton}
                  >
                    + Join League
                  </button>
                )}
              </div>
            );
          })}
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
  leagueGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  leagueCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  leagueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  leagueName: {
    margin: 0,
    color: '#333',
    fontSize: '18px'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  leagueInfo: {
    marginBottom: '15px'
  },
  detail: {
    margin: '5px 0',
    color: '#666',
    fontSize: '14px'
  },
  joinButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  joinForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  joinInput: {
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px'
  },
  joinActions: {
    display: 'flex',
    gap: '10px'
  },
  confirmButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  ownLeague: {
    textAlign: 'center',
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  fullText: {
    textAlign: 'center',
    color: '#e53e3e',
    fontWeight: 'bold',
    fontSize: '14px'
  }
};

export default BrowseLeagues;