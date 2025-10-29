"use client";

import React, { useState, useEffect } from 'react';
import { Tables } from '@/types/supabase';

type Scene = Tables<'scenes'>;

interface SceneEditorProps {
  scene: Scene | null;
  onSave: (scene: Scene) => void;
  onClose: () => void;
}

export function SceneEditor({ scene, onSave, onClose }: SceneEditorProps) {
  const [editedScene, setEditedScene] = useState<Scene | null>(scene);

  useEffect(() => {
    setEditedScene(scene);
  }, [scene]);

  if (!editedScene) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedScene(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedScene) {
      onSave(editedScene);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Editar Escena</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Título
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              value={editedScene.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              value={editedScene.description}
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="comments" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Comentarios
            </label>
            <textarea
              id="comments"
              name="comments"
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              value={editedScene.comments}
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="still" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Still de Referencia
            </label>
            <input
              type="file"
              id="still"
              name="still"
              accept="image/*"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              onChange={(e) => {
                // Placeholder for file upload logic
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setEditedScene(prev => prev ? { ...prev, still_url: reader.result as string } : null);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {editedScene.still_url && (
              <img src={editedScene.still_url} alt="Still de referencia" className="mt-4 w-full h-auto rounded-lg" />
            )}
          </div>
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}