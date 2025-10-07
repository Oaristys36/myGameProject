import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StoryService, type Story, type StoryNode, type Choice } from '../../lib/storyService';

export function StoryEditorPage() {
  const { id } = useParams();
  const storyId = id as string;
  const [story, setStory] = useState<(Story & { nodes: StoryNode[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newNode, setNewNode] = useState<{ content: string; imageUrl?: string; audioUrl?: string }>({ content: '' });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo(() => story?.nodes.find(n => n.id === selectedNodeId) ?? null, [story, selectedNodeId]);

  const [nodeEdit, setNodeEdit] = useState<Partial<StoryNode>>({});

  useEffect(() => {
    refresh();
  }, [storyId]);

  async function refresh() {
    setLoading(true);
    try {
      const data = await StoryService.getStoryById(storyId);
      setStory(data);
      if (data && data.nodes.length && !selectedNodeId) setSelectedNodeId(data.nodes[0].id);
      setError(null);
    } catch (e) {
      setError('Chargement impossible');
    } finally {
      setLoading(false);
    }
  }

  async function addNode(e: React.FormEvent) {
    e.preventDefault();
    if (!newNode.content.trim()) return;
    await StoryService.createNode(storyId, newNode);
    setNewNode({ content: '' });
    await refresh();
  }

  async function saveNodeEdits() {
    if (!selectedNode) return;
    await StoryService.updateNode(selectedNode.id, {
      content: nodeEdit.content,
      imageUrl: nodeEdit.imageUrl,
      audioUrl: nodeEdit.audioUrl,
    });
    await refresh();
  }

  async function deleteNode() {
    if (!selectedNode) return;
    if (!confirm('Supprimer ce noeud et ses choix ?')) return;
    await StoryService.deleteNode(selectedNode.id);
    setSelectedNodeId(null);
    await refresh();
  }

  async function addChoice(nodeId: string, payload: { text: string; nextNodeId: string; }) {
    await StoryService.createChoice(nodeId, payload);
    await refresh();
  }

  async function updateChoice(choiceId: string, payload: Partial<{ text: string; nextNodeId: string; }>) {
    await StoryService.updateChoice(choiceId, payload);
    await refresh();
  }

  async function deleteChoice(choiceId: string) {
    if (!confirm('Supprimer ce choix ?')) return;
    await StoryService.deleteChoice(choiceId);
    await refresh();
  }

  async function setFirstNode(nodeId: string) {
    if (!story) return;
    await StoryService.updateStory(story.id, { firstNode: nodeId });
    await refresh();
  }

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!story) return <div className="p-6">Histoire introuvable</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Édition: {story.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Noeuds</h2>
          <ul className="space-y-1">
            {story.nodes.map((n) => (
              <li key={n.id}>
                <button
                  className={`w-full text-left px-2 py-1 rounded ${selectedNodeId === n.id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                  onClick={() => { setSelectedNodeId(n.id); setNodeEdit({ content: n.content, imageUrl: n.imageUrl, audioUrl: n.audioUrl }); }}
                >
                  {n.content.slice(0, 40) || 'Sans contenu'}
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={addNode} className="mt-4 space-y-2">
            <h3 className="font-medium">Ajouter un noeud</h3>
            <textarea className="w-full border rounded p-2" placeholder="Contenu" value={newNode.content} onChange={(e) => setNewNode({ ...newNode, content: e.target.value })} />
            <input className="w-full border rounded p-2" placeholder="Image URL" value={newNode.imageUrl || ''} onChange={(e) => setNewNode({ ...newNode, imageUrl: e.target.value })} />
            <input className="w-full border rounded p-2" placeholder="Audio URL" value={newNode.audioUrl || ''} onChange={(e) => setNewNode({ ...newNode, audioUrl: e.target.value })} />
            <button className="px-3 py-2 bg-indigo-600 text-white rounded">Ajouter</button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Détails du noeud</h2>
              <div className="flex gap-2">
                {selectedNode && (
                  <button onClick={() => setFirstNode(selectedNode.id)} className="px-3 py-1 bg-emerald-600 text-white rounded">Définir comme premier noeud</button>
                )}
                <button onClick={deleteNode} className="px-3 py-1 bg-red-600 text-white rounded">Supprimer le noeud</button>
              </div>
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <textarea className="w-full border rounded p-2" rows={4} value={nodeEdit.content || ''} onChange={(e) => setNodeEdit({ ...nodeEdit, content: e.target.value })} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="w-full border rounded p-2" placeholder="Image URL" value={nodeEdit.imageUrl || ''} onChange={(e) => setNodeEdit({ ...nodeEdit, imageUrl: e.target.value })} />
                  <input className="w-full border rounded p-2" placeholder="Audio URL" value={nodeEdit.audioUrl || ''} onChange={(e) => setNodeEdit({ ...nodeEdit, audioUrl: e.target.value })} />
                </div>
                <button onClick={saveNodeEdits} className="px-3 py-2 bg-blue-600 text-white rounded">Enregistrer</button>
              </div>
            ) : (
              <div>Sélectionnez un noeud</div>
            )}
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2">Choix du noeud</h2>
            {selectedNode ? (
              <ChoicesPanel
                node={selectedNode}
                nodes={story.nodes}
                onAdd={addChoice}
                onUpdate={updateChoice}
                onDelete={deleteChoice}
              />
            ) : (
              <div>Sélectionnez un noeud pour gérer ses choix</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoicesPanel({ node, nodes, onAdd, onUpdate, onDelete }: {
  node: StoryNode;
  nodes: StoryNode[];
  onAdd: (nodeId: string, payload: { text: string; nextNodeId: string }) => Promise<void>;
  onUpdate: (choiceId: string, payload: Partial<{ text: string; nextNodeId: string }>) => Promise<void>;
  onDelete: (choiceId: string) => Promise<void>;
}) {
  const [newChoice, setNewChoice] = useState<{ text: string; nextNodeId: string }>({ text: '', nextNodeId: nodes[0]?.id || '' });

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {(node.choices || []).map((c) => (
          <ChoiceRow key={c.id} choice={c} nodes={nodes} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </ul>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Ajouter un choix</h3>
        <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <input className="flex-1 border rounded p-2" placeholder="Texte du choix" value={newChoice.text} onChange={(e) => setNewChoice({ ...newChoice, text: e.target.value })} />
          <select className="border rounded p-2" value={newChoice.nextNodeId} onChange={(e) => setNewChoice({ ...newChoice, nextNodeId: e.target.value })}>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>{n.content.slice(0, 40) || n.id}</option>
            ))}
          </select>
          <button onClick={() => onAdd(node.id, newChoice)} className="px-3 py-2 bg-indigo-600 text-white rounded">Ajouter</button>
        </div>
      </div>
    </div>
  );
}

function ChoiceRow({ choice, nodes, onUpdate, onDelete }: {
  choice: Choice;
  nodes: StoryNode[];
  onUpdate: (choiceId: string, payload: Partial<{ text: string; nextNodeId: string }>) => Promise<void>;
  onDelete: (choiceId: string) => Promise<void>;
}) {
  const [edit, setEdit] = useState<Partial<Choice>>({ text: choice.text, nextNodeId: choice.nextNodeId });

  return (
    <li className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
      <input className="flex-1 border rounded p-2" value={edit.text || ''} onChange={(e) => setEdit({ ...edit, text: e.target.value })} />
      <select className="border rounded p-2" value={edit.nextNodeId || ''} onChange={(e) => setEdit({ ...edit, nextNodeId: e.target.value })}>
        {nodes.map((n) => (
          <option key={n.id} value={n.id}>{n.content.slice(0, 40) || n.id}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button onClick={() => onUpdate(choice.id, { text: edit.text, nextNodeId: edit.nextNodeId })} className="px-3 py-1 bg-blue-600 text-white rounded">Enregistrer</button>
        <button onClick={() => onDelete(choice.id)} className="px-3 py-1 bg-red-600 text-white rounded">Supprimer</button>
      </div>
    </li>
  );
}