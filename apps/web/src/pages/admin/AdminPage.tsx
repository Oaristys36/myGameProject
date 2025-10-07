import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StoryService, type Story } from '../../lib/storyService';

export function AdminPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{ title: string; description: string; imageUrl?: string; audioUrl?: string }>(
    { title: '', description: '', imageUrl: '', audioUrl: '' }
  );
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const data = await StoryService.getStories();
      setStories(data);
      setError(null);
    } catch (e) {
      setError('Impossible de charger les histoires');
    } finally {
      setLoading(false);
    }
  }

  async function onCreateStory(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      // firstNode is optional when creating; omit here
      await StoryService.createStory({
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl || undefined,
        audioUrl: form.audioUrl || undefined,
      });
      setForm({ title: '', description: '', imageUrl: '', audioUrl: '' });
      await refresh();
    } catch (e) {
      console.error(e);
      setError("La création a échoué");
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Supprimer cette histoire ?')) return;
    try {
      await StoryService.deleteStory(id);
      await refresh();
    } catch (e) {
      console.error(e);
      setError('Suppression impossible');
    }
  }

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Administration des histoires</h1>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Créer une histoire</h2>
          <form onSubmit={onCreateStory} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Titre</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full border rounded p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full border rounded p-2" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Image URL (optionnel)</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="mt-1 w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Audio URL (optionnel)</label>
                <input value={form.audioUrl} onChange={(e) => setForm({ ...form, audioUrl: e.target.value })} className="mt-1 w-full border rounded p-2" />
              </div>
            </div>
            <button disabled={creating} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              {creating ? 'Création...' : 'Créer'}
            </button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Toutes les histoires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded shadow flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-gray-600">{s.description}</div>
                </div>
                <div className="flex gap-2">
                  <Link className="px-3 py-1 bg-blue-600 text-white rounded" to={`/admin/story/${s.id}`}>Éditer</Link>
                  <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(s.id)}>Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}