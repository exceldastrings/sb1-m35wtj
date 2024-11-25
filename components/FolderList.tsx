'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, FolderOpen, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import RenameFolderDialog from './RenameFolderDialog';

interface Folder {
  id: string;
  name: string;
  documents: { count: number }[];
}

interface FolderListProps {
  folders: Folder[];
  onUpdate: () => void;
}

export default function FolderList({ folders, onUpdate }: FolderListProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const deleteFolder = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onUpdate();
      toast({
        title: 'Success',
        description: 'Folder deleted successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete folder',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder) => (
          <Card key={folder.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{folder.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/folders/${folder.id}`} className="flex items-center">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Open
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedFolder(folder);
                      setIsRenameDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteFolder(folder.id)}
                    disabled={loading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {folder.documents[0]?.count || 0} documents
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <RenameFolderDialog
        folder={selectedFolder}
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onFolderRenamed={onUpdate}
      />
    </>
  );
}