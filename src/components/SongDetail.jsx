import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { PlayerContext } from './context/PlayerContext';
import axios from 'axios';
import Comments from './Comments';
import { FaHeart, FaRegHeart, FaShare, FaDownload, FaPlay, FaPause, FaPlus } from 'react-icons/fa';

const SongDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { playTrack, isPlaying, track, togglePlay, playlists, API_BASE_URL } = useContext(PlayerContext);
  
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  useEffect(() => {
    fetchSong();
    if (user) {
      checkIfLiked();
    }
  }, [id, user]);

  const fetchSong = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/song/${id}`);
      setSong(response.data);
    } catch (error) {
      console.error('Error fetching song:', error);
      setError('Failed to load song');
      if (error.response?.status === 404) {
        navigate('/not-found');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/like/check/song/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setLiked(response.data.liked);
    } catch (error) {
      console.error('Error checking if song is liked:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (liked) {
        await axios.delete(`${API_BASE_URL}/api/like/song/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/like/song/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
      }
      setLiked(!liked);
      // Update likes count in the song object
      setSong({
        ...song,
        likesCount: liked ? song.likesCount - 1 : song.likesCount + 1
      });
    } catch (error) {
      console.error('Error liking/unliking song:', error);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying && track && track._id === song._id) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: song.name,
        text: `Check out this song: ${song.name} by ${song.artist || 'Unknown Artist'}`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying link:', err));
    }
  };

  const handleDownload = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/download/song/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = `${song.name}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading song:', error);
      alert('Failed to download song');
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/playlist/${playlistId}/songs/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setShowAddToPlaylist(false);
      alert('Song added to playlist successfully');
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      if (error.response?.status === 400 && error.response?.data?.message === 'Song is already in the playlist') {
        alert('Song is already in this playlist');
      } else {
        alert('Failed to add song to playlist');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!song) return null;

  const isCurrentlyPlaying = isPlaying && track && track._id === song._id;

  return (
    <div className="text-white">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <img
            src={song.image}
            alt={song.name}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
        
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-2">{song.name}</h1>
          
          <p className="text-xl text-gray-300 mb-2">{song.artist || 'Unknown Artist'}</p>
          
          <p className="text-gray-400 mb-4">
            Album: {song.album} • {song.genre || 'Other'} • {song.releaseYear || 'Unknown Year'}
          </p>
          
          <p className="text-gray-400 mb-6">{song.desc}</p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full transition"
            >
              {isCurrentlyPlaying ? <FaPause /> : <FaPlay />}
              {isCurrentlyPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={handleLike}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition"
            >
              {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition"
            >
              <FaShare />
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition"
            >
              <FaDownload />
            </button>
            
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowAddToPlaylist(!showAddToPlaylist)}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition"
                >
                  <FaPlus />
                </button>
                
                {showAddToPlaylist && (
                  <div className="absolute top-12 left-0 bg-gray-800 rounded-lg shadow-lg p-4 z-10 w-64">
                    <h3 className="font-bold mb-2">Add to Playlist</h3>
                    
                    {playlists.length === 0 ? (
                      <p className="text-gray-400 text-sm">You don't have any playlists yet</p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {playlists.map(playlist => (
                          <div
                            key={playlist._id}
                            className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer"
                            onClick={() => handleAddToPlaylist(playlist._id)}
                          >
                            <img
                              src={playlist.coverImage}
                              alt={playlist.name}
                              className="h-8 w-8 object-cover rounded mr-2"
                            />
                            <p className="truncate">{playlist.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-400 mt-4">
            <p>{song.likesCount || 0} likes</p>
            <span className="mx-2">•</span>
            <p>{song.commentsCount || 0} comments</p>
            <span className="mx-2">•</span>
            <p>{song.downloadsCount || 0} downloads</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Comments itemId={id} itemType="song" />
      </div>
    </div>
  );
};

export default SongDetail;