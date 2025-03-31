import { assets } from "../assets/frontend-assets/assets";
import Navbar from "./Navbar"
import { useParams } from "react-router-dom"
import { useContext, useEffect, useState } from "react";
import {PlayerContext} from './context/PlayerContext'

export const Displayalbum = ({ album })=>{
  const {id} = useParams();
  const [albumData, setAlbumData] = useState(null);
  const [albumImage, setAlbumImage] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const { playTrack, albumsData, songsData } = useContext(PlayerContext);

  useEffect(() => {
    if (album) {
      setAlbumData(album);
      if (album.image) {
        setAlbumImage(album.image);
        setImageLoading(false);
      } else if (album.imagePath) {
        loadAlbumImage(album.imagePath, album.placeholder);
      }
    } else if (albumsData && albumsData.length > 0) {
      // Find the album by id if not passed as prop
      const foundAlbum = albumsData.find(a => a.id === parseInt(id) || a._id === id);
      if (foundAlbum) {
        setAlbumData(foundAlbum);
        if (foundAlbum.image) {
          setAlbumImage(foundAlbum.image);
          setImageLoading(false);
        } else if (foundAlbum.imagePath) {
          loadAlbumImage(foundAlbum.imagePath, foundAlbum.placeholder);
        }
      }
    }
  }, [album, albumsData, id]);

  const loadAlbumImage = async (imagePath, placeholder) => {
    if (!imagePath) return;

    setAlbumImage(placeholder || '');

    try {
      const image = await imagePath();
      setAlbumImage(image);
    } catch (error) {
      console.error("Failed to load album image:", error);
    } finally {
      setImageLoading(false);
    }
  };

  if (!albumData) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mr-3"></div>
        Loading album...
      </div>
    );
  }

  return (
    <>
      <div>
        <Navbar/>
        <div className='mt-10 flex flex-col gap-8 text-white lg:flex-row'>
          <div className="relative w-[10rem]">
            <img
              className={`w-full rounded ${imageLoading ? 'blur-sm' : ''}`}
              src={albumImage || albumData.placeholder || ''}
              alt={albumData.name || ''}
              loading="lazy"
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse bg-gray-300 h-6 w-6 rounded-full"></div>
              </div>
            )}
          </div>
          <div>
            <p>Playlist</p>
            <h1 className='text-5xl font-bold mb-4 md:text-6xl'>{albumData.name || ''}</h1>
            <h1 className=''>{albumData.desc || ''}</h1>
            <p className='mt-1'>
              <img className='inline-block w-5' src={assets?.spotify_logo || ''} alt="" />
              <b>Spotify</b>
              . 12345 likes .12345 followers.
              . <b>50 songs,</b>
              about 2 hrs 30 min
            </p>
          </div>
        </div>
        <div className='grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 text-[#a7a7a7]'>
          <p><b className='mr-4'>#</b>Title</p>
          <p>Album</p>
          <p className='hidden sm:block'>Date added</p>
          <img className='m-auto w-4' src={assets?.clock_icon || ''} alt="" />
        </div>
        <hr/>
        {
          songsData && songsData.map((item, index)=>(
            <div onClick={()=>{playTrack(item)}} key={index} className='grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer'>
              <p className='text-white'>
                <b className='mr-4 text-[#a7a7a7]'>{index+1}</b>
                <img
                  className='inline w-10 mr-5'
                  src={item.image || ''}
                  alt={item.name || ''}
                  loading="lazy"
                />
              </p>
              <p className='text-[15px]'>{item.name || ''}</p>
              <p className='text-[15px] hidden sm:block'>5 days ago</p>
              <p className='text-[15px] text-center'>{item.duration || ''}</p>
            </div>
          ))
        }
      </div>
    </>
  )
}