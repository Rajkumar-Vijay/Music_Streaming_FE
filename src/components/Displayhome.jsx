import Navbar from "./Navbar"
import AlbumItem from './Albumitem'
import SongItem from "./Songitem";
import Comments from "./Comments";
import { useContext, useState, useEffect } from "react";
import { PlayerContext } from "./context/PlayerContext";
import { Link } from "react-router-dom";
import axios from "axios";

const PlaylistItem = ({ playlist }) => {
  return (
    <Link to={`/playlist/${playlist._id}`} className="min-w-[200px] max-w-[200px] mr-4 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition">
      <img
        src={playlist.coverImage}
        alt={playlist.name}
        className="w-full h-40 object-cover rounded-lg mb-2"
      />
      <h3 className="font-medium text-white truncate">{playlist.name}</h3>
      <p className="text-gray-400 text-sm">{playlist.songs.length} songs</p>
      <p className="text-gray-400 text-xs">By {playlist.user?.name || 'Unknown'}</p>
    </Link>
  );
};

const Displayhome = () => {
  const {
    songsData,
    playTrack,
    setQueue,
    toggleShuffle,
    shuffle,
    playNext,
    playPrevious
  } = useContext(PlayerContext);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const songsPerPage = 5;

  useEffect(() => {
    fetchPublicPlaylists();
  }, []);

  // Set the queue to all songs when component mounts
  useEffect(() => {
    if (songsData.length > 0) {
      setQueue(songsData);
    }
  }, [songsData, setQueue]);

  const fetchPublicPlaylists = async () => {
    try {
      const response = await axios.get('https://music-streaming-be-iuzg.onrender.com/api/playlist/public');
      if (response.data.success) {
        setPublicPlaylists(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching public playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total pages for songs pagination
  const totalPages = Math.ceil(songsData.length / songsPerPage);

  // Get current songs to display
  const currentSongs = songsData.slice(
    currentPage * songsPerPage,
    (currentPage + 1) * songsPerPage
  );

  // Navigation functions
  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Play a song and set the queue to all songs
  const handlePlaySong = (song) => {
    playTrack(song);
    setQueue(songsData);
  };

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState(null);

  // Function to handle opening comments modal
  const handleOpenComments = (songId, e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setSelectedSongId(songId);
    setShowCommentsModal(true);
  };

  return (
    <>
      <Navbar/>

      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          <h1 className='my-5 font-bold text-white text-3xl'>Today's Biggest Hits</h1>
          <div className='flex space-x-4'>
            <button
              onClick={toggleShuffle}
              className={`${shuffle ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'} text-white px-4 py-2 rounded-full`}
            >
              Shuffle
            </button>
            <button
              onClick={playPrevious}
              className='bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full'
            >
              Previous
            </button>
            <button
              onClick={playNext}
              className='bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full'
            >
              Next
            </button>
            <div className='flex space-x-2'>
              <button
                onClick={goToPrevPage}
                className='bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full'
                disabled={totalPages <= 1}
              >
                Prev Page
              </button>
              <button
                onClick={goToNextPage}
                className='bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full'
                disabled={totalPages <= 1}
              >
                Next Page
              </button>
            </div>
          </div>
        </div>

        {songsData.length === 0 ? (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No songs available</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-2'>
            {currentSongs.map((song) => (
              <div
                key={song._id}
                className='bg-gray-800 hover:bg-gray-700 rounded-lg transition cursor-pointer'
                onClick={() => handlePlaySong(song)}
              >
                <div className='flex items-center p-3'>
                  <img
                    src={song.image}
                    alt={song.name}
                    className='w-16 h-16 object-cover rounded-md mr-4'
                  />
                  <div className='flex-grow'>
                    <h3 className='font-medium text-white'>{song.name}</h3>
                    <p className='text-gray-400 text-sm'>{song.artist || 'Unknown Artist'}</p>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <div className='text-gray-400 text-sm'>{song.duration}</div>
                    <button
                      onClick={(e) => handleOpenComments(song._id, e)}
                      className='text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700'
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='mb-4'>
        <h1 className='my-5 font-bold text-white text-3xl'>Popular Playlists</h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : publicPlaylists.length === 0 ? (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No public playlists available</p>
          </div>
        ) : (
          <div className='flex overflow-auto'>
            {publicPlaylists.map((playlist) => (
              <PlaylistItem key={playlist._id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsModal && selectedSongId && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Comments</h2>
              <button
                onClick={() => setShowCommentsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4">
              <Comments itemId={selectedSongId} itemType="song" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Displayhome;
