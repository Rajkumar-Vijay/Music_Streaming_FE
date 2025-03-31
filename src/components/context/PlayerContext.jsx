import { createContext, useState, useRef, useEffect } from 'react';
import axios from 'axios';

export const PlayerContext = createContext();

// Define a base URL for API calls
const API_BASE_URL = 'https://music-streaming-be-iuzg.onrender.com';

export const PlayerContextProvider = ({ children }) => {
  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [repeat, setRepeat] = useState('off'); // 'off', 'all', 'one'
  const [shuffle, setShuffle] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Fetch songs data
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/song/list`);
        const songs = response.data.songs || [];
        setSongsData(songs);

        // Initialize queue with all songs if it's empty
        if (queue.length === 0 && songs.length > 0) {
          setQueue(songs);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching songs:', error);
        setError('Failed to load songs. Please try again later.');
        setLoading(false);
      }
    };

    const fetchAlbums = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/album/list`);
        setAlbumsData(response.data.albums || []);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchSongs();
    fetchAlbums();
  }, []);

  // Fetch user playlists if user is logged in
  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
          try {
            // Use the correct endpoint for fetching all playlists for the user
            const response = await axios.get(`${API_BASE_URL}/api/playlist`, {
              headers: {
                Authorization: `Bearer ${user.token}`
              }
            });
            setPlaylists(response.data.data || []);
          } catch (error) {
            console.error('Error fetching playlists:', error);
            // Set empty playlists array on error to prevent further errors
            setPlaylists([]);
          }
        } else {
          // If no user is logged in, set playlists to empty array
          setPlaylists([]);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setPlaylists([]);
      }
    };

    fetchUserPlaylists();
  }, []);

  // Play next track
  const playNext = () => {
    if (queue.length <= 1) return;

    // Pause current audio before changing track
    if (audioRef.current && audioRef.current.play) {
      audioRef.current.pause();
    }

    let nextIndex;
    if (shuffle) {
      // Play random song (excluding current song)
      nextIndex = Math.floor(Math.random() * (queue.length - 1));
      if (nextIndex >= currentIndex) nextIndex += 1; // Skip current song
    } else {
      // Play next song or loop back to first
      nextIndex = (currentIndex + 1) % queue.length;
    }

    // Reset audio state
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }

    setCurrentIndex(nextIndex);
    setTrack(queue[nextIndex]);

    // Set playing state after a small delay
    setTimeout(() => {
      setIsPlaying(true);
    }, 50);
  };

  // Play previous track
  const playPrevious = () => {
    if (queue.length <= 1) return;

    // If current time > 3 seconds, restart the song instead
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    // Pause current audio before changing track
    if (audioRef.current && audioRef.current.play) {
      audioRef.current.pause();
    }

    let prevIndex;
    if (shuffle) {
      // Play random song (excluding current song)
      prevIndex = Math.floor(Math.random() * (queue.length - 1));
      if (prevIndex >= currentIndex) prevIndex += 1; // Skip current song
    } else {
      // Play previous song or loop to last
      prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    }

    // Reset audio state
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }

    setCurrentIndex(prevIndex);
    setTrack(queue[prevIndex]);

    // Set playing state after a small delay
    setTimeout(() => {
      setIsPlaying(true);
    }, 50);
  };

  // Handle audio events
  useEffect(() => {
    if (audioRef.current) {
      // Set volume
      audioRef.current.volume = volume;

      // Play/pause with better error handling
      if (isPlaying) {
        // Use a small timeout to ensure any previous operations have completed
        const playWithRetry = async () => {
          try {
            // Check if the audio is actually ready to play
            if (audioRef.current.readyState >= 2) {
              await audioRef.current.play();
            } else {
              // If not ready, wait for the canplay event
              const canPlayHandler = async () => {
                try {
                  await audioRef.current.play();
                } catch (error) {
                  console.error('Error playing audio after canplay:', error);
                  setIsPlaying(false);
                }
                audioRef.current.removeEventListener('canplay', canPlayHandler);
              };
              audioRef.current.addEventListener('canplay', canPlayHandler);
            }
          } catch (error) {
            // Only log and update state for errors that aren't AbortError
            if (error.name !== 'AbortError') {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
            }
          }
        };

        setTimeout(playWithRetry, 50);
      } else {
        audioRef.current.pause();
      }

      // Event listeners
      const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
      };

      const handleDurationChange = () => {
        setDuration(audioRef.current.duration);
      };

      const handleEnded = () => {
        if (repeat === 'one') {
          // For repeat one, just reset the time and play again
          audioRef.current.currentTime = 0;

          // Use a small timeout to ensure the audio is ready
          setTimeout(() => {
            audioRef.current.play().catch(err => {
              // Only log non-abort errors
              if (err.name !== 'AbortError') {
                console.error('Error replaying audio:', err);
                setIsPlaying(false);
              }
            });
          }, 50);
        } else if (repeat === 'all' || queue.length > 1) {
          // For repeat all or if there are more songs, play the next track
          playNext();
        } else {
          // If no repeat and only one song, just stop
          setIsPlaying(false);
        }
      };

      const handleError = (e) => {
        console.error('Audio element error:', e);
        setIsPlaying(false);

        // If there's an error with the current track, try to play the next one
        if (queue.length > 1) {
          setTimeout(() => playNext(), 1000);
        }
      };

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('durationchange', handleDurationChange);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('error', handleError);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('durationchange', handleDurationChange);
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [isPlaying, volume, repeat, queue, currentIndex]);

  // Play a track
  const playTrack = (song, playlist = null) => {
    if (!song) {
      console.error('Attempted to play undefined song');
      return;
    }

    // Pause current audio before changing track to avoid race conditions
    if (audioRef.current && audioRef.current.play) {
      audioRef.current.pause();
    }

    // Reset audio state
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }

    // Update track state
    setTrack(song);

    // Update playlist and queue
    if (playlist) {
      setCurrentPlaylist(playlist);
      const songIds = playlist.songs.map(s => s._id);
      const index = songIds.indexOf(song._id);
      setCurrentIndex(index >= 0 ? index : 0);
      setQueue(playlist.songs);
    } else {
      setCurrentPlaylist(null);
      setCurrentIndex(0);
      setQueue([song]);
    }

    // Set playing state after a small delay to ensure state updates have processed
    setTimeout(() => {
      setIsPlaying(true);
    }, 50);
  };

  // Toggle play/pause
  const togglePlay = () => {
    // If we're about to play and there's no track selected, don't do anything
    if (!isPlaying && !track) {
      return;
    }

    // If we're about to pause, pause the audio first before changing state
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      // Small delay to ensure the pause operation completes
      setTimeout(() => {
        setIsPlaying(false);
      }, 50);
    } else {
      // We're about to play
      setIsPlaying(true);
    }
  };

  // Toggle shuffle
  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  // Toggle repeat
  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeat(modes[nextIndex]);
  };

  // Seek to a specific time
  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Set volume
  const changeVolume = (newVolume) => {
    setVolume(newVolume);
  };

  // Add a song to the queue
  const addToQueue = (song) => {
    setQueue([...queue, song]);
  };

  // Remove a song from the queue
  const removeFromQueue = (index) => {
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);

    // Adjust currentIndex if necessary
    if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    } else if (index === currentIndex) {
      // If removing current song, play next song
      if (newQueue.length > 0) {
        const newIndex = Math.min(currentIndex, newQueue.length - 1);
        setCurrentIndex(newIndex);
        setTrack(newQueue[newIndex]);
      } else {
        setTrack(null);
        setIsPlaying(false);
        setCurrentIndex(0);
      }
    }
  };

  // Clear the queue
  const clearQueue = () => {
    setQueue([]);
    setTrack(null);
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  return (
    <PlayerContext.Provider
      value={{
        songsData,
        albumsData,
        playlists,
        setPlaylists,
        currentPlaylist,
        track,
        isPlaying,
        volume,
        repeat,
        shuffle,
        queue,
        setQueue,
        currentIndex,
        duration,
        currentTime,
        loading,
        error,
        audioRef,
        playTrack,
        playNext,
        playPrevious,
        togglePlay,
        toggleShuffle,
        toggleRepeat,
        seekTo,
        changeVolume,
        addToQueue,
        removeFromQueue,
        clearQueue,
        API_BASE_URL
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
