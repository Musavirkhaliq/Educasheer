import React from 'react';
import { motion } from 'framer-motion';

const LevelProgress = ({ currentPoints, pointsToNextLevel }) => {
  const progressPercentage = Math.min(100, Math.round((currentPoints / pointsToNextLevel) * 100));
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-white/80 mb-1">
        <span>{currentPoints}/{pointsToNextLevel} XP</span>
        <span>{progressPercentage}%</span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-3">
        <motion.div 
          className="bg-white h-3 rounded-full shadow-glow"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default LevelProgress;
