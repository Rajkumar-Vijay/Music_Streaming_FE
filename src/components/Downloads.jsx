import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { PlayerContext } from './context/PlayerContext';
import axios from 'axios';
import { FaPlay, FaPause, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Downloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { playTrack, track, isPlaying, togglePlay, API_BASE_URL } = useContext(PlayerContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchDownloads();
  }, [user, navigate]);

  const fetchDownloads = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/download/user`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setDownloads(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching downloads:', error);
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

  const handleDownload = async (song) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/download/song/${song._id}`, {
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
        <h1 className="text-3xl font-bold mb-4">Downloads</h1>
        
        {downloads.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-xl mb-4">You haven't downloaded any songs yet</p>
            <p className="text-gray-400">Download songs by clicking the download icon while playing a song</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Album</th>
                  <th className="px-6 py-3 text-left">Downloaded</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((download, index) => {
                  const song = download.song;
                  const isCurrentSong = track && track._id === song._id;
                  const isCurrentlyPlaying = isCurrentSong && isPlaying;
                  
                  return (
                    <tr 
                      key={download._id} 
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
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(download.downloadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDownload(song)}
                          className="focus:outline-none text-gray-400 hover:text-white"
                        >
                          <FaDownload />
                        </button>
                      </td>
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

export default Downloads;