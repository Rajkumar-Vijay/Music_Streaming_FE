import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { PlayerContext } from './context/PlayerContext';
import axios from 'axios';
import { FaPlay, FaPause } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LikedSongs = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { playTrack, track, isPlaying, togglePlay, API_BASE_URL } = useContext(PlayerContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchLikedSongs();
  }, [user, navigate]);

  const fetchLikedSongs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/like/user/songs`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setLikedSongs(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching liked songs:', error);
      setLoading(false);
    }
  };

  const handlePlayPause = (song) => {
    if (track && track._id === song._id) {
      togglePlay();
    } else {
      playTrack(song);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Liked Songs</h1>
        
        {likedSongs.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-xl mb-4">You haven't liked any songs yet</p>
            <p className="text-gray-400">Like songs by clicking the heart icon while playing a song</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Album</th>
                  <th className="px-6 py-3 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                {likedSongs.map((song, index) => {
                  const isCurrentSong = track && track._id === song._id;
                  const isCurrentlyPlaying = isCurrentSong && isPlaying;
                  
                  return (
                    <tr 
                      key={song._id} 
                      className={`border-b border-gray-700 hover:bg-gray-700 ${isCurrentSong ? 'bg-gray-700' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handlePlayPause(song)}
                          className="focus:outline-none"
                        >
                          {isCurrentlyPlaying ? (
                            <FaPause className="text-purple-500" />
                          ) : (
                            <FaPlay className={isCurrentSong ? "text-purple-500" : ""} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={song.image} 
                            alt={song.name} 
                            className="h-10 w-10 object-cover rounded mr-3" 
                          />
                          <div>
                            <p className={`font-medium ${isCurrentSong ? 'text-purple-500' : ''}`}>{song.name}</p>
                            <p className="text-gray-400 text-sm">{song.artist || 'Unknown Artist'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{song.album || 'Unknown Album'}</td>
                      <td className="px-6 py-4 text-gray-400">{song.duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;