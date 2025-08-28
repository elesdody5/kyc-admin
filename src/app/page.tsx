'use client';

import { useState } from 'react';
import { UserCard, type User } from '@/components/user-card';
import { UserListItem } from '@/components/user-list-item';

const initialUsers: User[] = [
  { id: 'usr_1a2b3c4d', name: 'Alice Johnson', db: 'PostgreSQL', image: 'https://picsum.photos/200/200?random=1', imageHint: 'woman face' },
  { id: 'usr_5e6f7g8h', name: 'Bob Williams', db: 'MongoDB', image: 'https://picsum.photos/200/200?random=2', imageHint: 'man portrait' },
  { id: 'usr_9i0j1k2l', name: 'Charlie Brown', db: 'Firebase', image: 'https://picsum.photos/200/200?random=3', imageHint: 'person glasses' },
  { id: 'usr_3m4n5o6p', name: 'Diana Prince', db: 'MySQL', image: 'https://picsum.photos/200/200?random=4', imageHint: 'woman smiling' },
  { id: 'usr_q7r8s9t0', name: 'Ethan Hunt', db: 'Redis', image: 'https://picsum.photos/200/200?random=5', imageHint: 'man action' },
  { id: 'usr_u1v2w3x4', name: 'Fiona Glenanne', db: 'Cassandra', image: 'https://picsum.photos/200/200?random=6', imageHint: 'woman sunglasses' },
];

export default function Home() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([]);

  const findAndMoveUser = (id: string, targetList: 'approved' | 'rejected') => {
    const userToMove = users.find(u => u.id === id);
    if (!userToMove) return;

    if (targetList === 'approved') {
      setApprovedUsers(prev => [userToMove, ...prev]);
    } else {
      setRejectedUsers(prev => [userToMove, ...prev]);
    }

    setUsers(currentUsers => currentUsers.filter(user => user.id !== id));
  };


  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-primary font-headline tracking-tight">UserDeck</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Review and approve new user registrations.
          </p>
        </header>

        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map(user => (
              <UserCard 
                key={user.id} 
                user={user} 
                onApprove={() => findAndMoveUser(user.id, 'approved')} 
                onReject={() => findAndMoveUser(user.id, 'rejected')}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-24 rounded-lg border-2 border-dashed border-border mt-10">
            <h2 className="text-2xl font-semibold text-primary">All Done!</h2>
            <p className="text-muted-foreground mt-2">You've reviewed all pending users.</p>
          </div>
        )}

        {(approvedUsers.length > 0 || rejectedUsers.length > 0) && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Approved Users</h2>
              {approvedUsers.length > 0 ? (
                <div className="space-y-3">
                  {approvedUsers.map(user => <UserListItem key={user.id} user={user} status="approved" />)}
                </div>
              ) : (
                <p className="text-muted-foreground">No users approved yet.</p>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Rejected Users</h2>
              {rejectedUsers.length > 0 ? (
                <div className="space-y-3">
                  {rejectedUsers.map(user => <UserListItem key={user.id} user={user} status="rejected" />)}
                </div>
              ) : (
                <p className="text-muted-foreground">No users rejected yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
