'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DocumentList from '@/components/DocumentList';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/components/AppLayout';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch documents',
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
          <h1 className="text-3xl font-bold">My Documents</h1>
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
          <DocumentList documents={documents} onUpdate={fetchDocuments} />
        )}
      </div>
    </AppLayout>
  );
}