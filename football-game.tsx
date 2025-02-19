import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Circle, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const FootballGame = () => {
  const [score, setScore] = useState(0);
  const [isScorer, setIsScorer] = useState(true);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [isBlocked, setIsBlocked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [showAimGuide, setShowAimGuide] = useState(false);
  const [lastPoints, setLastPoints] = useState(0);
  const fieldRef = useRef(null);

  // Define scoring zones
  const scoringZones = [
    { x: 85, y: 15, width: 10, height: 20, points: 3, color: 'bg-yellow-500' },
    { x: 85, y: 65, width: 10, height: 20, points: 3, color: 'bg-yellow-500' },
    { x: 85, y: 40, width: 10, height: 20, points: 1, color: 'bg-blue-500' },
  ];

  const checkScoring = (x, y) => {
    if (isBlocked) return 0;
    
    for (const zone of scoringZones) {
      if (
        x >= zone.x && 
        x <= zone.x + zone.width && 
        y >= zone.y && 
        y <= zone.y + zone.height
      ) {
        return zone.points;
      }
    }
    return 0;
  };

  const handleFieldClick = (e) => {
    if (!isAnimating && isScorer && fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      if (x > 66) {
        setTargetPosition({ x, y });
        handleKick(x, y);
      }
    }
  };

  const handleFieldMouseMove = (e) => {
    if (isScorer && !isAnimating && fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      if (x > 66) {
        setShowAimGuide(true);
        setTargetPosition({ x, y });
      } else {
        setShowAimGuide(false);
      }
    }
  };

  const handleFieldMouseLeave = () => {
    setShowAimGuide(false);
  };

  const handleKick = (targetX, targetY) => {
    if (isScorer && !isAnimating) {
      setIsAnimating(true);
      setBallPosition({ x: targetX, y: targetY });
      
      if (aiMode) {
        const willBlock = Math.random() < 0.4; // 40% chance to block
        setIsBlocked(willBlock);
      }
      
      setTimeout(() => {
        const points = checkScoring(targetX, targetY);
        setLastPoints(points);
        if (points > 0) {
          setScore(prev => prev + points);
        }
        
        setTimeout(() => {
          setBallPosition({ x: 50, y: 50 });
          setIsBlocked(false);
          setIsAnimating(false);
          setShowAimGuide(false);
          setLastPoints(0);
        }, 1000);
      }, 1000);
    }
  };

  const handleBlock = () => {
    if (!isScorer && !isBlocked) {
      setIsBlocked(true);
    }
  };

  const switchRole = () => {
    setIsScorer(prev => !prev);
    setIsBlocked(false);
    setBallPosition({ x: 50, y: 50 });
    setShowAimGuide(false);
    setLastPoints(0);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-b from-green-500 to-green-600">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-white">Football Challenge</CardTitle>
        <div className="text-xl text-white mb-4">Current Role: {isScorer ? 'Striker' : 'Goalkeeper'}</div>
        <div className="flex items-center justify-center gap-2 text-white">
          <span>AI Goalkeeper:</span>
          <Switch
            checked={aiMode}
            onCheckedChange={setAiMode}
            disabled={isScorer}
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Score Display */}
        <div className="mb-8 text-center">
          <div className="text-6xl font-bold text-white bg-black/30 rounded-full w-32 h-32 flex items-center justify-center mx-auto">
            {score}
          </div>
          {lastPoints > 0 && (
            <div className="text-2xl font-bold text-yellow-300 mt-2 animate-bounce">
              +{lastPoints} points!
            </div>
          )}
          <div className="text-white mt-2">GOALS</div>
        </div>

        {/* Game Field */}
        <div 
          ref={fieldRef}
          className="h-48 bg-green-700 rounded-xl relative overflow-hidden border-4 border-white cursor-crosshair"
          onClick={handleFieldClick}
          onMouseMove={handleFieldMouseMove}
          onMouseLeave={handleFieldMouseLeave}
        >
          {/* Scoring Zones */}
          {scoringZones.map((zone, index) => (
            <div
              key={index}
              className={`absolute opacity-30 ${zone.color}`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {zone.points}
              </div>
            </div>
          ))}

          {/* Goal Post */}
          <div className="absolute right-0 h-full w-16 bg-white/20 border-l-4 border-white flex items-center justify-center">
            <div className="h-32 w-4 bg-white/40 rounded"></div>
          </div>

          {/* Aim Guide */}
          {showAimGuide && isScorer && !isAnimating && (
            <div 
              className="absolute w-1 h-1 bg-red-500 rounded-full"
              style={{ 
                left: `${targetPosition.x}%`,
                top: `${targetPosition.y}%`
              }}
            />
          )}

          {/* Ball */}
          <div 
            className="absolute transition-all duration-1000"
            style={{ 
              left: `${ballPosition.x}%`,
              top: `${ballPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Circle className="w-8 h-8 text-white fill-white" />
          </div>

          {/* Blocking Shield */}
          {isBlocked && (
            <div 
              className="absolute right-16 transition-all duration-300"
              style={{ 
                top: `${targetPosition.y}%`,
                transform: 'translateY(-50%)'
              }}
            >
              <Shield className="w-12 h-12 text-red-500" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-8 flex justify-center gap-4">
          {!isScorer && !aiMode && (
            <Button
              onClick={handleBlock}
              disabled={isBlocked}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-xl"
            >
              Block!
            </Button>
          )}
          <Button
            onClick={switchRole}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 text-xl"
          >
            Switch Role
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FootballGame;
