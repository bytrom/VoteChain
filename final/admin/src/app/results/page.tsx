"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

// Remove old ElectionResult interface and use new structure
type CategoryResult = {
  category: string;
  candidates: { name: string; votes: number }[];
  winners: string[];
};

// New type for archived election
interface ArchivedElection {
  title: string;
  results: CategoryResult[];
  archivedAt?: string;
  blockchainElectionId?: number; // Added for filtering
  [key: string]: any; // for any extra fields
}

export default function ResultsPage() {
  const [results, setResults] = useState<ArchivedElection[]>([]); // Store full objects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0); // 0 = latest expanded
  const [currentElectionId, setCurrentElectionId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCurrentElectionId() {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/events/current`
            : "/api/events/current"
        );
        const data = await res.json();
        if (data.event && data.event.electionId) {
          setCurrentElectionId(Number(data.event.electionId));
        } else {
          setCurrentElectionId(null);
        }
      } catch {
        setCurrentElectionId(null);
      }
    }
    fetchCurrentElectionId();
  }, []);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/blockchain/archived-results`
            : "/api/blockchain/archived-results"
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setResults(data.results); // Store full objects
        } else {
          setError("No results found.");
        }
      } catch (err) {
        setError("Failed to fetch results.");
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let voterRaw = localStorage.getItem('voter');
      let validVoter = false;
      try {
        if (voterRaw) {
          const voterObj = JSON.parse(voterRaw);
          validVoter = voterObj && typeof voterObj === 'object' && Object.keys(voterObj).length > 0;
        }
      } catch (e) {
        validVoter = false;
      }
      setIsLoggedIn(validVoter);
      setMounted(true);
    }
    const handleStorage = () => {
      let voterRaw = localStorage.getItem('voter');
      let validVoter = false;
      try {
        if (voterRaw) {
          const voterObj = JSON.parse(voterRaw);
          validVoter = voterObj && typeof voterObj === 'object' && Object.keys(voterObj).length > 0;
        }
      } catch (e) {
        validVoter = false;
      }
      setIsLoggedIn(validVoter);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString();
  }

  function ResultDetails({ result }: { result: CategoryResult[] }) {
    if (!Array.isArray(result) || result.length === 0) {
      return <div className="text-red-400">No candidates or results available.</div>;
    }
    return (
      <div className="overflow-x-auto">
        {result.map((cat, idx) => (
          <div key={cat.category} className="mb-8">
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-red-400 to-yellow-300 bg-clip-text text-transparent mb-2 drop-shadow bg-[length:100%_100%] bg-no-repeat">{cat.category}</h3>
            {cat.candidates.length === 0 ? (
              <div className="text-white mb-4">No candidates for this category.</div>
            ) : (
              <table className="min-w-full text-left border-separate border-spacing-y-2 mb-4">
                <thead>
                  <tr className="text-lg">
                    <th className="pr-6 bg-gradient-to-r from-pink-400 via-red-400 to-yellow-300 bg-clip-text text-transparent bg-[length:100%_100%] bg-no-repeat">Candidate</th>
                    <th className="pr-6 bg-gradient-to-r from-pink-400 via-red-400 to-yellow-300 bg-clip-text text-transparent bg-[length:100%_100%] bg-no-repeat">Votes</th>
                    <th className="pr-6 bg-gradient-to-r from-pink-400 via-red-400 to-yellow-300 bg-clip-text text-transparent bg-[length:100%_100%] bg-no-repeat">Winner</th>
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
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#05080f] to-[#00040a] text-gray-100 font-sans">
      {/* Navbar */}
      <header className="backdrop-blur-sm bg-gradient-to-r from-[#0b0f1a]/70 to-[#05080f]/70 border-b border-white/10 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={() => router.back()} className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full w-10 h-10 p-0 backdrop-blur-md border border-white/20 shadow-[0_6px_24px_rgba(255,100,100,0.35)] transition-all duration-300 active:scale-95 active:font-bold">
              <span className="text-white text-base font-normal">&#8592;</span>
            </Button>
            <img src="/perfect1.png" alt="Logo" className="w-10 h-10" />
            <h2 className="text-2xl font-bold text-white/80 tracking-wide font-poppins">
              VoteChain
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {!mounted ? null : isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full"
                >
                  Account
                </Button>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-0 mt-2 w-36 rounded-md px-3 py-1.5 z-50
                      bg-gradient-to-t from-white/10 via-white/5 to-transparent
                      backdrop-blur-lg border border-white/10
                      flex flex-col space-y-1"
                  >
                    <Link href="/votenow/account">
                      <div className="text-white/80 text-sm py-1 cursor-pointer transition duration-200 hover:text-red-400">
                        Details
                      </div>
                    </Link>
                    <div
                      onClick={() => {
                        localStorage.removeItem("voter");
                        setAccountOpen(false);
                        window.location.href = "/login";
                      }}
                      className="text-white/80 text-sm py-1 cursor-pointer transition duration-200 hover:text-red-400"
                    >
                      Logout
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center py-12 px-2">
        <h1 className="text-4xl font-bold text-red-400 mb-8">Election Results</h1>
        {loading ? (
          <div className="text-white/70 text-lg">Loading results...</div>
        ) : error ? (
          <div className="text-red-400 text-lg">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-white/70 text-lg">Results will be displayed here once published by the admin.</div>
        ) : (
          <div className="w-full max-w-2xl flex flex-col gap-6">
            {results.map((result, idx) => {
              const isCurrent = currentElectionId && result.blockchainElectionId === currentElectionId;
              return (
                <Card
                  key={result.blockchainElectionId || idx}
                  className={`w-full transition-all duration-200 bg-gradient-to-br from-green-900/30 via-emerald-800/20 to-cyan-900/10 backdrop-blur-xl border border-emerald-400/20 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)] rounded-2xl ${isCurrent ? "border-4 border-yellow-400 shadow-lg" : ""}`}
                >
                  <CardContent>
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpenIndex(idx === openIndex ? null : idx)}>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow bg-[length:100%_100%] bg-no-repeat">
                          {result.title || `Election #${results.length - idx}`}
                        </div>
                        {isCurrent && (
                          <span className="ml-2 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-bold animate-pulse">Current</span>
                        )}
                      </div>
                      <Button variant="none" className="text-emerald-300 text-lg px-4 py-1.5">
                        {openIndex === idx ? "▲" : "▼"}
                      </Button>
                    </div>
                    {openIndex === idx && (
                      <div className="mt-4">
                        <ResultDetails result={result.results} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
} 