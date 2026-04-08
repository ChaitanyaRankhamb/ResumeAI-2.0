'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  buttonLabel?: string;
  redirectPath?: string;
  onClose?: () => void;
}

export function SuccessModal({
  isOpen,
  title,
  description,
  buttonLabel = 'Continue',
  redirectPath = '/',
  onClose,
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-border bg-card rounded-lg shadow-lg">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-4">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Link href={redirectPath}>{buttonLabel}</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
