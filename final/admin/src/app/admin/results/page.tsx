"use client";
import React, { useEffect, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE_URL = "http://localhost:5000";

// Remove old ElectionResults interface and use new structure
type CategoryResult = {
  category: string;
  candidates: { name: string; votes: number }[];
  winners: string[];
};

const ResultsPage = () => {
  const [results, setResults] = useState<CategoryResult[] | null>(null);
  const [published, setPublished] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Poll for latest results every minute
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/blockchain/latest-archived-result`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setResults(data.results);
        } else {
          setResults(null);
        }
      } catch {
        setResults(null);
      }
    };
    fetchResults(); // Initial fetch
    const interval = setInterval(fetchResults, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-2 pt-24 bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a]">
        <h1 className="text-4xl font-bold text-emerald-400 mb-8">Election Results</h1>
        <div className="text-white/70 text-lg">Waiting for results to be published by the system...</div>
      </div>
    );
  }

  // Helper functions
  const calculateTotalVotes = () => {
    if (!results) return 0;
    return results.reduce(
      (sum, cat) => sum + cat.candidates.reduce((s, c) => s + c.votes, 0),
      0
    );
  };
  const getWinners = () => {
    if (!results) return [];
    return results.flatMap(cat => cat.winners.map(name => ({ position: cat.category, name })));
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen w-full flex flex-col items-center py-12 px-2 pt-24 bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a]">
        {/* Statistics */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 flex flex-col items-center shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-blue-300/40 hover:z-10">
            <span className="text-4xl font-extrabold text-blue-300 mb-2 drop-shadow font-sans">
              {results.length}
            </span>
            <span className="text-base text-blue-300 font-semibold tracking-wide font-sans">
              Positions
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 flex flex-col items-center shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-purple-300/40 hover:z-10">
            <span className="text-4xl font-extrabold text-purple-300 mb-2 drop-shadow font-sans">
              {calculateTotalVotes()}
            </span>
            <span className="text-base text-purple-300 font-semibold tracking-wide font-sans">
              Total Votes Cast
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 flex flex-col items-center shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-yellow-300/40 hover:z-10">
            <span className="text-4xl font-extrabold text-yellow-300 mb-2 drop-shadow font-sans">
              {getWinners().length}
            </span>
            <span className="text-base text-yellow-300 font-semibold tracking-wide font-sans">
              Winners
            </span>
          </div>
        </div>
        {/* Winners Display */}
        <div className="w-full max-w-3xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-10 flex flex-col items-center mb-10 shadow-2xl">
          <h3 className="text-3xl font-bold text-yellow-300 mb-8 tracking-tight drop-shadow font-sans">
            Election Winners
          </h3>
          <div className="grid gap-6 w-full max-w-2xl">
            {getWinners().map((winner, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-yellow-300/40 hover:z-10"
              >
                <div>
                  <h4 className="text-2xl font-bold text-yellow-300 mb-1 font-sans">
                    {winner.position}
                  </h4>
                  <p className="text-white text-lg font-semibold mb-1 font-sans">
                    {winner.name}
                  </p>
                  <p className="text-yellow-200 font-medium font-sans">
                    Winner
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Detailed Results */}
        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-10 shadow-2xl">
          <h2 className="text-2xl font-bold mb-8 text-white text-center tracking-tight drop-shadow font-sans">
            Detailed Results
          </h2>
          <div className="space-y-8">
            {results.map((cat, index) => (
              <div
                key={cat.category}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 transition-transform duration-200 hover:scale-105 hover:shadow-cyan-300/40 hover:z-10"
              >
                <h3 className="text-xl font-bold text-white mb-4 font-sans">
                  {cat.category}
                </h3>
                <div className="space-y-2">
                  {cat.candidates.length === 0 ? (
                    <div className="text-red-400">No candidates for this category.</div>
                  ) : (
                    <table className="min-w-full text-left border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-emerald-300 text-lg">
                          <th className="pr-6">Candidate</th>
                          <th className="pr-6">Votes</th>
                          <th className="pr-6">Winner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.candidates.map((cand, i) => (
                          <tr key={i} className="bg-[#23263a]/60 hover:bg-[#23263a]/80 rounded-xl">
                            <td className="pr-6 py-2 font-semibold">{cand.name}</td>
                            <td className="pr-6 py-2">{cand.votes}</td>
                            <td className="pr-6 py-2">
                              {cat.winners.includes(cand.name) ? (
                                <span className="text-yellow-300 font-bold">🏆 Winner</span>
                              ) : (
                                ""
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Remove manual Publish Results button and modal */}
        {/* Published banner and Setup New Election button */}
        <div className="w-full max-w-3xl mb-8 flex flex-col items-center mt-12">
          <div className="bg-cyan-600/90 text-white rounded-xl px-6 py-4 text-center font-semibold shadow-lg animate-fade-in font-sans text-lg mb-4">
            Results are now published and visible to everyone!
          </div>
          <button
            onClick={async () => {
              if (!window.confirm("Are you sure? This will erase all data except results.")) return;
              setDeleting(true);
              setDeleteError(null);
              try {
                const res = await fetch(`${API_BASE_URL}/api/admin/reset-election`, { method: "POST" });
                const data = await res.json();
                if (res.ok && data.success) {
                  alert("Election reset! Returning to dashboard.");
                  window.location.href = "/admin";
                } else {
                  setDeleteError(data.message || "Reset failed");
                  alert("Reset failed: " + (data.message || "Unknown error"));
                }
              } catch (err) {
                setDeleteError("Network error");
                alert("Reset failed: Network error");
              } finally {
                setDeleting(false);
              }
            }}
            className="mt-4 inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-blue-700 hover:from-blue-400 hover:to-purple-400 text-white rounded-full px-8 py-4 text-lg font-bold font-sans shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 border-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
            disabled={deleting}
          >
            {deleting ? "Ending..." : "End Elections"}
          </button>
          {deleteError && <div className="text-red-400 mt-2">{deleteError}</div>}
        </div>
      </div>
    </>
  );
};

export default ResultsPage;
