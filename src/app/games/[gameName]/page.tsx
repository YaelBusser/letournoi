'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Tournament {
  id: string
  name: string
  description: string | null
  game: string | null
  format: string
  visibility: string
  category: string
  posterUrl: string | null
  isTeamBased: boolean
  maxParticipants: number | null
  kind: string
  startDate: string | null
  endDate: string | null
  status: string
  registrationDeadline: string | null
  organizerId: string
  createdAt: string
  _count: {
    registrations: number
  }
}

interface GameDetails {
  id: number
  name: string
  background_image: string | null
  released: string | null
  rating: number
  rating_top: number
  genres: Array<{ id: number; name: string }>
  platforms: Array<{ platform: { id: number; name: string } }>
  description_raw: string | null
  metacritic: number | null
  playtime: number | null
  esrb_rating: { id: number; name: string } | null
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const [gameName, setGameName] = useState('')
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [gameLoading, setGameLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    if (params.gameName) {
      const decodedGameName = decodeURIComponent(params.gameName as string)
      setGameName(decodedGameName)
    }
  }, [params.gameName])

  // Charger les détails du jeu
  useEffect(() => {
    const loadGameDetails = async () => {
      if (!gameName) return
      
      setGameLoading(true)
      try {
        const res = await fetch(`/api/games/details?name=${encodeURIComponent(gameName)}`)
        if (res.ok) {
          const data = await res.json()
          setGameDetails(data)
        } else {
          console.error('Erreur lors du chargement des détails du jeu')
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails du jeu:', error)
      } finally {
        setGameLoading(false)
      }
    }
    
    loadGameDetails()
  }, [gameName])

  useEffect(() => {
    const loadTournaments = async () => {
      if (!gameName) return
      
      setLoading(true)
      try {
        const params = new URLSearchParams({ 
          game: gameName
        })
        
        const res = await fetch(`/api/tournaments?${params.toString()}`)
        const data = await res.json()
        setTournaments(data.tournaments || [])
      } catch (error) {
        console.error('Erreur lors du chargement des tournois:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTournaments()
  }, [gameName])

  const getFilteredTournaments = () => {
    const now = new Date()
    return tournaments.filter(tournament => {
      const startDate = tournament.startDate ? new Date(tournament.startDate) : null
      
      switch (activeTab) {
        case 'upcoming':
          return !startDate || startDate > now
        case 'in_progress':
          return startDate && startDate <= now && tournament.status === 'IN_PROGRESS'
        case 'completed':
          return tournament.status === 'COMPLETED'
        default:
          return true
      }
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'REG_OPEN':
        return 'Inscriptions ouvertes'
      case 'IN_PROGRESS':
        return 'En attente'
      case 'COMPLETED':
        return 'Terminé'
      default:
        return 'Brouillon'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REG_OPEN':
        return '#10b981'
      case 'IN_PROGRESS':
        return '#f59e0b'
      case 'COMPLETED':
        return '#6b7280'
      default:
        return '#374151'
    }
  }

  const filteredTournaments = getFilteredTournaments()

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      {/* Header avec bannière du jeu */}
      <div style={{
        backgroundImage: gameDetails?.background_image 
          ? `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%), url(${gameDetails.background_image})`
          : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        padding: '4rem 0',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Image du jeu */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '16px',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              {gameLoading ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#ffffff'
                }}>
                  {gameName.charAt(0).toUpperCase()}
                </div>
              ) : gameDetails?.background_image ? (
                <img 
                  src={gameDetails.background_image} 
                  alt={gameName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#ffffff'
                }}>
                  {gameName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Informations du jeu */}
            <div style={{ flex: 1 }}>
              <h1 style={{
                color: '#ffffff',
                fontSize: '3rem',
                fontWeight: '700',
                margin: 0,
                marginBottom: '1rem',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}>
                {gameName}
              </h1>
              
              {/* Métadonnées du jeu */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem',
                alignItems: 'center'
              }}>
                {gameDetails?.released && (
                  <span style={{
                    color: '#a78bfa',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    Sorti le {new Date(gameDetails.released).toLocaleDateString('fr-FR')}
                  </span>
                )}
                
                
                {gameDetails?.metacritic && (
                  <span style={{
                    background: gameDetails.metacritic >= 75 ? '#10b981' : 
                               gameDetails.metacritic >= 50 ? '#f59e0b' : '#ef4444',
                    color: '#ffffff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Metacritic: {gameDetails.metacritic}
                  </span>
                )}
              </div>
              
              {/* Genres */}
              {gameDetails?.genres && gameDetails.genres.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {gameDetails.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre.id}
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        color: '#ffffff',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
              
              <p style={{
                color: '#e5e7eb',
                fontSize: '1.125rem',
                margin: 0,
                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
              }}>
                {filteredTournaments.length} tournoi{filteredTournaments.length > 1 ? 's' : ''} disponible{filteredTournaments.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Onglets de filtrage */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid #374151',
            marginBottom: '2rem'
          }}>
            {[
              { id: 'upcoming', label: 'Prochainement' },
              { id: 'in_progress', label: 'En cours' },
              { id: 'completed', label: 'Terminés' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? '#3b82f6' : '#9ca3af',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#ffffff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#9ca3af'
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des tournois */}
        {loading ? (
          <div style={{
            background: '#1f2937',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #374151',
            textAlign: 'center'
          }}>
            <div style={{ color: '#9ca3af' }}>Chargement des tournois...</div>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div style={{
            background: '#1f2937',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #374151',
            textAlign: 'center'
          }}>
            <div style={{ color: '#9ca3af' }}>
              Aucun tournoi trouvé pour {gameName}.
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {filteredTournaments.map((tournament) => (
              <div
                key={tournament.id}
                style={{
                  background: '#1f2937',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#374151'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onClick={() => router.push(`/tournaments/${tournament.id}`)}
              >
                {/* Icône du tournoi */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  🏆
                </div>
                
                {/* Contenu principal */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{
                      margin: 0,
                      color: '#ffffff',
                      fontSize: '1.25rem',
                      fontWeight: '600'
                    }}>
                      {tournament.name}
                    </h3>
                    
                    {/* Drapeau */}
                    <span style={{ fontSize: '0.875rem' }}>🇫🇷</span>
                  </div>
                  
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    {tournament.startDate 
                      ? new Date(tournament.startDate).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })
                      : new Date(tournament.createdAt).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })
                    }
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      background: getStatusColor(tournament.status),
                      color: '#ffffff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {getStatusText(tournament.status)}
                    </span>
                    
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      {tournament._count.registrations} {tournament.isTeamBased ? 'Équipes' : 'Joueurs'}
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem' }}>🎮</span>
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                        PC, PlayStation 4, PlayStation 5, Xbox One, Xbox Series
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Bouton d'action */}
                <Link
                  href={`/tournaments/${tournament.id}`}
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563eb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#3b82f6'
                  }}
                >
                  Voir le tournoi
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
