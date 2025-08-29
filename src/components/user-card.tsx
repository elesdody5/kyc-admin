'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

export type User = {
  id: string;
  name: string;
  db: string;
  image: string;
  imageHint: string;
  dateOfBirth: string;
  idNumber: string;
  idType: string;
  idImage: string;
  selfie: string;
  reference?: string;
  faceMatchScore?: number;
  confidence?: number;
};

type UserCardProps = {
  user: User;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export function UserCard({ user, onApprove, onReject }: UserCardProps) {
  const [isActioned, setIsActioned] = useState<'approved' | 'rejected' | null>(null);
  

  const handleAction = (action: 'approve' | 'reject') => {
    setIsActioned(action === 'approve' ? 'approved' : 'rejected');
    setTimeout(() => {
      if (action === 'approve') onApprove(user.id);
      else onReject(user.id);
    }, 300);
  };

  return (
    <Dialog>
      <Card className={cn(
          "flex flex-col transition-all duration-300 transform",
          isActioned === 'approved' && "opacity-0 scale-95",
          isActioned === 'rejected' && "opacity-0 scale-95 -rotate-3"
        )}>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16 border">
            {user.image && (
              <AvatarImage src={user.image} alt={user.name} data-ai-hint={user.imageHint} />
            )}
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <CardTitle className="truncate">{user.name}</CardTitle>
            <CardDescription>Awaiting review</CardDescription>
          </div>
        </CardHeader>
        
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Eye className="h-5 w-5" />
              <span className="sr-only">View Details</span>
            </Button>
          </DialogTrigger>
          <Button variant="outline" size="lg" onClick={() => handleAction('reject')}>
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button size="lg" onClick={() => handleAction('approve')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </CardFooter>
      </Card>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
             <Avatar className="h-16 w-16 border">
              {user.image && (
                <AvatarImage src={user.image} alt={user.name} data-ai-hint={user.imageHint} />
              )}
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {user.name}
          </DialogTitle>
          <DialogDescription>
            Here are the details for this pending user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <p className="text-sm font-medium">Status</p>
                <Badge variant="secondary">
                  Pending
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <p className="text-sm font-medium">Face Match Score</p>
                <p className="text-sm text-muted-foreground">{user.faceMatchScore != null ? `${Math.round(user.faceMatchScore * 100)}%` : '-'}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <p className="text-sm font-medium">Confidence Score</p>
                <div className="flex items-center gap-2">
                  {user.confidence != null ? (
                    <>
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            user.confidence >= 0.8 ? 'bg-green-500' : 
                            user.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.round(user.confidence * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {Math.round(user.confidence * 100)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm text-muted-foreground">{user.dateOfBirth}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <p className="text-sm font-medium">Reference</p>
                <p className="text-sm text-muted-foreground">{user.reference ?? '-'}</p>
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
                <Image src={user.selfie} alt="Selfie" width={200} height={200} className="rounded-lg border" data-ai-hint={user.imageHint} />
              </div>
            </div>

            
        </div>
      </DialogContent>
    </Dialog>
  );
}
