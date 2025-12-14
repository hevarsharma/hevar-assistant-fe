import AssistantBox from "../components/AssistantBox";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { initSession } from "../utils/session";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    initSession();
  }, []);

  return (
    <div className="relative h-screen w-screen bg-white">
      {/* Top-right controls */}
      <div className="absolute top-4 right-6 flex gap-6 z-10">
        <button
          onClick={() => navigate("/documents")}
          className="text-sm text-[#5F7482] hover:underline"
        >
          Documents
        </button>

        <button
          onClick={logout}
          className="text-sm text-[#5F7482] hover:underline"
        >
          Logout
        </button>
      </div>

      {/* Perfect center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AssistantBox />
      </div>
    </div>
  );
}
