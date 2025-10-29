"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/types/supabase';
import { useHotkeys } from '@/hooks/useHotkeys';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

type Project = Tables<'projects'>;

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadUserDataAndProjects = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error al cargar proyectos:', error.message);
          setError('Error al cargar proyectos.');
        } else {
          setProjects(data || []);
        }
      }
      setLoading(false);
    };

    loadUserDataAndProjects();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserDataAndProjects(); // Recargar proyectos si la sesión cambia
      } else {
        setUser(null);
        setProjects([]);
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
    } else {
      router.push('/login');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newProjectName.trim()) {
      setError('El nombre del proyecto no puede estar vacío.');
      return;
    }
    if (!user) {
      setError('Usuario no autenticado.');
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name: newProjectName, user_id: user.id }])
      .select();

    if (error) {
      console.error('Error al crear proyecto:', error.message);
      setError('Error al crear proyecto.');
    } else {
      setProjects([...projects, data[0]]);
      setNewProjectName('');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      return;
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error al eliminar proyecto:', error.message);
      setError('Error al eliminar proyecto.');
    } else {
      setProjects(projects.filter(project => project.id !== projectId));
    }
  };

  useHotkeys({
    'shift+1': () => router.push('/dashboard'),
    // Add more module navigation hotkeys here
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-900 dark:text-white">Cargando dashboard...</p>
      </div>
    );
  }

  if (!user) {
    // Redirección ya manejada por AuthGuard y el useEffect
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-red-600 dark:hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bienvenido, {user.email}! Aquí podrás gestionar tus proyectos.
      </p>

      {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Crear Nuevo Proyecto</h2>
        <form onSubmit={handleCreateProject} className="flex gap-4">
          <input
            type="text"
            placeholder="Nombre del proyecto"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-green-600 dark:hover:bg-green-700"
          >
            Crear
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Mis Proyectos</h2>
        {projects.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">
            Aún no tienes proyectos. ¡Crea uno para empezar!
          </p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li key={project.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-2">
                <span className="text-gray-900 dark:text-white">{project.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/playground/${project.id}`)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm focus:outline-none focus:shadow-outline dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Abrir
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm focus:outline-none focus:shadow-outline dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => {
                      const email = prompt('Introduce el email del usuario a invitar:');
                      if (email) {
                        // Placeholder for invite logic
                        alert(`Invitación enviada a ${email}`);
                      }
                    }}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm focus:outline-none focus:shadow-outline dark:bg-purple-600 dark:hover:bg-purple-700"
                  >
                    Compartir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}