const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      {/* Video Player Modal */}
      {isVideoPlayerOpen && currentVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={() => setIsVideoPlayerOpen(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsVideoPlayerOpen(false)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors">
              <X size={20} />
            </button>
            <iframe 
              src={currentVideo.includes('youtube.com/watch?v=') ? currentVideo.replace('watch?v=', 'embed/') : currentVideo} 
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}`;

const replacement = `      {/* Video Player Modal */}
      {isVideoPlayerOpen && currentVideo ? (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={() => setIsVideoPlayerOpen(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsVideoPlayerOpen(false)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors">
              <X size={20} />
            </button>
            <iframe 
              src={currentVideo.includes('youtube.com/watch?v=') ? currentVideo.replace('watch?v=', 'embed/') : currentVideo} 
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ) : null}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated App.tsx video player guard");
} else {
  console.log("Target not found in App.tsx");
}
