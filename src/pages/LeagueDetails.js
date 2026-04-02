import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

function LeagueDetails({ leagueId, onBack }) {
  const [league, setLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [scoringRules, setScoringRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [teamName, setTeamName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{"id": 1}');

  useEffect(() => {
    fetchLeagueDetails();
  }, [leagueId]);

  const fetchLeagueDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/leagues/${leagueId}`);
      const data = await response.json();

      if (response.ok) {
        setLeague(data.league);
        setTeams(data.teams);
        setScoringRules(data.scoring_rules);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const joinLeague = async (e) => {
    e.preventDefault();
    setIsJoining(true);
    setMessage('');

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
        setTeamName('');
        setShowJoinForm(false);
        fetchLeagueDetails();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  // Check if user already has a team in this league
  const userAlreadyJoined = teams.some(team => team.user_id === user.id);
  const isCommissioner = league && league.commissioner_id === user.id;
  const isFull = league && teams.length >= league.max_teams;

  if (isLoading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading league details...</p>
      </div>
    );
  }

  if (!league) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>League not found</p>
        <button onClick={onBack} style={styles.backButton}>Back to Dashboard</button>
      </div>
    );
  }

  const actionRules = scoringRules.filter(rule => !rule.action_type.startsWith('placement_'));
  const placementRules = scoringRules.filter(rule => rule.action_type.startsWith('placement_'));

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>← Back to Dashboard</button>

      <div style={styles.header}>
        <h1 style={styles.title}>{league.name}</h1>
        <span style={styles.statusBadge}>{league.status}</span>
      </div>

      <div style={styles.infoCard}>
        <h3 style={styles.sectionTitle}>League Information</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <strong>Season:</strong> {league.season}
          </div>
          <div style={styles.infoItem}>
            <strong>Commissioner:</strong> {league.commissioner_username}
          </div>
          <div style={styles.infoItem}>
            <strong>Max Teams:</strong> {league.max_teams}
          </div>
          <div style={styles.infoItem}>
            <strong>Current Teams:</strong> {league.team_count}
          </div>
          <div style={styles.infoItem}>
            <strong>Created:</strong> {new Date(league.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          ...(message.includes('✅') ? styles.messageSuccess : styles.messageError)
        }}>
          {message}
        </div>
      )}

      {/* Join League Section */}
      {!isCommissioner && !userAlreadyJoined && !isFull && (
        <div style={styles.joinCard}>
          {!showJoinForm ? (
            <button
              onClick={() => setShowJoinForm(true)}
              style={styles.joinButton}
            >
              + Join This League
            </button>
          ) : (
            <div>
              <h3 style={styles.sectionTitle}>Join League</h3>
              <form onSubmit={joinLeague} style={styles.joinForm}>
                <input
                  type="text"
                  placeholder="Enter your team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  style={styles.joinInput}
                  required
                />
                <div style={styles.joinActions}>
                  <button
                    type="submit"
                    style={styles.joinSubmitButton}
                    disabled={isJoining}
                  >
                    {isJoining ? 'Joining...' : 'Confirm Join'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJoinForm(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {userAlreadyJoined && (
        <div style={styles.joinedBadge}>
          ✅ You are in this league!
        </div>
      )}

      {isFull && !userAlreadyJoined && (
        <div style={styles.fullBadge}>
          🚫 This league is full
        </div>
      )}

      {/* Teams Section */}
      <div style={styles.teamsCard}>
        <h3 style={styles.sectionTitle}>🏆 Teams ({teams.length}/{league.max_teams})</h3>
        {teams.length === 0 ? (
          <p style={styles.emptyText}>No teams have joined yet.</p>
        ) : (
          <div style={styles.teamsList}>
            {teams.map((team, index) => (
              <div key={team.id} style={styles.teamItem}>
                <span style={styles.teamRank}>#{index + 1}</span>
                <div style={styles.teamInfo}>
                  <strong>{team.team_name}</strong>
                  <span style={styles.teamUser}>{team.username}</span>
                </div>
                <span style={styles.teamPoints}>{team.total_points} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scoring Rules */}
      <div style={styles.rulesCard}>
        <h3 style={styles.sectionTitle}>📊 Scoring Rules</h3>
        
        <h4 style={styles.subsectionTitle}>Action-Based Scoring:</h4>
        <div style={styles.rulesGrid}>
          {actionRules
            .sort((a, b) => parseFloat(b.points) - parseFloat(a.points))
            .map(rule => (
              <div key={rule.id} style={styles.ruleItem}>
                <span style={styles.ruleName}>{rule.description || rule.action_type}</span>
                <span style={styles.rulePoints}>
                  {parseFloat(rule.points) >= 0 ? '+' : ''}{parseFloat(rule.points)} pts
                </span>
              </div>
            ))}
        </div>

        <h4 style={styles.subsectionTitle}>Placement Bonuses:</h4>
        <div style={styles.placementGrid}>
          {placementRules
            .sort((a, b) => {
              const aNum = parseInt(a.action_type.replace('placement_', ''));
              const bNum = parseInt(b.action_type.replace('placement_', ''));
              return aNum - bNum;
            })
            .map(rule => {
              const placement = rule.action_type.replace('placement_', '');
              return (
                <div key={rule.id} style={styles.placementItem}>
                  <span style={styles.placementRank}>{placement}</span>
                  <span style={styles.placementPoints}>
                    {parseFloat(rule.points) >= 0 ? '+' : ''}{parseFloat(rule.points)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
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
  loading: {
    color: 'white',
    fontSize: '18px',
    textAlign: 'center',
    marginTop: '100px'
  },
  error: {
    color: 'white',
    fontSize: '18px',
    textAlign: 'center',
    marginTop: '100px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  title: {
    color: 'white',
    fontSize: '36px',
    margin: 0
  },
  statusBadge: {
    padding: '8px 16px',
    backgroundColor: '#ffd93d',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  infoCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    maxWidth: '1200px',
    margin: '0 auto 20px'
  },
  joinCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    maxWidth: '1200px',
    margin: '0 auto 20px',
    textAlign: 'center'
  },
  joinButton: {
    padding: '12px 30px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  joinForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  joinInput: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px'
  },
  joinActions: {
    display: 'flex',
    gap: '10px'
  },
  joinSubmitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  joinedBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    maxWidth: '1200px',
    margin: '0 auto 20px'
  },
  fullBadge: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    maxWidth: '1200px',
    margin: '0 auto 20px'
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
  rulesCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    maxWidth: '1200px',
    margin: '0 auto 20px'
  },
  teamsCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    maxWidth: '1200px',
    margin: '0 auto 20px'
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
    fontSize: '24px'
  },
  subsectionTitle: {
    marginTop: '20px',
    marginBottom: '15px',
    color: '#666',
    fontSize: '18px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  infoItem: {
    padding: '10px',
    backgroundColor: '#f7fafc',
    borderRadius: '5px',
    color: '#333'
  },
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '10px',
    marginBottom: '20px'
  },
  ruleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#f7fafc',
    borderRadius: '5px',
    alignItems: 'center'
  },
  ruleName: {
    color: '#333',
    fontSize: '14px',
    flex: 1
  },
  rulePoints: {
    fontWeight: 'bold',
    color: '#667eea',
    fontSize: '16px',
    marginLeft: '10px'
  },
  placementGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
    gap: '10px'
  },
  placementItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f7fafc',
    borderRadius: '5px'
  },
  placementRank: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px'
  },
  placementPoints: {
    fontWeight: 'bold',
    color: '#667eea',
    fontSize: '14px'
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    fontSize: '16px'
  },
  teamsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  teamItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    gap: '15px'
  },
  teamRank: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#667eea',
    minWidth: '40px'
  },
  teamInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  teamUser: {
    fontSize: '14px',
    color: '#666'
  },
  teamPoints: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#48bb78'
  }
};

export default LeagueDetails;