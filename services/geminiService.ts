import { GoogleGenAI, Modality } from "@google/genai";
import { ImageFile } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateOutfitFromText = async (description: string): Promise<string> => {
    try {
        const fullPrompt = `A high-resolution, 4k image of a single piece of clothing: "${description}". The clothing should be displayed on a neutral, grey mannequin against a plain white background. The style should be that of a professional fashion catalog photo, with clear lighting that showcases the texture and details of the fabric. Do not include any human models or distracting elements.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '3:4',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error('AI không trả về hình ảnh. Vui lòng thử mô tả khác.');
        }

    } catch (error) {
        console.error("Gemini Image Generation Error:", error);
        if (error instanceof Error) {
            throw new Error(`Lỗi API: ${error.message}`);
        }
        throw new Error('Đã xảy ra lỗi không xác định khi giao tiếp với API.');
    }
};

export const generateOutfitChange = async (
  characterImage: ImageFile,
  outfitImage: ImageFile,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: characterImage.base64,
              mimeType: characterImage.mimeType,
            },
          },
          {
            inlineData: {
              data: outfitImage.base64,
              mimeType: outfitImage.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
        const base64ImageBytes = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64ImageBytes}`;
    } else {
        const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
        if (textPart && textPart.text) {
          throw new Error(`AI không tạo được ảnh và đã phản hồi: "${textPart.text}". Hãy thử lại với ảnh hoặc tùy chọn khác.`);
        }
        throw new Error('Không thể tạo hình ảnh. Vui lòng thử lại với hình ảnh hoặc tùy chọn khác.');
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        throw new Error(`Lỗi API: ${error.message}`);
    }
    throw new Error('Đã xảy ra lỗi không xác định khi giao tiếp với API.');
  }
};