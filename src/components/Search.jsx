import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { PlayerContext } from './context/PlayerContext';
import axios from 'axios';
import Songitem from './Songitem';
import { Link } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ songs: [], albums: [], playlists: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useContext(AuthContext);
  const { playTrack, API_BASE_URL } = useContext(PlayerContext);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults({ songs: [], albums: [], playlists: [] });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
      
      const response = await axios.get(`${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}${activeTab !== 'all' ? `&type=${activeTab}` : ''}`, {
        headers
      });
      
      setResults(response.data.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (query.trim()) {
      performSearch();
    }
  };

  return (
    <div className="w-full text-white">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for songs, albums, or playlists..."
          className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-full ${activeTab === 'all' ? 'bg-purple-600' : 'bg-gray-800'}`}
              onClick={() => handleTabChange('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-full ${activeTab === 'song' ? 'bg-purple-600' : 'bg-gray-800'}`}
              onClick={() => handleTabChange('song')}
            >
              Songs
            </button>
            <button
              className={`px-4 py-2 rounded-full ${activeTab === 'album' ? 'bg-purple-600' : 'bg-gray-800'}`}
              onClick={() => handleTabChange('album')}
            >
              Albums
            </button>
            <button
              className={`px-4 py-2 rounded-full ${activeTab === 'playlist' ? 'bg-purple-600' : 'bg-gray-800'}`}
              onClick={() => handleTabChange('playlist')}
            >
              Playlists
            </button>
          </div>

          {query.trim() && (
            <div>
              {(activeTab === 'all' || activeTab === 'song') && results.songs && results.songs.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Songs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.songs.map((song) => (
                      <div key={song._id} onClick={() => playTrack(song)} className="cursor-pointer">
                        <div className="flex items-center p-2 hover:bg-gray-700 rounded">
                          <img src={song.image} alt={song.name} className="h-12 w-12 object-cover rounded mr-3" />
                          <div>
                            <h3 className="font-medium">{song.name}</h3>
                            <p className="text-gray-400 text-sm">{song.artist || song.album || 'Unknown'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'album') && results.albums && results.albums.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Albums</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.albums.map((album) => (
                      <Link to={`/album/${album._id}`} key={album._id} className="block">
                        <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition">
                          <img src={album.image} alt={album.name} className="w-full h-40 object-cover rounded-md mb-2" />
                          <h3 className="font-semibold truncate">{album.name}</h3>
                          <p className="text-gray-400 text-sm truncate">{album.artist || 'Various Artists'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'playlist') && results.playlists && results.playlists.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Playlists</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.playlists.map((playlist) => (
                      <Link to={`/playlist/${playlist._id}`} key={playlist._id} className="block">
                        <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition">
                          <img src={playlist.coverImage} alt={playlist.name} className="w-full h-40 object-cover rounded-md mb-2" />
                          <h3 className="font-semibold truncate">{playlist.name}</h3>
                          <p className="text-gray-400 text-sm truncate">By {playlist.user?.name || 'Unknown'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {(!results.songs || results.songs.length === 0) && 
               (!results.albums || results.albums.length === 0) && 
               (!results.playlists || results.playlists.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No results found for "{query}"</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;