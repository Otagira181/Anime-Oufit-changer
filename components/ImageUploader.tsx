
import React, { useState } from 'react';
import { ImageFile } from '../types';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

interface ImageUploaderProps {
  id: string;
  label: string;
  image: ImageFile | null;
  onImageChange: (file: ImageFile | null) => void;
  onReset?: () => void;
  showReset?: boolean;
  resetAriaLabel?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, image, onImageChange, onReset, showReset = false, resetAriaLabel = "Reset image" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = (file: File | undefined | null) => {
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageChange({ base64: base64String, mimeType: file.type });
        setIsProcessing(false);
      };
      reader.onerror = () => {
        console.error("Error reading the file.");
        setIsProcessing(false);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFile(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label htmlFor={id} className="text-lg font-semibold text-violet-300 mb-2">{label}</label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full h-80 bg-gray-800 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
          isDragOver ? 'border-violet-500' : 'border-gray-600'
        } hover:border-violet-500`}
      >
        {isProcessing && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex flex-col items-center justify-center rounded-lg z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400"></div>
            <p className="text-gray-300 mt-2">Đang xử lý...</p>
          </div>
        )}

        {image ? (
          <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Preview" className="object-contain h-full w-full rounded-md" />
        ) : (
          <div className="text-center text-gray-500 pointer-events-none p-4">
            <p>Kéo và thả hoặc nhấp để tải lên</p>
             <p className="text-sm mt-1">
                {isDragOver ? "Thả ảnh vào đây!" : ""}
            </p>
          </div>
        )}
        <input
          id={id}
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
        {image && showReset && onReset && (
            <button
            onClick={onReset}
            className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 p-2 rounded-full text-white hover:bg-red-500 transition-colors z-20"
            aria-label={resetAriaLabel}
            disabled={isProcessing}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
