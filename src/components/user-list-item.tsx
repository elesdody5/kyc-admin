'use client';

import Image from 'next/image';
import { User } from '@/components/user-card';
import { Card, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button';

type UserListItemProps = {
  user: User;
  status: 'approved' | 'rejected';
  onChangeStatus?: (id: string, target: 'approved' | 'rejected' | 'pending') => void;
};

export function UserListItem({ user, status, onChangeStatus }: UserListItemProps) {
  const statusIcon = status === 'approved' ? 
    <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
    <XCircle className="h-5 w-5 text-red-500" />;

  return (
    <Dialog>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={user.image} alt={user.name} data-ai-hint={user.imageHint} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.idType.split('-').pop()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusIcon}
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Eye className="h-5 w-5" />
                <span className="sr-only">View Details</span>
              </Button>
            </DialogTrigger>
          </div>
        </CardHeader>
      </Card>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
             <Avatar className="h-16 w-16 border">
              <AvatarImage src={user.image} alt={user.name} data-ai-hint={user.imageHint} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {user.name}
          </DialogTitle>
          <DialogDescription>
            Here are the details for this user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <p className="text-sm font-medium">Status</p>
              <Badge variant={status === 'approved' ? 'default' : 'destructive'} className={cn(status === 'approved' && 'bg-green-600')}>
                {status === 'approved' ? 'Approved' : 'Rejected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-sm text-muted-foreground">{user.dateOfBirth}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <p className="text-sm font-medium">ID Type</p>
              <p className="text-sm text-muted-foreground">{user.idType}</p>
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3">
              <p className="text-sm font-medium">ID Number</p>
              <p className="text-sm text-muted-foreground">{user.idNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">ID Image</p>
                <Image src={user.idImage} alt="ID Image" width={400} height={250} className="rounded-lg border" data-ai-hint="id card" />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Selfie</p>
                <Image src={user.selfie} alt="Selfie" width={200} height={200} className="rounded-lg border" data-ai-hint={user.imageHint}/>
              </div>
            </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          {status === 'approved' ? (
            <>
              <Button variant="outline" onClick={() => onChangeStatus?.(user.id, 'rejected')}>
                Mark Rejected
              </Button>
              <Button onClick={() => onChangeStatus?.(user.id, 'pending')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Revert to Pending
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onChangeStatus?.(user.id, 'approved')}>
                Mark Approved
              </Button>
              <Button onClick={() => onChangeStatus?.(user.id, 'pending')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Revert to Pending
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
