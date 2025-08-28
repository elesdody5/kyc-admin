'use client';

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
};

export function UserListItem({ user, status }: UserListItemProps) {
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
              <p className="text-sm text-muted-foreground">ID: {user.id}</p>
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
      <DialogContent>
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
            <div className="flex items-center justify-between rounded-lg border p-3">
              <p className="text-sm font-medium">Status</p>
              <Badge variant={status === 'approved' ? 'default' : 'destructive'} className={cn(status === 'approved' && 'bg-green-600')}>
                {status === 'approved' ? 'Approved' : 'Rejected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <p className="text-sm font-medium">User ID</p>
              <p className="text-sm text-muted-foreground">{user.id}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <p className="text-sm font-medium">Database</p>
              <Badge variant="outline">{user.db}</Badge>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
