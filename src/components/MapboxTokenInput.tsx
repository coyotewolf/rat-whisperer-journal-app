import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Key } from 'lucide-react';

interface MapboxTokenInputProps {
  open: boolean;
  onClose: () => void;
  onTokenSubmit: (token: string) => void;
}

const MapboxTokenInput = ({ open, onClose, onTokenSubmit }: MapboxTokenInputProps) => {
  const [token, setToken] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (token.trim()) {
      localStorage.setItem('mapbox_token', token.trim());
      onTokenSubmit(token.trim());
      setIsSubmitted(true);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Mapbox Public Token Required
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              To use the map feature, you need a free Mapbox public token. This token will be stored locally in your browser.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="token">Mapbox Public Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="pk.ey..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold">How to get your token:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <a 
                  href="https://mapbox.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  mapbox.com <ExternalLink className="h-3 w-3" />
                </a></li>
                <li>Create a free account (no credit card required)</li>
                <li>Go to your Account → Tokens</li>
                <li>Copy your "Default public token"</li>
              </ol>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!token.trim()}>
              Save Token
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapboxTokenInput;