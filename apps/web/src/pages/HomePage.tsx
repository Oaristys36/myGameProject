import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {type Story, type StoryProgress, StoryService } from '../lib/storyService';
import { StoryCard } from '../components/StoryCard';

export function HomePage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, StoryProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [user]);

  const loadContent = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Charger les histoires
      const storiesData = await StoryService.getStories();
      setStories(storiesData);

      // Charger les progressions
      const progressData = await StoryService.getAllUserProgress(user.id);
      const progressRecord = progressData.reduce((acc, progress) => ({
        ...acc,
        [progress.storyId]: progress
      }), {});
      setProgressMap(progressRecord);

    } catch (error) {
      console.error('Erreur lors du chargement du contenu:', error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const storiesInProgress = stories.filter(story => progressMap[story.id]);
  const newStories = stories.filter(story => !progressMap[story.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {storiesInProgress.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Histoires en cours</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {storiesInProgress.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                progress={progressMap[story.id]}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {storiesInProgress.length > 0 ? 'Nouvelles histoires' : 'Histoires disponibles'}
        </h2>
        {newStories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newStories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Aucune nouvelle histoire disponible pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
