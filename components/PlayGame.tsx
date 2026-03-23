"use client";

import React from "react";
import Image from "next/image";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import Share from "./icons/Share";
import Replay from "./icons/Replay";
import { HuntCards } from "./HuntCards";
import { get_hunt, get_clue_info } from "@/lib/contracts/hunt";

// ✅ Import PlayerProgressPanel for progress display
import { PlayerProgressPanel } from "@/components/PlayerProgressPanel";

interface Hunt {
  id: number;
  title: string;
  description: string;
  link: string;
  code: string;
  points?: number;
}

interface PlayGameProps {
  hunts: Hunt[];
  gameName: string;
  onExit: () => void;
  onGameComplete: () => void;
  gameCompleteModal: React.ReactNode;
  /** Overall hunt/game ID from the contract. When provided, answers are submitted on-chain. */
  huntId?: number;
}

export function PlayGame({
  hunts: huntsProp,
  gameName,
  onExit,
  onGameComplete,
  gameCompleteModal,
  huntId,
}: PlayGameProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [fetchedClues, setFetchedClues] = useState<Hunt[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solvedClues, setSolvedClues] = useState<Set<number>>(new Set());

  // ✅ Fix for #48: derived solvedCount from solvedClues
  //    This ensures solvedCount is declared and avoids crashes
  const solvedCount = solvedClues.size;

  useEffect(() => {
    if (huntId == null) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchClues() {
      try {
        const huntInfo = await get_hunt(huntId!);
        const clues: Hunt[] = [];
        for (let i = 0; i < huntInfo.totalClues; i++) {
          const clue = await get_clue_info(huntId!, i);
          clues.push({
            id: clue.id,
            title: clue.question,
            description: `${clue.points} pts`,
            link: "",
            code: "",
            points: clue.points,
          });
        }
        if (!cancelled) {
          setFetchedClues(clues);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch clues",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchClues();
    return () => {
      cancelled = true;
    };
  }, [huntId]);

  const hunts = fetchedClues ?? huntsProp;

  const handleScoreUpdate = (points: number) => {
    setScore((prev) => prev + points);
    // ✅ Removed setSolvedCount; solvedCount is derived from solvedClues
  };

  const handleClueUnlock = (clueIndex: number) => {
    const clue = hunts[clueIndex];
    if (clue) {
      setSolvedClues((prev) => new Set(prev).add(clue.id));
    }
    if (clueIndex < hunts.length - 1) {
      setCurrentCardIndex(clueIndex + 1);
    } else {
      onGameComplete();
    }
  };

  const handleExit = () => {
    setError(null);
    onExit();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-blue-100 bg-purple-100 to-[#f9f9ff] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Button variant="ghost" onClick={handleExit}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 bg-purple-100 to-[#f9f9ff]">
      <Header balance="24.2453" />

      <div className="max-w-[1500px] px-14 pt-10 pb-12 bg-white mx-auto rounded-4xl relative">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={handleExit}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="w-6 h-6 fill-[#0C0C4F]" />
            <span className="bg-gradient-to-b from-[#3737A4] to-[#0C0C4F] text-transparent bg-clip-text text-xl font-normal">
              Go Home
            </span>
          </Button>
          <div className="text-right ml-auto">
            <span className="bg-gradient-to-b from-[#E3225C] to-[#7B1C4A] text-transparent bg-clip-text text-xl font-normal">
              Edit Game
            </span>
            <br />
            <span className="text-sm bg-gradient-to-b from-[#787884] to-[#576065] text-transparent bg-clip-text">
              (Only You Can See This)
            </span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[#0C0C4F] shadow-lg absolute left-1/2 top-1 -translate-x-1/2 -translate-y-1/2">
            <Image src="/icons/logo.png" alt="Logo" width={96} height={96} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b to-[#3737A4] from-[#0C0C4F] bg-clip-text text-transparent mb-6">
            Play {gameName}
          </h1>

          {/* ✅ Player progress panel using fixed solvedCount */}
          <PlayerProgressPanel
            cluesSolved={solvedCount}
            totalClues={hunts.length}
            totalPoints={score}
          />

          <div className="flex justify-center gap-4 mb-8">
            <Button className="bg-gradient-to-b from-[#E3225C] to-[#7B1C4A] hover:bg-pink-600 text-white px-6 py-2 rounded-full flex items-center gap-2">
              <Replay /> Reset
            </Button>
            <Button className="bg-gradient-to-b from-[#39A437] to-[#194F0C] hover:bg-green-700 text-white px-6 py-2 rounded-full flex items-center gap-2">
              <Share />
              Share Link
            </Button>
          </div>
        </div>

        {/* Updated layout for centered first card and right-positioned subsequent cards */}
        <div className="relative flex justify-center mt-8 min-h-[500px] overflow-x-auto">
          <div className="relative flex items-start justify-center w-full max-w-none px-8">
            {currentCardIndex > 0 && (
              <div className="absolute left-0 top-0 flex flex-col gap-4 mr-8">
                <div className="opacity-40 scale-60 transform origin-right">
                  <HuntCards
                    hunts={[hunts[currentCardIndex - 1]]}
                    isActive={false}
                    preview={true}
                    currentIndex={currentCardIndex}
                    totalHunts={hunts.length}
                    points={hunts[currentCardIndex - 1].points}
                    solved={solvedClues.has(hunts[currentCardIndex - 1].id)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-center mx-auto z-10">
              <HuntCards
                hunts={[hunts[currentCardIndex]]}
                isActive={true}
                isLoading={loading}
                huntId={huntId}
                onScoreUpdate={handleScoreUpdate}
                onUnlock={() => handleClueUnlock(currentCardIndex)}
                currentIndex={currentCardIndex + 1}
                totalHunts={hunts.length}
                points={hunts[currentCardIndex]?.points}
              />
            </div>

            {currentCardIndex < hunts.length - 1 && (
              <div className="absolute right-0 top-0 flex flex-col gap-6 ml-8">
                {hunts
                  .slice(currentCardIndex + 1, currentCardIndex + 3)
                  .map((hunt, index) => (
                    <div
                      key={hunt.id}
                      className="opacity-80 scale-90 transform origin-left hover:opacity-95 transition-all duration-300 border-2 border-blue-300/50 rounded-lg shadow-lg hover:border-blue-400 hover:shadow-xl"
                    >
                      <HuntCards
                        hunts={[hunt]}
                        isActive={false}
                        preview={true}
                        currentIndex={currentCardIndex + index + 2}
                        totalHunts={hunts.length}
                      />
                    </div>
                  ))}
                {currentCardIndex + 3 < hunts.length && (
                  <div className="text-center text-slate-600 text-sm mt-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    +{hunts.length - currentCardIndex - 3} more cards
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {gameCompleteModal}
    </div>
  );
}
