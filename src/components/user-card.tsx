'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, Bot, Loader2, Sparkles, Eye } from 'lucide-react';
import { generateUserSummary } from '@/ai/flows/generate-user-summary';
import { imageUrlToDataUrl } from '@/lib/image-utils';
import { useToast } from '@/hooks/use-toast';
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
};

type UserCardProps = {
  user: User;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export function UserCard({ user, onApprove, onReject }: UserCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isActioned, setIsActioned] = useState<'approved' | 'rejected' | null>(null);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    setSummary(null);
    try {
      const dataUrl = await imageUrlToDataUrl(user.image);
      const result = await generateUserSummary({
        name: user.name,
        id: user.id,
        database: user.db,
        image: dataUrl,
      });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate user summary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

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
            <AvatarImage src={user.image} alt={user.name} data-ai-hint={user.imageHint} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <CardTitle className="truncate">{user.name}</CardTitle>
            <CardDescription>Awaiting review</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          {isLoadingSummary ? (
            <div className="flex items-center justify-center rounded-lg border bg-muted/50 p-4 min-h-[100px]">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Generating summary...</span>
            </div>
          ) : summary ? (
            <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground min-h-[100px]">
              <p className="font-semibold mb-2 flex items-center gap-2 text-foreground"><Bot className="h-4 w-4 text-primary" /> AI Summary</p>
              {summary}
            </div>
          ) : (
             <Button variant="outline" className="w-full" onClick={handleGenerateSummary} disabled={isLoadingSummary}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate User Summary
            </Button>
          )}
        </CardContent>
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
              <AvatarImage src={user.image} alt={user.name} data-ai-hint={user.imageHint} />
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
                <Image src={user.selfie} alt="Selfie" width={200} height={200} className="rounded-lg border" data-ai-hint={user.imageHint} />
              </div>
            </div>

            {summary && (
              <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-semibold mb-2 flex items-center gap-2 text-foreground"><Bot className="h-4 w-4 text-primary" /> AI Summary</p>
                {summary}
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
