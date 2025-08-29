'use client';

import { useEffect, useState, useRef } from 'react';
import { UserCard, type User } from '@/components/user-card';
import { UserListItem } from '@/components/user-list-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const initialUsers: User[] = [];

export default function Home() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const prevUserCount = useRef(users.length);

  // Seed functionality removed in production builds

  useEffect(() => {
    const colRef = collection(db, 'kyc-users');
    const unsubscribe = onSnapshot(colRef, snap => {
      const pending: User[] = [];
      const approved: User[] = [];
      const rejected: User[] = [];
      snap.docs.forEach(d => {
        const data: any = d.data();
        const user: User = {
          id: d.id,
          name: data.name ?? 'Unknown',
          db: data.db ?? 'Firestore',
          image: data.image ?? '',
          imageHint: data.imageHint ?? 'face',
          dateOfBirth: data.dateOfBirth ?? '',
          idNumber: data.idNumber ?? '',
          idType: data.idType ?? '',
          idImage: data.idImage ?? 'https://picsum.photos/400/250?random=20',
          selfie: data.selfie ?? 'https://picsum.photos/200/200?random=21',
          reference: data.reference ?? data.refNumber ?? undefined,
          faceMatchScore: data.faceMatchScore != null ? Number(data.faceMatchScore) : undefined,
          confidence: data.confidence != null ? Number(data.confidence) : undefined,
        };
        if (data.status === 'approved') approved.push(user);
        else if (data.status === 'rejected') rejected.push(user);
        else pending.push(user);
      });
      setUsers(pending);
      setApprovedUsers(approved);
      setRejectedUsers(rejected);
    }, err => {
      console.error('Failed to listen to users from Firestore', err);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const currentUserCount = users.length;
    if (currentUserCount > prevUserCount.current) {
      toast({
        title: 'New User Added!',
        description: `${currentUserCount - prevUserCount.current} new user(s) added.`,
      });
    }
    prevUserCount.current = currentUserCount;
  }, [users]);

  const findAndMoveUser = async (id: string, targetList: 'approved' | 'rejected') => {
    const userToMove = users.find(u => u.id === id);
    if (!userToMove) return;

    // Optimistic UI update
    if (targetList === 'approved') {
      setApprovedUsers(prev => [userToMove, ...prev]);
    } else {
      setRejectedUsers(prev => [userToMove, ...prev]);
    }
    setUsers(currentUsers => currentUsers.filter(user => user.id !== id));

    try {
      await updateDoc(doc(db, 'kyc-users', id), {
        status: targetList,
        reviewedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to update user status in Firestore', err);
      // Optional: revert optimistic update if needed
    }
  };

  const updateUserStatus = async (id: string, target: 'approved' | 'rejected' | 'pending') => {
    // update UI optimistically
    // Find user in any list
    let user: User | undefined = users.find(u => u.id === id) || approvedUsers.find(u => u.id === id) || rejectedUsers.find(u => u.id === id);
    if (!user) return;

    // Remove from all lists
    setUsers(prev => prev.filter(u => u.id !== id));
    setApprovedUsers(prev => prev.filter(u => u.id !== id));
    setRejectedUsers(prev => prev.filter(u => u.id !== id));

    if (target === 'approved') setApprovedUsers(prev => [user!, ...prev]);
    else if (target === 'rejected') setRejectedUsers(prev => [user!, ...prev]);
    else setUsers(prev => [user!, ...prev]);

    try {
      await updateDoc(doc(db, 'kyc-users', id), {
        status: target,
        reviewedAt: target === 'pending' ? null : serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to update user status in Firestore', err);
      // no rollback for now
    }
  };


  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-4xl font-bold text-primary font-headline tracking-tight">Kyc Admin</h1>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                className="w-full sm:w-80"
                placeholder="Search by reference..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-lg">
            Review and approve new user registrations.
          </p>
        </header>

        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users
              .filter(u => {
                if (!searchTerm.trim()) return true;
                const refVal = (u.reference ?? '').toString().toLowerCase();
                return refVal.includes(searchTerm.trim().toLowerCase());
              })
              .map(user => (
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
            <p className="text-muted-foreground mt-2">You&apos;ve reviewed all pending users.</p>
          </div>
        )}

        {(approvedUsers.length > 0 || rejectedUsers.length > 0) && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Approved Users</h2>
              {approvedUsers.length > 0 ? (
                <div className="space-y-3">
                  {approvedUsers
                    .filter(u => {
                      if (!searchTerm.trim()) return true;
                      const refVal = (u.reference ?? '').toString().toLowerCase();
                      return refVal.includes(searchTerm.trim().toLowerCase());
                    })
                    .map(user => <UserListItem key={user.id} user={user} status="approved" onChangeStatus={updateUserStatus} />)}
                </div>
              ) : (
                <p className="text-muted-foreground">No users approved yet.</p>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Rejected Users</h2>
                  {rejectedUsers.length > 0 ? (
                <div className="space-y-3">
                  {rejectedUsers
                    .filter(u => {
                      if (!searchTerm.trim()) return true;
                      const refVal = (u.reference ?? '').toString().toLowerCase();
                      return refVal.includes(searchTerm.trim().toLowerCase());
                    })
                    .map(user => <UserListItem key={user.id} user={user} status="rejected" onChangeStatus={updateUserStatus} />)}
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
