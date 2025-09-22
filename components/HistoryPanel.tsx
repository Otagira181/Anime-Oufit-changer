import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface HistoryPanelProps {
  history: string[];
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
  const handleDownload = (imageData: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    
    // Generate timestamp for unique filename
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
                      (now.getMonth() + 1).toString().padStart(2, '0') +
                      now.getDate().toString().padStart(2, '0') + '_' +
                      now.getHours().toString().padStart(2, '0') +
                      now.getMinutes().toString().padStart(2, '0') +
                      now.getSeconds().toString().padStart(2, '0');

    link.download = `anime-creation-${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-violet-400 mb-2">Lịch sử trống</h2>
        <p className="text-gray-400">Chưa có hình ảnh nào được tạo. Hãy qua tab 'Tạo ảnh' để bắt đầu!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {history.map((imageSrc, index) => (
        <div key={index} className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
          <img src={imageSrc} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover aspect-square" />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={() => handleDownload(imageSrc)}
              className="opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-300 bg-violet-600 text-white p-3 rounded-full hover:bg-violet-700 active:bg-violet-800"
              aria-label="Download image"
            >
              <DownloadIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryPanel;