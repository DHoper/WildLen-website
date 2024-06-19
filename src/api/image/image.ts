import { apiClient } from "../axiosInstance";

export const ApiConfig = {
  index: "/image",
  postImages: (dir: string) => `/image/${dir}`,
};

export async function postImages(files: FileList, dir: string) {
  try {
    const formData = new FormData();
    for (const file of files) {
      formData.append("image", file);
    }

    const response = await apiClient.post(ApiConfig.postImages(dir), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("上傳圖片時發生錯誤:", error);
    throw error;
  }
}

export async function deleteImages(publicId: string[]) {
  try {
    const response = await apiClient.delete(ApiConfig.index, {
      data: publicId,
    });
    return response;
  } catch (error) {
    console.error("刪除圖片資源時發生錯誤:", error);
    throw error;
  }
}
