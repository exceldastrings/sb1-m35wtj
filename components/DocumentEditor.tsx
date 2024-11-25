'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DocumentEditorProps {
  content: string;
  onUpdate: (content: string) => void;
}

export default function DocumentEditor({ content, onUpdate }: DocumentEditorProps) {
  const { user } = useAuth();
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const websocketProvider = new WebsocketProvider(
      'wss://demos.yjs.dev',
      'document-collaboration',
      ydoc
    );
    setProvider(websocketProvider);

    return () => {
      websocketProvider.destroy();
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Collaboration.configure({
        document: provider?.doc,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: user?.email?.split('@')[0] || 'Anonymous',
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
      <div className="min-h-[500px] w-full p-4 rounded-lg border bg-card">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}