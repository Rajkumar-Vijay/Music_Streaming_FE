import {Routes, Route, useLocation} from "react-router-dom";
import Displayhome from "./Displayhome";
import Albumitem from "./Albumitem";
import { Displayalbum } from "./Displayalbum";
import { useContext, useRef, useEffect, useState } from "react";
import { PlayerContext } from "./context/PlayerContext";

const Display = () => {
  const { albumsData } = useContext(PlayerContext);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const displayRef = useRef();
  const location = useLocation();
  const isAlbum = location.pathname.includes('album');
  const albumId = isAlbum ? location.pathname.split('/').pop() : "";

  useEffect(() => {
    if (isAlbum && albumsData && albumsData.length > 0) {
      const album = albumsData.find(x => x._id === albumId || x.id === albumId);
      setSelectedAlbum(album);
    }
  }, [isAlbum, albumId, albumsData]);

  // Default background color if album not found
  const bgColor = "#121212";

  return (
    <div
      ref={displayRef}
      className="w-[100%] m-2 px-6 pt-4 rounded bg-[#121212] overflow-auto lg:w-[90%] lg:ml-0"
      style={{ backgroundColor: bgColor }}
    >
      <Routes>
        <Route path="/" element={<Displayhome />} />
        <Route path="/album/:id" element={<Displayalbum album={selectedAlbum} />} />
      </Routes>
    </div>
  )
}
export default Display;