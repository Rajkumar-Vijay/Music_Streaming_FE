import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { PlayerContext } from './context/PlayerContext';
import axios from 'axios';

const Playlists = () => {
  const { user } = useContext(AuthContext);
  const { playlists, setPlaylists } = useContext(PlayerContext);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserPlaylists();
  }, [user]);

  const fetchUserPlaylists = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axios.get('https://music-streaming-be-iuzg.onrender.com/api/playlist', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setPlaylists(response.data.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newPlaylist.name.trim()) {
      setError('Playlist name is required');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', newPlaylist.name);
      formData.append('description', newPlaylist.description);
      formData.append('isPublic', newPlaylist.isPublic);
      
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      
      const response = await axios.post('https://music-streaming-be-iuzg.onrender.com/api/playlist', formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add the new playlist to the list
      setPlaylists([response.data.data, ...playlists]);
      
      // Reset form and close modal
      setNewPlaylist({
        name: '',
        description: '',
        isPublic: true
      });
      setCoverImage(null);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError(error.response?.data?.message || 'Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      await axios.delete(`https://music-streaming-be-iuzg.onrender.com/api/playlist/${playlistId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Remove the deleted playlist from the list
      setPlaylists(playlists.filter(playlist => playlist._id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Playlists</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
        >
          Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-8 bg-gray-800 rounded-lg">
          <p className="text-gray-400 mb-4">You don't have any playlists yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
          >
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="bg-gray-800 rounded-lg overflow-hidden">
              <Link to={`/playlist/${playlist._id}`}>
                <img
                  src={playlist.coverImage}
                  alt={playlist.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold truncate">{playlist.name}</h3>
                  <p className="text-gray-400 text-sm">{playlist.songs.length} songs</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {playlist.isPublic ? 'Public' : 'Private'}
                  </p>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleDeletePlaylist(playlist._id)}
                  className="text-red-500 text-sm hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Playlist</h2>
            
            {error && (
              <div className="bg-red-500 text-white p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Description (optional)</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
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
                    checked={newPlaylist.isPublic}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, isPublic: e.target.checked })}
                    className="mr-2"
                  />
                  Make playlist public
                </label>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;