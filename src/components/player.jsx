import { useContext, useState, useRef, useEffect } from 'react';
import { PlayerContext } from './context/PlayerContext';
import { AuthContext } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaRedo, FaVolumeUp, FaVolumeMute, FaHeart, FaRegHeart, FaDownload, FaShareAlt, FaList } from 'react-icons/fa';

const Player = () => {
  const {
    track,
    isPlaying,
    volume,
    repeat,
    shuffle,
    duration,
    currentTime,
    audioRef,
    playTrack,
    togglePlay,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    seekTo,
    changeVolume,
    queue,
    API_BASE_URL
  } = useContext(PlayerContext);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [liked, setLiked] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    if (track && user) {
      checkIfLiked();
    }
  }, [track, user]);

  const checkIfLiked = async () => {
    if (!track || !user) return;
    
    try {
      const response = await axios.get(`https://music-streaming-be-iuzg.onrender.com/api/like/check/song/${track._id}`, {
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
    
    if (!track) return;
    
    try {
      if (liked) {
        await axios.delete(`https://music-streaming-be-iuzg.onrender.com/api/like/song/${track._id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
      } else {
        await axios.post(`https://music-streaming-be-iuzg.onrender.com/api/like/song/${track._id}`, {}, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking/unliking song:', error);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!track) return;
    
    try {
      const response = await axios.get(`https://music-streaming-be-iuzg.onrender.com/api/download/song/${track._id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = `${track.name}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading song:', error);
      alert('Failed to download song');
    }
  };

  const handleShare = () => {
    if (!track) return;
    
    if (navigator.share) {
      navigator.share({
        title: track.name,
        text: `Check out this song: ${track.name} by ${track.artist || 'Unknown Artist'}`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying link:', err));
    }
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    seekTo(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!track) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-center text-white">
        <p className="text-gray-400">Select a track to play</p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4 text-white z-10">
        {/* Track Info */}
        <div className="flex items-center space-x-4 w-1/4">
          <img
            src={track.image}
            alt={track.name}
            className="h-14 w-14 object-cover rounded"
          />
          <div className="truncate">
            <p className="font-medium truncate">{track.name}</p>
            <p className="text-gray-400 text-sm truncate">{track.artist || 'Unknown Artist'}</p>
          </div>
        </div>
        
        {/* Player Controls */}
        <div className="flex flex-col items-center w-2/4">
          <div className="flex items-center space-x-6 mb-2">
            <button
              onClick={toggleShuffle}
              className={`focus:outline-none ${shuffle ? 'text-purple-500' : 'text-gray-400 hover:text-white'}`}
            >
              <FaRandom />
            </button>
            
            <button
              onClick={playPrevious}
              className="focus:outline-none text-gray-400 hover:text-white"
            >
              <FaStepBackward />
            </button>
            
            <button
              onClick={togglePlay}
              className="focus:outline-none bg-white text-black rounded-full p-2 hover:bg-gray-200"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            
            <button
              onClick={playNext}
              className="focus:outline-none text-gray-400 hover:text-white"
            >
              <FaStepForward />
            </button>
            
            <button
              onClick={toggleRepeat}
              className={`focus:outline-none ${
                repeat === 'off' ? 'text-gray-400 hover:text-white' :
                repeat === 'all' ? 'text-purple-500' :
                'text-purple-500 font-bold'
              }`}
            >
              <FaRedo />
              {repeat === 'one' && <span className="absolute text-xs">1</span>}
            </button>
          </div>
          
          <div className="flex items-center w-full space-x-2">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            
            <div
              ref={progressRef}
              className="flex-grow h-1 bg-gray-700 rounded-full cursor-pointer relative"
              onClick={handleProgressClick}
            >
              <div
                className="h-1 bg-purple-500 rounded-full absolute top-0 left-0"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        {/* Additional Controls */}
        <div className="flex items-center justify-end space-x-4 w-1/4">
          {/* <div className="relative">
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="focus:outline-none text-gray-400 hover:text-white"
            >
              <FaList />
            </button>
            
            {showQueue && (
              <div className="absolute bottom-12 right-0 w-64 bg-gray-800 rounded-lg shadow-lg p-4 z-20">
                <h3 className="font-bold mb-2">Queue ({queue.length})</h3>
                <div className="max-h-64 overflow-y-auto">
                  {queue.map((song, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-2 hover:bg-gray-700 rounded ${
                        index === currentIndex ? 'bg-gray-700' : ''
                      }`}
                      onClick={() => playTrack(song)}
                    >
                      <img
                        src={song.image}
                        alt={song.name}
                        className="h-8 w-8 object-cover rounded mr-2"
                      />
                      <div className="truncate">
                        <p className="truncate">{song.name}</p>
                        <p className="text-gray-400 text-xs truncate">{song.artist || 'Unknown Artist'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div> */}
          
          <div className="relative">
            <button
              onClick={() => setShowVolume(!showVolume)}
              className="focus:outline-none text-gray-400 hover:text-white"
            >
              {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            
            {showVolume && (
              <div className="absolute bottom-12 right-0 w-32 bg-gray-800 rounded-lg shadow-lg p-4 z-20">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          <button
            onClick={handleLike}
            className="focus:outline-none"
          >
            {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400 hover:text-white" />}
          </button>
          
          <button
            onClick={handleDownload}
            className="focus:outline-none text-gray-400 hover:text-white"
          >
            <FaDownload />
          </button>
          
          <button
            onClick={handleShare}
            className="focus:outline-none text-gray-400 hover:text-white"
          >
            <FaShareAlt />
          </button>
        </div>
      </div>
      
      {/* Add extra space at the bottom to account for the fixed player */}
      <div className="h-20"></div>
    </>
  );
};

export default Player;

