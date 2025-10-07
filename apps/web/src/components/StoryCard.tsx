import { Link } from 'react-router-dom';
import type {Story, StoryProgress} from '../lib/storyService';

interface StoryCardProps {
  story: Story;
  progress?: StoryProgress;
}

export function StoryCard({ story, progress }: StoryCardProps) {
  const progressPercentage = progress ? 25 : 0; // À implémenter avec le vrai calcul de progression

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {story.imageUrl && (
        <div className="relative h-48 w-full">
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{story.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{story.description}</p>
        
        {progress && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Progression : {progressPercentage}%
            </p>
          </div>
        )}

        <Link
          to={`/story/${story.id}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {progress ? 'Continuer' : 'Commencer'}
        </Link>
      </div>
    </div>
  );
}
