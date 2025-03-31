import { useContext } from "react";
import { PlayerContext } from "./context/PlayerContext";
import { FaPlay, FaPause } from 'react-icons/fa';

const Songitem = ({ song, onClick, isActive }) => {
  const { isPlaying } = useContext(PlayerContext);

  // Support both direct props and song object
  const songData = song || {};
  const image = songData.image || '';
  const name = songData.name || '';
  const artist = songData.artist || 'Unknown Artist';
  const duration = songData.duration || '';

  return (
    <div
      onClick={onClick}
      className='flex items-center w-full p-3 rounded cursor-pointer hover:bg-[#ffffff26] transition'
    >
      <div className="flex items-center flex-grow">
        <div className="relative mr-4">
          <img className='h-12 w-12 rounded object-cover' src={image} alt={name} />
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
              {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white" />}
            </div>
          )}
        </div>
        <div className="flex-grow">
          <p className='font-medium truncate'>{name}</p>
          <p className='text-gray-400 text-sm truncate'>{artist}</p>
        </div>
      </div>
      <div className="text-gray-400 text-sm">{duration}</div>
    </div>
  );
}
export default Songitem;