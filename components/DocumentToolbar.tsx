'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Share, Undo } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Document {
  id: string;
  title: string;
}

interface DocumentToolbarProps {
  document: Document;
  onUpdate: (updates: Partial<Document>) => Promise<void>;
}

export default function DocumentToolbar({ document, onUpdate }: DocumentToolbarProps) {
  const [title, setTitle] = useState(document.title);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleTitleUpdate = async () => {
    try {
      await onUpdate({ title });
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Document title updated',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update title',
      });
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center space-x-4">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-64"
              autoFocus
              onBlur={handleTitleUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleUpdate()}
            />
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
              <Undo className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <h2
            className="text-2xl font-semibold cursor-pointer hover:text-primary"
            onClick={() => setIsEditing(true)}
          >
            {document.title}
          </h2>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}