'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './mode-toggle';
import Link from 'next/link';
import { FileText, FolderKanban, User } from 'lucide-react';

export default function Navbar() {
  const { signOut, user } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="font-semibold text-xl">
            DocCollab
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2 hover:text-primary">
              <FileText size={20} />
              <span>Documents</span>
            </Link>
            <Link href="/folders" className="flex items-center space-x-2 hover:text-primary">
              <FolderKanban size={20} />
              <span>Folders</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <User size={20} />
            </Button>
          </Link>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}