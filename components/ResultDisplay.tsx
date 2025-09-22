
import React from 'react';

interface ResultDisplayProps {
  image: string | null;
  isLoading: boolean;
  error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ image, isLoading, error }) => {
  return (
    <div className="w-full lg:col-span-2 bg-gray-800 rounded-lg p-4 min-h-[40rem] flex flex-col justify-center items-center border border-gray-700">
      <h2 className="text-2xl font-bold text-violet-400 mb-4">Kết quả</h2>
      <div className="w-full h-[35rem] bg-gray-900/50 rounded-lg flex items-center justify-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500"></div>
            <p className="text-gray-400">AI đang sáng tạo, vui lòng chờ...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="text-center text-red-400">
            <p><strong>Đã xảy ra lỗi:</strong></p>
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && image && (
          <img src={image} alt="Generated character" className="object-contain h-full w-full rounded-md" />
        )}
        {!isLoading && !error && !image && (
          <p className="text-gray-500">Hình ảnh của bạn sẽ xuất hiện ở đây.</p>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
