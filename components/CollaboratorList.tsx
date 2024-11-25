'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, X } from 'lucide-react';

interface Collaborator {
  id: string;
  email: string;
  permission: string;
}

interface CollaboratorListProps {
  documentId: string;
}

export default function CollaboratorList({ documentId }: CollaboratorListProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCollaborators();
  }, [documentId]);

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select(`
          id,
          permission,
          users:user_id (
            email
          )
        `)
        .eq('document_id', documentId);

      if (error) throw error;

      setCollaborators(data.map((c: any) => ({
        id: c.id,
        email: c.users.email,
        permission: c.permission,
      })));
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch collaborators',
      });
    }
  };

  const addCollaborator = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) throw userError;

      const { error } = await supabase
        .from('collaborators')
        .insert({
          document_id: documentId,
          user_id: userData.id,
          permission: 'view',
        });

      if (error) throw error;

      setEmail('');
      fetchCollaborators();
      toast({
        title: 'Success',
        description: 'Collaborator added successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add collaborator',
      });
    }
  };

  const removeCollaborator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchCollaborators();
      toast({
        title: 'Success',
        description: 'Collaborator removed successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove collaborator',
      });
    }
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="font-semibold mb-4">Collaborators</h3>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button size="icon" onClick={addCollaborator}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
            >
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${collaborator.email}`} />
                  <AvatarFallback>
                    {collaborator.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{collaborator.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCollaborator(collaborator.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}