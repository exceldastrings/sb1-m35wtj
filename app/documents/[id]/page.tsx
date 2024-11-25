'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/components/AppLayout';
import DocumentEditor from '@/components/DocumentEditor';
import DocumentToolbar from '@/components/DocumentToolbar';
import CollaboratorList from '@/components/CollaboratorList';

interface Document {
  id: string;
  title: string;
  content: string;
  user_id: string;
}

export default function DocumentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchDocument();
      subscribeToChanges();
    }
  }, [user, id]);

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        router.push('/dashboard');
        return;
      }

      setDocument(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch document',
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel(`document_${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `id=eq.${id}`,
      }, (payload) => {
        if (payload.new) {
          setDocument(payload.new as Document);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateDocument = async (updates: Partial<Document>) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update document',
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!document) return null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <DocumentToolbar
          document={document}
          onUpdate={updateDocument}
        />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-3">
            <DocumentEditor
              content={document.content}
              onUpdate={(content) => updateDocument({ content })}
            />
          </div>
          <div className="lg:col-span-1">
            <CollaboratorList documentId={document.id} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}