import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tables } from '@/types/supabase';

type Scene = Tables<'scenes'>;

interface CardSceneProps {
  scene: Scene;
}

export function CardScene({ scene }: CardSceneProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 w-64"
    >
      {scene.still_url && (
        <img src={scene.still_url} alt={`Still for ${scene.title}`} className="w-full h-32 object-cover rounded-t-lg mb-2" />
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{scene.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{scene.description}</p>
      </div>
    </div>
  );
}