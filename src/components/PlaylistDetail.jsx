import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { PlayerContext } from './context/PlayerContext';
import axios from 'axios';
import Songitem from './Songitem';
import Comments from './Comments';
import { FaHeart, FaRegHeart, FaShare, FaDownload, FaPlay, FaPause, FaPlus, FaMusic } from 'react-icons/fa';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { playTrack, isPlaying, track, togglePlay, currentPlaylist, songsData } = useContext(PlayerContext);

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showUploadSongModal, setShowUploadSongModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [coverImage, setCoverImage] = useState(null);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // For song upload
  const [songName, setSongName] = useState('');
  const [songDesc, setSongDesc] = useState('');
  const [songFile, setSongFile] = useState(null);
  const [songImage, setSongImage] = useState(null);
  const [songArtist, setSongArtist] = useState('');
  const [songGenre, setSongGenre] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [songDuration, setSongDuration] = useState('');

  useEffect(() => {
    fetchPlaylist();
    if (user) {
      checkIfLiked();
      fetchAvailableSongs();
    }
  }, [id, user]);

  // Calculate song duration when a file is selected
  useEffect(() => {
    if (songFile) {
      const audio = new Audio(URL.createObjectURL(songFile));
      audio.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        setSongDuration(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
      });
    }
  }, [songFile]);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};

      // Use the playback endpoint to get full song details
      const response = await axios.get(`https://music-streaming-be-iuzg.onrender.com/api/playlist/${id}/playback`, {
        headers
      });

      console.log("Playlist data:", response.data.data);
      setPlaylist(response.data.data);
      setEditData({
        name: response.data.data.name,
        description: response.data.data.description || '',
        isPublic: response.data.data.isPublic
      });
    } catch (error) {
      console.error('Error fetching playlist:', error);
      setError('Failed to load playlist');
      if (error.response?.status === 404) {
        navigate('/not-found');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSongs = async () => {
    try {
      const response = await axios.get('https://music-streaming-be-iuzg.onrender.com/api/song/list');
      if (response.data.success) {
        setAvailableSongs(response.data.songs);
      }
    } catch (error) {
      console.error('Error fetching available songs:', error);
    }
  };

  const checkIfLiked = async () => {
    try {
      const response = await axios.get(`https://music-streaming-be-iuzg.onrender.com/api/like/check/playlist/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setLiked(response.data.liked);
    } catch (error) {
      console.error('Error checking if playlist is liked:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (liked) {
        await axios.delete(`https://music-streaming-be-iuzg.onrender.com/api/like/playlist/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
      } else {
        await axios.post(`https://music-streaming-be-iuzg.onrender.com/api/like/playlist/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
      }
      setLiked(!liked);
      // Update likes count in the playlist object
      setPlaylist({
        ...playlist,
        likesCount: liked ? playlist.likesCount - 1 : playlist.likesCount + 1
      });
    } catch (error) {
      console.error('Error liking/unliking playlist:', error);
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      playTrack(playlist.songs[0], playlist);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: playlist.name,
        text: `Check out this playlist: ${playlist.name}`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying link:', err));
    }
  };

  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', editData.name);
      formData.append('description', editData.description);
      formData.append('isPublic', editData.isPublic);
      
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      
      const response = await axios.put(`https://music-streaming-be-iuzg.onrender.com/api/playlist/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setPlaylist(response.data.data);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('Failed to update playlist');
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await axios.delete(`https://music-streaming-be-iuzg.onrender.com/api/playlist/${id}/songs/${songId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Update the playlist in state
      setPlaylist({
        ...playlist,
        songs: playlist.songs.filter(song => song._id !== songId)
      });
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      alert('Failed to remove song from playlist');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSongFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSongFile(e.target.files[0]);
    }
  };

  const handleSongImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSongImage(e.target.files[0]);
    }
  };

  const handleAddExistingSong = async () => {
    if (!selectedSongId) {
      alert('Please select a song to add');
      return;
    }

    try {
      await axios.post(`https://music-streaming-be-iuzg.onrender.com/api/playlist/${id}/songs/${selectedSongId}`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      // Refresh playlist data
      fetchPlaylist();
      setShowAddSongModal(false);
      setSelectedSongId('');
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      if (error.response?.status === 400 && error.response?.data?.message === 'Song is already in the playlist') {
        alert('This song is already in the playlist');
      } else {
        alert('Failed to add song to playlist');
      }
    }
  };

  const handleUploadSong = async (e) => {
    e.preventDefault();

    if (!songName || !songFile || !songImage) {
      alert('Please fill in all required fields');
      return;
    }

    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', songName);
      formData.append('desc', songDesc);
      formData.append('artist', songArtist);
      formData.append('genre', songGenre);
      formData.append('duration', songDuration);

      // Append files with specific field names expected by the backend
      formData.append('audio', songFile);
      formData.append('image', songImage);

      // Upload the song
      const uploadResponse = await axios.post('https://music-streaming-be-iuzg.onrender.com/api/song/add', formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadResponse.data.success) {
        // Get the ID of the newly created song
        const newSongId = uploadResponse.data.song._id;

        // Add the song to the playlist
        await axios.post(`https://music-streaming-be-iuzg.onrender.com/api/playlist/${id}/songs/${newSongId}`, {}, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        // Reset form and refresh playlist
        setSongName('');
        setSongDesc('');
        setSongFile(null);
        setSongImage(null);
        setSongArtist('');
        setSongGenre('');
        setSongDuration('');

        fetchPlaylist();
        setShowUploadSongModal(false);
        alert('Song uploaded and added to playlist successfully');
      }
    } catch (error) {
      console.error('Error uploading song:', error);
      alert('Failed to upload song: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadLoading(false);
    }
  };

  const filteredSongs = availableSongs.filter(song => {
    // Filter out songs that are already in the playlist
    const isInPlaylist = playlist?.songs.some(playlistSong => playlistSong._id === song._id);

    // Filter by search term
    const matchesSearch = song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()));

    return !isInPlaylist && matchesSearch;
  });

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

  if (!playlist) return null;

  const isOwner = user && playlist.user && user._id === playlist.user._id;
  const isCurrentlyPlaying = isPlaying && currentPlaylist && currentPlaylist._id === playlist._id;

  return (
    <div className="text-white">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <img
            src={playlist.coverImage}
            alt={playlist.name}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center mb-2">
            <span className="text-sm bg-gray-700 px-2 py-1 rounded">
              {playlist.isPublic ? 'Public Playlist' : 'Private Playlist'}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
          
          {playlist.description && (
            <p className="text-gray-400 mb-4">{playlist.description}</p>
          )}
          
          <div className="flex items-center text-sm text-gray-400 mb-6">
            <p>Created by {playlist.user?.name || 'Unknown'}</p>
            <span className="mx-2">•</span>
            <p>{playlist.songs.length} songs</p>
            <span className="mx-2">•</span>
            <p>{playlist.likesCount} likes</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full transition"
              disabled={playlist.songs.length === 0}
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
            
            {isOwner && (
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Songs</h2>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddSongModal(true)}
                className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded transition"
              >
                <FaPlus size={14} />
                Add Existing Song
              </button>
              <button
                onClick={() => setShowUploadSongModal(true)}
                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded transition"
              >
                <FaMusic size={14} />
                Upload New Song
              </button>
            </div>
          )}
        </div>

        {playlist.songs.length === 0 ? (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400 mb-4">This playlist is empty</p>
            {isOwner && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowAddSongModal(true)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition"
                >
                  Add Existing Song
                </button>
                <button
                  onClick={() => setShowUploadSongModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition"
                >
                  Upload New Song
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {playlist.songs.map((song) => (
              <div key={song._id} className="flex items-center">
                <Songitem
                  song={song}
                  onClick={() => playTrack(song, playlist)}
                  isActive={track && track._id === song._id}
                />

                {isOwner && (
                  <button
                    onClick={() => handleRemoveSong(song._id)}
                    className="ml-2 text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <Comments itemId={id} itemType="playlist" />
      </div>
      
      {/* Edit Playlist Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Playlist</h2>

            <form onSubmit={handleUpdatePlaylist}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Description (optional)</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Cover Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={editData.isPublic}
                    onChange={(e) => setEditData({ ...editData, isPublic: e.target.checked })}
                    className="mr-2"
                  />
                  Make playlist public
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Existing Song Modal */}
      {showAddSongModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Song to Playlist</h2>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search songs..."
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredSongs.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                {searchTerm ? 'No songs match your search' : 'No songs available to add'}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto mb-6">
                {filteredSongs.map(song => (
                  <div
                    key={song._id}
                    className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedSongId === song._id ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                    onClick={() => setSelectedSongId(song._id)}
                  >
                    <img
                      src={song.image}
                      alt={song.name}
                      className="h-12 w-12 object-cover rounded mr-3"
                    />
                    <div className="flex-grow">
                      <p className="font-medium">{song.name}</p>
                      <p className="text-gray-400 text-sm">{song.artist || 'Unknown Artist'}</p>
                    </div>
                    <div className="text-gray-400 text-sm">{song.duration}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddSongModal(false);
                  setSelectedSongId('');
                  setSearchTerm('');
                }}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExistingSong}
                disabled={!selectedSongId}
                className={`px-4 py-2 rounded transition ${selectedSongId ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 cursor-not-allowed'}`}
              >
                Add to Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Song Modal */}
      {showUploadSongModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Upload New Song</h2>

            <form onSubmit={handleUploadSong}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Song Name*</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Artist</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={songArtist}
                  onChange={(e) => setSongArtist(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Genre</label>
                <select
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={songGenre}
                  onChange={(e) => setSongGenre(e.target.value)}
                >
                  <option value="">Select Genre</option>
                  <option value="Pop">Pop</option>
                  <option value="Rock">Rock</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="R&B">R&B</option>
                  <option value="Country">Country</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                  <option value="Folk">Folk</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={songDesc}
                  onChange={(e) => setSongDesc(e.target.value)}
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Audio File*</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleSongFileChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
                {songFile && songDuration && (
                  <p className="mt-1 text-sm text-green-500">Duration: {songDuration}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Cover Image*</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSongImageChange}
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
                {songImage && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(songImage)}
                      alt="Song cover preview"
                      className="h-20 w-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadSongModal(false);
                    setSongName('');
                    setSongDesc('');
                    setSongFile(null);
                    setSongImage(null);
                    setSongArtist('');
                    setSongGenre('');
                  }}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                  disabled={uploadLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || !songName || !songFile || !songImage}
                  className={`px-4 py-2 rounded transition ${
                    uploadLoading || !songName || !songFile || !songImage
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {uploadLoading ? 'Uploading...' : 'Upload & Add to Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;