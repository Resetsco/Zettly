"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Tables } from '@/types/supabase';
import { useHotkeys } from '@/hooks/useHotkeys';

type Keyframe = Tables<'keyframes'>;
type Scene = Tables<'scenes'>;

interface MediaPlayerProps {
  scenes: Scene[];
  keyframes: Keyframe[];
  onAddKeyframe: (keyframe: Keyframe) => void;
  onDeleteAllKeyframes: () => void;
}

export function MediaPlayer({ scenes, keyframes, onAddKeyframe, onDeleteAllKeyframes }: MediaPlayerProps) {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showKeyframeMenu, setShowKeyframeMenu] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioSrc(URL.createObjectURL(file));
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [audioSrc]);

  const handleSeekRelative = useCallback((offset: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + offset));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  useHotkeys({
    'arrowleft': () => handleSeekRelative(-5),
    'arrowright': () => handleSeekRelative(5),
    ' ': togglePlayPause,
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex items-center gap-4">
        <input type="file" accept="audio/mp3,audio/wav" onChange={handleFileChange} />
        {audioSrc && (
          <>
            <audio ref={audioRef} src={audioSrc} />
            <button onClick={togglePlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
            />
            <div className="flex-grow">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full"
              />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {new Date(currentTime * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
              </div>
              <div className="relative w-full h-2">
                {keyframes.map(keyframe => (
                  <div
                    key={keyframe.id}
                    className="absolute top-0 h-full w-1"
                    style={{ left: `${(keyframe.timestamp / duration) * 100}%`, backgroundColor: keyframe.color }}
                    title={`${keyframe.name} at ${new Date(keyframe.timestamp * 1000).toISOString().substr(14, 5)}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        <button onClick={() => setShowKeyframeMenu(true)} className="bg-yellow-500 text-white p-2 rounded">Add Keyframe</button>
        <button onClick={onDeleteAllKeyframes} className="bg-red-500 text-white p-2 rounded">Delete All Keyframes</button>
        {showKeyframeMenu && (
          <div className="absolute bottom-16 left-0 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg">
            <h3 className="font-bold mb-2">Add Keyframe</h3>
            <select className="mb-2 w-full">
              {scenes.map(scene => (
                <option key={scene.id} value={scene.id}>{scene.title}</option>
              ))}
            </select>
            <input type="text" placeholder="Name" className="mb-2 w-full" />
            <input type="color" className="mb-2 w-full" />
            <button onClick={() => {
              // Placeholder for onAddKeyframe
              setShowKeyframeMenu(false);
            }} className="bg-blue-500 text-white p-2 rounded w-full">Save</button>
          </div>
        )}
      </div>
    </div>
  );
}