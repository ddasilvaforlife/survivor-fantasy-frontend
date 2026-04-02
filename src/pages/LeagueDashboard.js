import React, { useState, useEffect } from 'react';
import LeagueDetails from './LeagueDetails';
import PlayerDatabase from './PlayerDatabase';
import BrowseLeagues from './BrowseLeagues';
import API_BASE_URL from '../config';

function LeagueDashboard() {
  const [leagues, setLeagues] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [viewingLeagueId, setViewingLeagueId] = useState(null);
  const [viewingPlayers, setViewingPlayers] = useState(false);
  const [browsingLeagues, setBrowsingLeagues] = useState(false);
  const [newLeague, setNewLeague] = useState({
    name: '',
    season: 47,
    max_teams: 9,
    cast_size: 18
  });

  const user = JSON.parse(localStorage.getItem('user') || '{"id": 1}');

  useEffect(() => {
    fetchLeagues();
  }, []);

  if (viewingLeagueId) {
    return <LeagueDetails leagueId={viewingLeagueId} onBack={() => setViewingLeagueId(null)} />;
  }

  if (viewingPlayers) {
    return <PlayerDatabase onBack={() => setViewingPlayers(false)} />;
  }

  if (browsingLeagues) {
    return <BrowseLeagues onBack={() => setBrowsingLeagues(false)} />;
  }

  const fetchLeagues = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/leagues/user/${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setLeagues(data.commissioner_leagues || []);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error fetching leagues: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createLeague = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/leagues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLeague,
          commissioner_id: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setShowCreateForm(false);
        setNewLeague({ name: '', season: 47, max_teams: 9, cast_size: 18 });
        fetchLeagues();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const deleteLeague = async (leagueId, leagueName) => {
    if (!window.confirm(`Are you sure you want to delete "${leagueName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/leagues/${leagueId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        fetchLeagues();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏝️ My Survivor Leagues</h1>
        <p style={styles.subtitle}>Welcome back, {user.username || 'Player'}!</p>
      </div>

      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        style={styles.createButton}
      >
        {showCreateForm ? '✖ Cancel' : '+ Create New League'}
      </button>

      <button
        onClick={() => setViewingPlayers(true)}
        style={styles.playersButton}
      >
        🔍 Player Database
      </button>

      <button
        onClick={() => setBrowsingLeagues(true)}
        style={styles.browseButton}
      >
        🌐 Browse Leagues
      </button>

      {showCreateForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Create New League</h3>
          <form onSubmit={createLeague} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>League Name</label>
              <input
                type="text"
                placeholder="e.g., David's Epic League"
                value={newLeague.name}
                onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Season</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newLeague.season}
                  onChange={(e) => setNewLeague({ ...newLeague, season: parseInt(e.target.value) })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Max Teams</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={newLeague.max_teams}
                  onChange={(e) => setNewLeague({ ...newLeague, max_teams: parseInt(e.target.value) })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Cast Size</label>
                <select
                  value={newLeague.cast_size}
                  onChange={(e) => setNewLeague({ ...newLeague, cast_size: parseInt(e.target.value) })}
                  style={styles.input}
                  required
                >
                  <option value={18}>18 players</option>
                  <option value={20}>20 players</option>
                  <option value={24}>24 players</option>
                </select>
              </div>
            </div>

            <button type="submit" style={styles.submitButton}>
              Create League
            </button>
          </form>
        </div>
      )}

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
          <p style={styles.emptyText}>No leagues yet!</p>
          <p style={styles.emptySubtext}>Create your first league to get started.</p>
        </div>
      ) : (
        <div style={styles.leagueGrid}>
          {leagues.map(league => (
            <div key={league.id} style={styles.leagueCard}>
              <div style={styles.leagueHeader}>
                <h3 style={styles.leagueName}>{league.name}</h3>
                <span style={styles.statusBadge}>{league.status}</span>
              </div>

              <div style={styles.leagueDetails}>
                <p style={styles.detail}>
                  <strong>Season:</strong> {league.season}
                </p>
                <p style={styles.detail}>
                  <strong>Teams:</strong> {league.team_count}/{league.max_teams}
                </p>
                <p style={styles.detail}>
                  <strong>Created:</strong> {new Date(league.created_at).toLocaleDateString()}
                </p>
              </div>

              <div style={styles.cardActions}>
                <button
                  onClick={() => setViewingLeagueId(league.id)}
                  style={styles.viewButton}
                >
                  View Details
                </button>
                <button
                  onClick={() => deleteLeague(league.id, league.name)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
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
  createButton: {
    display: 'block',
    margin: '0 auto 15px',
    padding: '12px 24px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  playersButton: {
    display: 'block',
    margin: '0 auto 15px',
    padding: '12px 24px',
    backgroundColor: '#764ba2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  browseButton: {
    display: 'block',
    margin: '0 auto 30px',
    padding: '12px 24px',
    backgroundColor: '#ed8936',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  formCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    maxWidth: '600px',
    margin: '0 auto 30px'
  },
  formTitle: {
    marginBottom: '20px',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  row: {
    display: 'flex',
    gap: '15px'
  },
  inputGroup: {
    marginBottom: '20px',
    flex: 1
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#333',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  message: {
    padding: '15px',
    borderRadius: '8px',
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '600px',
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
    fontSize: '24px',
    marginBottom: '10px'
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '16px'
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
    fontSize: '20px'
  },
  statusBadge: {
    padding: '4px 12px',
    backgroundColor: '#ffd93d',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  leagueDetails: {
    marginBottom: '20px'
  },
  detail: {
    margin: '8px 0',
    color: '#666',
    fontSize: '14px'
  },
  cardActions: {
    display: 'flex',
    gap: '10px'
  },
  viewButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  deleteButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default LeagueDashboard;