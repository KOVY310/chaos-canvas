import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Users, Lock, Globe, UserPlus } from 'lucide-react';

interface PersonalBubbleData {
  id: string;
  name: string;
  isPrivate: boolean;
  invitedUsers: { id: string; username: string; avatar?: string }[];
  themePrompt?: string;
}

interface PersonalBubblePanelProps {
  bubble?: PersonalBubbleData;
  onCreateBubble?: (name: string, isPrivate: boolean) => Promise<void>;
  onInviteUser?: (bubbleId: string, username: string) => Promise<void>;
  className?: string;
}

export function PersonalBubblePanel({ bubble, onCreateBubble, onInviteUser, className }: PersonalBubblePanelProps) {
  const { t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleName, setBubbleName] = useState('My Chaos Bubble');
  const [isPrivate, setIsPrivate] = useState(true);
  const [inviteUsername, setInviteUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!onCreateBubble || !bubbleName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateBubble(bubbleName, isPrivate);
      setIsOpen(false);
      setBubbleName('My Chaos Bubble');
    } catch (error) {
      console.error('Failed to create bubble:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!onInviteUser || !bubble || !inviteUsername.trim()) return;
    
    try {
      await onInviteUser(bubble.id, inviteUsername);
      setInviteUsername('');
    } catch (error) {
      console.error('Failed to invite user:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-personal-bubble">
          <Sparkles className="w-4 h-4" />
          Personal Bubble
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-w-xl", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {bubble ? bubble.name : 'Create Personal Bubble'}
          </DialogTitle>
          <DialogDescription>
            {bubble 
              ? 'Your private creative space. Invite friends to collaborate!'
              : 'Create your own private canvas with AI-generated world based on your style.'}
          </DialogDescription>
        </DialogHeader>

        {bubble ? (
          <div className="space-y-4">
            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3">
                {bubble.isPrivate ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Globe className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {bubble.isPrivate ? 'Private' : 'Public'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bubble.isPrivate ? 'Only invited users can view' : 'Anyone can view'}
                  </p>
                </div>
              </div>
              <Switch checked={bubble.isPrivate} />
            </div>

            {/* Invited Users */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Invited Friends ({bubble.invitedUsers.length})
              </Label>
              <ScrollArea className="h-32 rounded-lg border border-border p-2">
                {bubble.invitedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {bubble.invitedUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-2 p-2 rounded-md hover-elevate">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.username}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-4">
                    <Users className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">No friends invited yet</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Invite User */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter username to invite..."
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                data-testid="input-invite-username"
              />
              <Button onClick={handleInvite} disabled={!inviteUsername.trim()} data-testid="button-send-invite">
                <UserPlus className="w-4 h-4 mr-1" />
                Invite
              </Button>
            </div>

            {/* Theme Preview */}
            {bubble.themePrompt && (
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <Label className="text-xs font-medium text-muted-foreground mb-1">AI Theme</Label>
                <p className="text-sm italic">"{bubble.themePrompt}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Create New Bubble */}
            <div>
              <Label htmlFor="bubble-name" className="text-sm font-medium mb-2">Bubble Name</Label>
              <Input
                id="bubble-name"
                placeholder="My Chaos Bubble"
                value={bubbleName}
                onChange={(e) => setBubbleName(e.target.value)}
                data-testid="input-bubble-name"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3">
                {isPrivate ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Globe className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {isPrivate ? 'Private' : 'Public'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPrivate ? 'Only invited users can view' : 'Anyone can view'}
                  </p>
                </div>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} data-testid="switch-bubble-privacy" />
            </div>

            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={!bubbleName.trim() || isCreating}
              data-testid="button-create-bubble"
            >
              {isCreating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Bubble
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
