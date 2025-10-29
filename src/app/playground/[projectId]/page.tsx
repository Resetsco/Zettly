"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/supabase';
import { PlaygroundCanvas } from '@/components/PlaygroundCanvas';
import { MediaPlayer } from '@/components/MediaPlayer';

type Project = Tables<'projects'>;
type Scene = Tables<'scenes'>;
type Keyframe = Tables<'keyframes'>;

export default function PlaygroundPage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!params.projectId) {
      return;
    }

    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.projectId)
        .single();

      if (error) {
        console.error('Error al cargar el proyecto:', error.message);
        setError('Error al cargar el proyecto.');
      } else {
        setProject(data);
      }
      setLoading(false);
    };

    fetchProject();
  }, [params.projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-900 dark:text-white">Cargando playground...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="ml-4 bg-blue-500 text-white p-2 rounded">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-900 dark:text-white">Proyecto no encontrado.</p>
        <button onClick={() => router.push('/dashboard')} className="ml-4 bg-blue-500 text-white p-2 rounded">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-800 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Volver al Dashboard
        </button>
      </div>

      {/* Área de trabajo principal (lienzo) */}
      <div className="w-full h-[calc(100vh-20rem)] bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-auto p-4">
        <PlaygroundCanvas projectId={project.id} />
      </div>
      <div className="mt-8">
        <MediaPlayer
          scenes={scenes}
          keyframes={keyframes}
          onAddKeyframe={(keyframe) => setKeyframes([...keyframes, keyframe])}
          onDeleteAllKeyframes={() => setKeyframes([])}
        />
      </div>
    </div>
  );
}