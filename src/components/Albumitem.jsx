import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Albumitem = ({ imagePath, placeholder, name, desc, id }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);

  useEffect(() => {
    // Only load the image when the component is mounted
    let isMounted = true;

    if (imagePath) {
      imagePath().then(src => {
        if (isMounted) {
          setImageSrc(src);
          setImageLoaded(true);
        }
      }).catch(err => {
        console.error("Failed to load image:", err);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [imagePath]);

  return (
    <>
      <div
        onClick={() => navigate(`/album/${id}`)}
        className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'
      >
        <div className="relative">
          <img
            className={`rounded w-full ${!imageLoaded ? 'blur-sm' : ''}`}
            src={imageSrc}
            alt={name}
            loading="lazy"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-gray-300 h-4 w-4 rounded-full"></div>
            </div>
          )}
        </div>
        <p className='font-bold mt-2 mb-1'>{name}</p>
        <p className='text-slate-200 text-sm'>{desc}</p>
      </div>
    </>
  );
};

export default Albumitem;