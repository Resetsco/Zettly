"use client";

import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import { CardScene } from './CardScene';
import { SceneEditor } from './SceneEditor';
import { SceneContextMenu, MENU_ID } from './SceneContextMenu';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useContextMenu } from 'react-contexify';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/supabase';

type Scene = Tables<'scenes'>;

export function PlaygroundCanvas({ projectId }: { projectId: string }) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  function displayMenu(e: React.MouseEvent, scene: Scene) {
    show({
      event: e,
      props: {
        scene,
      },
    });
  }

  useEffect(() => {
    const fetchScenes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('project_id', projectId)
        .order('position');

      if (error) {
        console.error('Error fetching scenes:', error);
        setError('Error fetching scenes.');
      } else {
        setScenes(data || []);
      }
      setLoading(false);
    };

    fetchScenes();
  }, [projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = scenes.findIndex((item) => item.id === active.id);
      const newIndex = scenes.findIndex((item) => item.id === over.id);
      const newScenes = arrayMove(scenes, oldIndex, newIndex);
      setScenes(newScenes);

      // Persist the new order to Supabase
      const updates = newScenes.map((scene, index) => ({
        id: scene.id,
        position: index,
      }));

      const { error } = await supabase.from('scenes').upsert(updates);
      if (error) {
        console.error('Error updating scene positions:', error);
        // Optionally, revert the UI change
        setScenes(scenes);
      }
    }
  }, [scenes]);

  const handleAddScene = useCallback(async () => {
    const newPosition = scenes.length;
    const { data, error } = await supabase
      .from('scenes')
      .insert([
        {
          project_id: projectId,
          title: `Escena ${newPosition + 1}`,
          description: 'Nueva escena',
          comments: '',
          still_url: null,
          position: newPosition,
        },
      ])
      .select();

    if (error) {
      console.error('Error creating scene:', error);
      setError('Error creating scene.');
    } else {
      setScenes((prevScenes) => [...prevScenes, data[0]]);
    }
  }, [scenes.length, projectId]);

  const handleSaveScene = async (updatedScene: Scene) => {
    const { data, error } = await supabase
      .from('scenes')
      .update(updatedScene)
      .eq('id', updatedScene.id)
      .select();

    if (error) {
      console.error('Error updating scene:', error);
      setError('Error updating scene.');
    } else {
      setScenes(scenes.map(scene => scene.id === updatedScene.id ? data[0] : scene));
      setEditingScene(null);
    }
  };

  const handleDeleteScene = useCallback(async (sceneId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta escena?')) {
      return;
    }

    const { error } = await supabase.from('scenes').delete().eq('id', sceneId);

    if (error) {
      console.error('Error deleting scene:', error);
      setError('Error deleting scene.');
    } else {
      setScenes((prevScenes) => prevScenes.filter((scene) => scene.id !== sceneId));
    }
  }, []);

  useHotkeys({
    'shift+n': handleAddScene,
    'delete': () => {
      if (editingScene) {
        handleDeleteScene(editingScene.id);
        setEditingScene(null);
      }
    },
  });

  return (
    <div>
      <button
        onClick={handleAddScene}
        className="mb-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-green-600 dark:hover:bg-green-700"
      >
        Nueva Escena (Shift+N)
      </button>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={scenes.map(scene => scene.id)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap gap-4">
            {scenes.map(scene => (
              <div key={scene.id} onDoubleClick={() => setEditingScene(scene)} onContextMenu={(e) => displayMenu(e, scene)}>
                <CardScene scene={scene} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {editingScene && (
        <SceneEditor
          scene={editingScene}
          onSave={handleSaveScene}
          onClose={() => setEditingScene(null)}
        />
      )}
      <SceneContextMenu
        onDelete={({ props }: any) => handleDeleteScene(props.scene.id)}
        onArchive={() => alert('Archive')}
        onDuplicate={() => alert('Duplicate')}
        onCopyAttributes={() => alert('Copy Attributes')}
        onCopyStill={() => alert('Copy Still')}
      />
    </div>
  );
}