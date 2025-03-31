// Import UI icons (small files) directly
import bell_icon from "./bell.png";
import home_icon from "./home.png";
import like_icon from "./like.png";
import loop_icon from "./loop.png";
import mic_icon from "./mic.png";
import next_icon from "./next.png";
import play_icon from "./play.png";
import pause_icon from "./pause.png";
import plays_icon from "./plays.png";
import prev_icon from "./prev.png";
import search_icon from "./search.png";
import shuffle_icon from "./shuffle.png";
import speaker_icon from "./speaker.png";
import stack_icon from "./stack.png";
import zoom_icon from "./zoom.png";
import plus_icon from "./plus.png";
import arrow_icon from "./arrow.png";
import mini_player_icon from "./mini-player.png";
import queue_icon from "./queue.png";
import volume_icon from "./volume.png";
import arrow_right from "./right_arrow.png";
import arrow_left from "./left_arrow.png";
import spotify_logo from "./spotify_logo.png";
import clock_icon from "./clock_icon.png";

// Use dynamic imports for larger image files
// This will create separate chunks for each image
// and only load them when needed
const img8Path = () => import("./img8.jpg").then(module => module.default);
const img9Path = () => import("./img9.jpg").then(module => module.default);
const img10Path = () => import("./img10.jpg").then(module => module.default);
const img11Path = () => import("./img11.jpg").then(module => module.default);
const img15Path = () => import("./img15.jpg").then(module => module.default);
const img16Path = () => import("./img16.jpg").then(module => module.default);

// Placeholder image URL to use while the real images are loading
const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23cccccc'/%3E%3C/svg%3E";

export const assets = {
  bell_icon,
  home_icon,
  like_icon,
  loop_icon,
  mic_icon,
  next_icon,
  play_icon,
  plays_icon,
  prev_icon,
  search_icon,
  shuffle_icon,
  speaker_icon,
  stack_icon,
  zoom_icon,
  plus_icon,
  arrow_icon,
  mini_player_icon,
  volume_icon,
  queue_icon,
  pause_icon,
  arrow_left,
  arrow_right,
  spotify_logo,
  clock_icon,
};

export const albumsData = [
  {
    id: 0,
    name: "Top 50 Global",
    imagePath: img8Path,
    placeholder: placeholderImage,
    desc: "Your weekly update of the most played tracks",
    bgColor: "#2a4365",
  },
  {
    id: 1,
    name: "Top 50 India",
    imagePath: img9Path,
    placeholder: placeholderImage,
    desc: "Your weekly update of the most played tracks",
    bgColor: "#22543d",
  },
  {
    id: 2,
    name: "Trending India",
    imagePath: img10Path,
    placeholder: placeholderImage,
    desc: "Your weekly update of the most played tracks",
    bgColor: "#742a2a",
  },
  {
    id: 3,
    name: "Trending Global",
    imagePath: img16Path,
    placeholder: placeholderImage,
    desc: "Your weekly update of the most played tracks",
    bgColor: "#44337a",
  },
  {
    id: 4,
    name: "Mega Hits",
    imagePath: img11Path,
    placeholder: placeholderImage,
    desc: "Your weekly update of the most played tracks",
    bgColor: "#234e52",
  },
  {
    id: 5,
    name: "Happy Favorites",
    imagePath: img15Path,
    placeholder: placeholderImage,
    desc: "Your weekly update of the most played tracks",
    bgColor: "#744210",
  },
];
