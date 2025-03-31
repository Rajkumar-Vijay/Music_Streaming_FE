import Sidebar from './components/sidebar';
import Player from './components/player';
import Display from './components/display';
import Search from './components/Search';
import Playlists from './components/Playlists';
import PlaylistDetail from './components/PlaylistDetail';
import SongDetail from './components/SongDetail';
import LikedSongs from './components/LikedSongs';
import Downloads from './components/Downloads';
import { useContext, useEffect, useState } from 'react';
import { PlayerContext } from './components/context/PlayerContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import { PlayerContextProvider } from './components/context/PlayerContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';

const MusicApp = () => {
  const { audioRef, track, songsData, loading } = useContext(PlayerContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-xl">Loading music data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-y-auto pb-24">
          <Routes>
            <Route path="/" element={<Display />} />
            <Route path="/home" element={<Display />} />
            <Route path="/search" element={<Search />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="/song/:id" element={<SongDetail />} />
            <Route path="/liked-songs" element={<LikedSongs />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </div>
      </div>

      <Player />

      <audio
        ref={audioRef}
        src={track && track.file ? track.file : ''}
        preload='auto'
        onError={(e) => {
          console.error("Audio error:", e);
          // This will be handled by the error event listener in PlayerContext
        }}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <PlayerContextProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <MusicApp />
            </ProtectedRoute>
          } />
        </Routes>
      </PlayerContextProvider>
    </AuthProvider>
  );
};

export default App;