import { useEffect, useState } from "react";
import { listDocs, uploadDoc, deleteDoc } from "../api/document.api";
import noDocsSvg from "../assets/no-docs.svg";

export default function DocumentManager() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await listDocs();
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    await uploadDoc(file);
    fetchDocuments();
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    await deleteDoc(docId);
    fetchDocuments();
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <input type="checkbox" />
          <span className="text-sm text-[#3A4A55]">Select All</span>

          <label className="bg-[#5F7482] text-white px-4 py-2 rounded-md cursor-pointer text-sm">
            Add New Document
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files[0])}
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search"
            className="border border-[#E5E7EB] px-3 py-2 rounded-md text-sm outline-none"
          />
          <button className="border border-[#E5E7EB] px-4 py-2 rounded-md text-sm">
            Filter
          </button>
        </div>
      </div>

      {/* Table (ALWAYS VISIBLE) */}
      <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFB] text-[#3A4A55]">
            <tr>
              <th className="p-3 text-left">S.No</th>
              <th className="p-3 text-left">Document Name</th>
              <th className="p-3 text-left">Document ID</th>
              <th className="p-3 text-left">Size</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {documents.length > 0 ? (
              documents.map((doc, index) => (
                <tr
                  key={doc.doc_id}
                  className="border-t border-[#E5E7EB]"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{doc.doc_name}</td>
                  <td className="p-3 text-xs text-gray-500">
                    {doc.doc_id}
                  </td>
                  <td className="p-3">
                    {(doc.file_size / 1024).toFixed(1)} KB
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(doc.doc_id)}
                      className="text-[#E54848] hover:underline"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              /* Empty State INSIDE TABLE */
              <tr>
                <td colSpan="5">
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <img
                      src={noDocsSvg}
                      alt="No documents"
                      className="w-40 mb-4"
                    />
                    <p>No documents uploaded yet</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
