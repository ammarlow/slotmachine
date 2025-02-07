"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SlotMachine = () => {
  const [reels, setReels] = useState(["🍎", "🍊", "🍇"]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(1000);
  const [betAmount, setBetAmount] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const symbols = ["🍎", "🍊", "🍇", "🍋", "🍒", "7️⃣", "⭐"];

  const winningCombinations: Record<string, number> = {
    "7️⃣7️⃣7️⃣": 1000,
    "⭐⭐⭐": 500,
    "🍒🍒🍒": 300,
    "🍇🍇🍇": 200,
    "🍊🍊🍊": 150,
    "🍎🍎🍎": 150,
    "🍋🍋🍋": 150,
    "🍒🍒": 50,
    "⭐⭐": 40,
  };

  // Sound effects function
  const playSound = useCallback(
    (type: any) => {
      if (isMuted) return;

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === "spin") {
        // Spinning sound - sweep from high to low frequency
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(
          300,
          audioContext.currentTime + 0.2
        );
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + 0.2
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } else if (type === "win") {
        // Win sound - happy ascending arpeggio
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);

          osc.frequency.setValueAtTime(
            freq,
            audioContext.currentTime + i * 0.1
          );
          gain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.1);
          gain.gain.linearRampToValueAtTime(
            0.1,
            audioContext.currentTime + i * 0.1 + 0.05
          );
          gain.gain.linearRampToValueAtTime(
            0,
            audioContext.currentTime + i * 0.1 + 0.15
          );

          osc.start(audioContext.currentTime + i * 0.1);
          osc.stop(audioContext.currentTime + i * 0.1 + 0.15);
        });
      } else if (type === "click") {
        // Click sound for buttons
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + 0.1
        );
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    },
    [isMuted]
  );

  const checkWin = useCallback(
    (currentReels: any) => {
      const reelString = currentReels.join("");

      // Check for three of a kind
      if (
        currentReels[0] === currentReels[1] &&
        currentReels[1] === currentReels[2]
      ) {
        const prize = winningCombinations[reelString];
        if (prize) {
          setScore((prev) => prev + prize);
          setMessage(`Winner! +${prize} credits!`);
          playSound("win");
          return;
        }
      }

      // Check for two of a kind (first two positions only)
      const twoReelString = currentReels.slice(0, 2).join("");
      if (currentReels[0] === currentReels[1]) {
        const prize = winningCombinations[twoReelString];
        if (prize) {
          setScore((prev) => prev + prize);
          setMessage(`Winner! +${prize} credits!`);
          playSound("win");
          return;
        }
      }

      setMessage("Try again!");
    },
    [winningCombinations, playSound]
  );

  const spinReel = useCallback(() => {
    if (score < betAmount) {
      setMessage("Not enough credits!");
      return;
    }

    playSound("spin");
    setIsSpinning(true);
    setMessage("");
    setScore((prev) => prev - betAmount);

    let spinCount = 0;
    const spinInterval = setInterval(() => {
      setReels((prevReels) =>
        prevReels.map(() => symbols[Math.floor(Math.random() * symbols.length)])
      );
      spinCount++;
      if (spinCount % 3 === 0) {
        playSound("spin");
      }
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      setIsSpinning(false);

      const finalReels = reels.map(
        () => symbols[Math.floor(Math.random() * symbols.length)]
      );
      setReels(finalReels);
      checkWin(finalReels);
    }, 2000);
  }, [score, betAmount, symbols, reels, checkWin, playSound]);

  const adjustBet = useCallback(
    (amount: number) => {
      playSound("click");
      const newBet = Math.max(100, Math.min(500, betAmount + amount));
      setBetAmount(newBet);
    },
    [betAmount, playSound]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 via-blue-600 to-rose-400">
      <Card className="w-96 bg-gray-800 shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white">
              <div className="text-2xl font-bold">Credits: {score}</div>
              <div className="text-xl">Bet: {betAmount}</div>
            </div>
            <Button
              onClick={() => {
                playSound("click");
                setIsMuted(!isMuted);
              }}
              className="bg-gray-600 hover:bg-gray-700"
            >
              {isMuted ? "🔇" : "🔊"}
            </Button>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-4xl shadow-inner"
              >
                {symbol}
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-2 mb-8">
            <Button
              onClick={() => adjustBet(-100)}
              disabled={betAmount <= 100 || isSpinning}
              className="bg-blue-500 hover:bg-blue-600"
            >
              - Bet
            </Button>
            <Button
              onClick={() => adjustBet(100)}
              disabled={betAmount >= 500 || isSpinning}
              className="bg-blue-500 hover:bg-blue-600"
            >
              + Bet
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={spinReel}
              disabled={isSpinning || score < betAmount}
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 transition-colors mb-4"
            >
              {isSpinning ? "Spinning..." : "SPIN!"}
            </Button>
          </div>

          <div className="text-white text-center text-lg font-bold">
            {message}
          </div>
        </CardContent>
      </Card>

      <Card className="w-96 mt-4 bg-gray-800 shadow-xl">
        <CardContent className="p-4">
          <div className="text-white text-sm">
            <h3 className="text-lg font-bold mb-2">Winning Combinations:</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(winningCombinations).map(([combo, prize]) => (
                <div key={combo} className="flex justify-between">
                  <span>{combo}</span>
                  <span>{prize} credits</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SlotMachine;
