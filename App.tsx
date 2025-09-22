import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import OptionsPanel from './components/OptionsPanel';
import ResultDisplay from './components/ResultDisplay';
import { generateOutfitChange, generateOutfitFromText } from './services/geminiService';
import { ImageFile } from './types';
import { POSES, CAMERA_ANGLES, CUSTOM_INPUT_VALUE, CUSTOM_OPTION_LABEL } from './constants';
import { SparklesIcon } from './components/icons/SparklesIcon';
import HistoryPanel from './components/HistoryPanel';

type ActiveTab = 'generator' | 'history';

function App() {
  const [characterImage, setCharacterImage] = useState<ImageFile | null>(null);
  const [outfitImage, setOutfitImage] = useState<ImageFile | null>(null);
  const [selectedPose, setSelectedPose] = useState<string>(POSES[0]);
  const [selectedAngle, setSelectedAngle] = useState<string>(CAMERA_ANGLES[0]);
  const [customPose, setCustomPose] = useState<string>('');
  const [customAngle, setCustomAngle] = useState<string>('');
  const [bodyMeasurements, setBodyMeasurements] = useState<string>('');
  const [outfitDescription, setOutfitDescription] = useState<string>('');
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState<boolean>(false);
  const [outfitGenerationError, setOutfitGenerationError] = useState<string | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');

  const handleGenerateOutfit = async () => {
    if (!outfitDescription.trim()) {
      setOutfitGenerationError('Vui lòng nhập mô tả trang phục.');
      return;
    }
    setIsGeneratingOutfit(true);
    setOutfitGenerationError(null);
    setError(null);
    setOutfitImage(null); 

    try {
      const resultDataUrl = await generateOutfitFromText(outfitDescription);
      
      const parts = resultDataUrl.split(',');
      if (parts.length !== 2) throw new Error("Dữ liệu hình ảnh không hợp lệ nhận được từ API.");
      
      const header = parts[0];
      const base64Data = parts[1];
      const mimeTypeMatch = header.match(/:(.*?);/);
      
      if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error("Không thể xác định loại MIME của hình ảnh.");
      
      const mimeType = mimeTypeMatch[1];
      setOutfitImage({ base64: base64Data, mimeType });

    } catch (err) {
      if (err instanceof Error) {
        setOutfitGenerationError(err.message);
      } else {
        setOutfitGenerationError('Đã xảy ra lỗi không mong muốn khi tạo trang phục.');
      }
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

  const handleGenerate = async () => {
    if (!characterImage || !outfitImage) {
      setError('Vui lòng tải lên cả ảnh nhân vật và ảnh trang phục.');
      return;
    }
    
    const finalPose = selectedPose === CUSTOM_INPUT_VALUE ? customPose.trim() : selectedPose;
    const finalAngle = selectedAngle === CUSTOM_INPUT_VALUE ? customAngle.trim() : selectedAngle;

    if (!finalPose) {
        setError('Vui lòng nhập một tư thế tùy chỉnh.');
        return;
    }
    if (!finalAngle) {
        setError('Vui lòng nhập một góc máy tùy chỉnh.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    const bodyMeasurementsInstruction = bodyMeasurements.trim()
      ? `sử dụng số đo cơ thể chính xác là "${bodyMeasurements.trim()}"`
      : 'lấy tham chiếu số đo cơ thể (ngực, eo, hông) từ ảnh nhân vật đầu tiên';

    const prompt = `Tạo một hình ảnh chất lượng cao, độ phân giải 4K. Từ ảnh nhân vật đầu tiên, chỉ lấy tham chiếu khuôn mặt và mái tóc. Về vóc dáng, ${bodyMeasurementsInstruction}. Bỏ qua hoàn toàn tư thế gốc của nhân vật. Áp dụng trang phục từ ảnh thứ hai cho nhân vật, đảm bảo các chi tiết và kết cấu vải của trang phục được thể hiện rõ ràng. Tạo hình ảnh mới với nhân vật mặc trang phục mới trong tư thế "${finalPose}" và góc máy ảnh là "${finalAngle}". Nhân vật nên được đặt trên một nền trắng đơn giản. Phong cách nghệ thuật phải là anime chi tiết, với ánh sáng điện ảnh và các đường nét sắc sảo. Quan trọng: Chỉ tạo ra hình ảnh, không viết bất kỳ văn bản nào.`;

    try {
      const result = await generateOutfitChange(characterImage, outfitImage, prompt);
      setGeneratedImage(result);
      setHistory(prevHistory => [result, ...prevHistory]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi không mong muốn.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetCharacter = () => {
    setCharacterImage(null);
  };

  const handleResetOutfit = () => {
    setOutfitImage(null);
  };

  const isGenerateDisabled = !characterImage || !outfitImage || isLoading ||
    (selectedPose === CUSTOM_INPUT_VALUE && !customPose.trim()) ||
    (selectedAngle === CUSTOM_INPUT_VALUE && !customAngle.trim());

  const TabButton: React.FC<{tabId: ActiveTab; children: React.ReactNode}> = ({ tabId, children }) => (
      <button
        onClick={() => setActiveTab(tabId)}
        className={`px-6 py-2 text-lg font-medium rounded-t-lg transition-colors ${
            activeTab === tabId
            ? 'bg-gray-800 text-violet-400 border-b-2 border-violet-400'
            : 'text-gray-400 hover:text-violet-300'
        }`}
        >
        {children}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600">
            Anime Outfit changer by Otagira
          </h1>
          <p className="text-gray-400 mt-2">
            Tải lên nhân vật và trang phục, chọn tư thế và để AI thực hiện phép màu!
          </p>
        </header>

        <div className="mb-8 border-b border-gray-700 flex justify-center">
            <TabButton tabId="generator">Tạo ảnh</TabButton>
            <TabButton tabId="history">Lịch sử ({history.length})</TabButton>
        </div>


        <main>
          {activeTab === 'generator' && (
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Controls Section */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUploader 
                      id="character-upload"
                      label="1. Tải lên ảnh nhân vật" 
                      image={characterImage} 
                      onImageChange={setCharacterImage}
                      onReset={handleResetCharacter}
                      showReset={true}
                      resetAriaLabel="Reset character image"
                    />
                    <div className="flex flex-col gap-4">
                      <ImageUploader 
                        id="outfit-upload"
                        label="2a. Tải lên ảnh trang phục" 
                        image={outfitImage} 
                        onImageChange={setOutfitImage}
                        onReset={handleResetOutfit}
                        showReset={true}
                        resetAriaLabel="Reset outfit image"
                      />
                      <div className="flex items-center gap-4 text-gray-500 px-2">
                          <hr className="flex-grow border-gray-700" />
                          <span className="font-semibold text-sm">HOẶC</span>
                          <hr className="flex-grow border-gray-700" />
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col gap-3">
                          <label htmlFor="outfit-description" className="text-lg font-semibold text-violet-300">
                              2b. Tạo trang phục từ mô tả
                          </label>
                          <textarea
                              id="outfit-description"
                              rows={3}
                              value={outfitDescription}
                              onChange={(e) => setOutfitDescription(e.target.value)}
                              placeholder="ví dụ: một chiếc váy đỏ bồng bềnh với họa tiết thêu vàng"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                              disabled={isGeneratingOutfit}
                          />
                          <button
                              onClick={handleGenerateOutfit}
                              disabled={!outfitDescription.trim() || isGeneratingOutfit}
                              className={`w-full flex items-center justify-center gap-2 py-2 px-4 text-md font-semibold rounded-lg transition-all duration-300 ${
                                  (!outfitDescription.trim() || isGeneratingOutfit)
                                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                      : 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800'
                              }`}
                          >
                              {isGeneratingOutfit ? (
                                  <>
                                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                      <span>Đang tạo...</span>
                                  </>
                              ) : (
                                  <>
                                      <SparklesIcon className="w-5 h-5" />
                                      <span>Tạo trang phục</span>
                                  </>
                              )}
                          </button>
                          {outfitGenerationError && (
                              <p className="text-sm text-red-400 text-center">{outfitGenerationError}</p>
                          )}
                      </div>
                    </div>
                  </div>
      
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h2 className="text-xl font-bold text-violet-400 mb-4">3. Tùy chỉnh nhân vật</h2>
                      <div className="space-y-6">
                          <div>
                            <label htmlFor="body-measurements" className="block text-sm font-medium text-violet-300 mb-2">
                                Số đo ba vòng (Tùy chọn)
                            </label>
                            <input
                                type="text"
                                id="body-measurements"
                                value={bodyMeasurements}
                                onChange={(e) => setBodyMeasurements(e.target.value)}
                                placeholder="ví dụ: 86-60-90"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                            />
                            <p className="text-xs text-gray-500 mt-1">Cung cấp số đo để AI tạo vóc dáng chính xác hơn.</p>
                          </div>
                          <OptionsPanel
                              title="Chọn tư thế"
                              name="pose"
                              options={POSES}
                              selectedValue={selectedPose}
                              onValueChange={setSelectedPose}
                              allowCustom={true}
                              customValue={customPose}
                              onCustomValueChange={setCustomPose}
                              customLabel={CUSTOM_OPTION_LABEL}
                          />
                          <OptionsPanel
                              title="Chọn góc máy"
                              name="angle"
                              options={CAMERA_ANGLES}
                              selectedValue={selectedAngle}
                              onValueChange={setSelectedAngle}
                              allowCustom={true}
                              customValue={customAngle}
                              onCustomValueChange={setCustomAngle}
                              customLabel={CUSTOM_OPTION_LABEL}
                          />
                      </div>
                  </div>
                   <button
                      onClick={handleGenerate}
                      disabled={isGenerateDisabled}
                      className={`w-full flex items-center justify-center gap-3 py-4 px-6 text-lg font-semibold rounded-lg transition-all duration-300 ${
                        isGenerateDisabled
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 transform hover:scale-105'
                      }`}
                    >
                      <SparklesIcon className="w-6 h-6" />
                      {isLoading ? 'Đang xử lý...' : 'Tạo ảnh mới'}
                  </button>
                </div>
      
                {/* Result Section */}
                <ResultDisplay 
                  image={generatedImage}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
          )}

          {activeTab === 'history' && (
            <HistoryPanel history={history} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;