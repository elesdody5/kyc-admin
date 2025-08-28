'use client';

import { useEffect, useState } from 'react';
import { UserCard, type User } from '@/components/user-card';
import { UserListItem } from '@/components/user-list-item';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';

const initialUsers: User[] = [
  { id: 'usr_1a2b3c4d', name: 'Alice Johnson', db: 'PostgreSQL', image: 'https://picsum.photos/200/200?random=1', imageHint: 'woman face', dateOfBirth: '1990-05-15', idNumber: 'X1234567', idType: 'Passport', idImage: 'https://picsum.photos/400/250?random=11', selfie: 'https://picsum.photos/200/200?random=1' },
  { id: 'usr_5e6f7g8h', name: 'Bob Williams', db: 'MongoDB', image: 'https://picsum.photos/200/200?random=2', imageHint: 'man portrait', dateOfBirth: '1985-09-22', idNumber: 'Y8765432', idType: 'Driving License', idImage: 'https://picsum.photos/400/250?random=12', selfie: 'https://picsum.photos/200/200?random=2' },
  { id: 'usr_9i0j1k2l', name: 'Charlie Brown', db: 'Firebase', image: 'https://picsum.photos/200/200?random=3', imageHint: 'person glasses', dateOfBirth: '2000-01-30', idNumber: 'Z5432167', idType: 'ID Card', idImage: 'https://picsum.photos/400/250?random=13', selfie: 'https://picsum.photos/200/200?random=3' },
  { id: 'usr_3m4n5o6p', name: 'Diana Prince', db: 'MySQL', image: 'https://picsum.photos/200/200?random=4', imageHint: 'woman smiling', dateOfBirth: '1992-11-08', idNumber: 'A1122334', idType: 'Passport', idImage: 'https://picsum.photos/400/250?random=14', selfie: 'https://picsum.photos/200/200?random=4' },
  { id: 'usr_q7r8s9t0', name: 'Ethan Hunt', db: 'Redis', image: 'https://picsum.photos/200/200?random=5', imageHint: 'man action', dateOfBirth: '1978-07-12', idNumber: 'B9988776', idType: 'ID Card', idImage: 'https://picsum.photos/400/250?random=15', selfie: 'https://picsum.photos/200/200?random=5' },
  { id: 'usr_u1v2w3x4', name: 'Fiona Glenanne', db: 'Cassandra', image: 'https://picsum.photos/200/200?random=6', imageHint: 'woman sunglasses', dateOfBirth: '1988-03-25', idNumber: 'C5544332', idType: 'Driving License', idImage: 'https://picsum.photos/400/250?random=16', selfie: 'https://picsum.photos/200/200?random=6' },
];

export default function Home() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<User[]>([]);

  const seedUsers = async () => {
    const samples: Array<Omit<User, 'id'> & { status?: string }> = [
      { name: 'Alice Johnson', db: 'Firestore', image: '', imageHint: 'face', dateOfBirth: '1990-05-15', idNumber: 'X1234567', idType: 'Passport', idImage: '', selfie: '', status: 'pending' },
      { name: 'Bob Williams', db: 'Firestore', image: '', imageHint: 'face', dateOfBirth: '1985-09-22', idNumber: 'Y8765432', idType: 'Driving License', idImage: '', selfie: '', status: 'pending' },
      { name: 'Charlie Brown', db: 'Firestore', image: '', imageHint: 'face', dateOfBirth: '2000-01-30', idNumber: 'Z5432167', idType: 'ID Card', idImage: '', selfie: '', status: 'pending' },
      { name: 'Diana Prince', db: 'Firestore', image: '', imageHint: 'face', dateOfBirth: '1992-11-08', idNumber: 'A1122334', idType: 'Passport', idImage: '', selfie: '', status: 'pending' },
      { name: 'Ethan Hunt', db: 'Firestore', image: '', imageHint: 'face', dateOfBirth: '1978-07-12', idNumber: 'B9988776', idType: 'ID Card', idImage: '', selfie: '', status: 'pending' },
    ];
    try {
      await Promise.all(samples.map(sample => addDoc(collection(db, 'kyc-users'), sample)));
      // Reload users after seeding
      const snap = await getDocs(collection(db, 'kyc-users'));
      const fetched: User[] = snap.docs.map(d => {
        const data: any = d.data();
        return {
          id: d.id,
          name: data.name ?? 'Unknown',
          db: data.db ?? 'Firestore',
          image: data.image ?? '',
          imageHint: data.imageHint ?? 'face',
          dateOfBirth: data.dateOfBirth ?? '',
          idNumber: data.idNumber ?? '',
          idType: data.idType ?? '',
          idImage: data.idImage ?? '',
          selfie: data.selfie ?? '',
        };
      });
      if (fetched.length > 0) setUsers(fetched);
    } catch (e) {
      console.error('Seeding users failed', e);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'kyc-users'));
        const fetched: User[] = snap.docs.map(d => {
          const data: any = d.data();
          return {
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
          };
        });
        if (fetched.length > 0) setUsers(fetched);
      } catch (err) {
        console.error('Failed to load users from Firestore', err);
      }
    };
    loadUsers();
  }, []);

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


  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-primary font-headline tracking-tight">UserDeck</h1>
            <Button variant="outline" onClick={seedUsers}>Seed Users</Button>
          </div>
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
