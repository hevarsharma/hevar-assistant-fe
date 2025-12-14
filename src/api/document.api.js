import api from "./axios";

/* Upload document */
export const uploadDoc = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* List all documents */
export const listDocs = () => {
  return api.get("/documents");
};

/* Delete document */
export const deleteDoc = (docId) => {
  return api.delete(`/documents/${docId}`);
};
