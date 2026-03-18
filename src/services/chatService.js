import { apiClient } from "./apiClient";

export const sendChatMessage = async(message) => {
    return apiClient.post(
        "/chat", { message }, { auth: true },
    );
};

export const getChatHistory = async() => {
    return apiClient.get("/chat/history", { auth: true });
};

export const clearChatHistory = async() => {
    return apiClient.delete("/chat/history", { auth: true });
};