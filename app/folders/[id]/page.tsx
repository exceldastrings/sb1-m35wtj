'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/components/AppLayout';
import DocumentList from '@/components/DocumentList';

interface Folder {
  id: string;
  name: string;
}

export default function FolderPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchFolderAndDocuments();
    }
  }, [user, id]);

  const fetchFolderAndDocuments = async () => {
    try {
      const [folderResponse, documentsResponse] = await Promise.all([
        supabase
          .from('folders')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('documents')
          .select('*')
          .eq('folder_id', id)
          .order('updated_at', { ascending: false }),
      ]);

      if (folderResponse.error) throw folderResponse.error;
      if (documentsResponse.error) throw documentsResponse.error;

      setFolder(folderResponse.data);
      setDocuments(documentsResponse.data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch folder data',
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            title: 'Untitled Document',
            content: '',
            user_id: user?.id,
            folder_id: id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      setDocuments([data, ...documents]);
      toast({
        title: 'Success',
        description: 'New document created',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create document',
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{folder?.name || 'Loading...'}</h1>
          <Button onClick={createNewDocument}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DocumentList documents={documents} onUpdate={fetchFolderAndDocuments} />
        )}
      </div>
    </AppLayout>
  );
}