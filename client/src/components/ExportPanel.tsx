import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Download, Video, Image, Share2 } from 'lucide-react';
import { SiTiktok, SiInstagram, SiX } from 'react-icons/si';

interface ExportPanelProps {
  onExport?: (format: 'image' | 'video', duration?: number, watermark?: boolean) => Promise<void>;
  className?: string;
}

export function ExportPanel({ onExport, className }: ExportPanelProps) {
  const { t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'image' | 'video'>('video');
  const [duration, setDuration] = useState<'15' | '30' | '60'>('15');
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!onExport) return;
    
    setIsExporting(true);
    try {
      const videoDuration = format === 'video' ? parseInt(duration) : undefined;
      await onExport(format, videoDuration, includeWatermark);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2" data-testid="button-export">
          <Download className="w-4 h-4" />
          {t('common.export')}
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Export & Share
          </DialogTitle>
          <DialogDescription>
            Export your canvas creation and share it on social media
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'image' | 'video')}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover-elevate">
                <RadioGroupItem value="image" id="format-image" data-testid="radio-format-image" />
                <Label htmlFor="format-image" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Image className="w-4 h-4" />
                  Static Image (PNG)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover-elevate">
                <RadioGroupItem value="video" id="format-video" data-testid="radio-format-video" />
                <Label htmlFor="format-video" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Video className="w-4 h-4" />
                  Video (MP4)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Video Duration (only if video format selected) */}
          {format === 'video' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Video Duration</Label>
              <RadioGroup value={duration} onValueChange={(v) => setDuration(v as '15' | '30' | '60')}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover-elevate">
                  <RadioGroupItem value="15" id="duration-15" data-testid="radio-duration-15" />
                  <Label htmlFor="duration-15" className="cursor-pointer flex-1">15 seconds (TikTok/Reels)</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover-elevate">
                  <RadioGroupItem value="30" id="duration-30" data-testid="radio-duration-30" />
                  <Label htmlFor="duration-30" className="cursor-pointer flex-1">30 seconds</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover-elevate">
                  <RadioGroupItem value="60" id="duration-60" data-testid="radio-duration-60" />
                  <Label htmlFor="duration-60" className="cursor-pointer flex-1">60 seconds</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Watermark Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div>
              <p className="text-sm font-medium">Include Watermark</p>
              <p className="text-xs text-muted-foreground">Add ChaosCanvas branding</p>
            </div>
            <Switch checked={includeWatermark} onCheckedChange={setIncludeWatermark} data-testid="switch-watermark" />
          </div>

          {/* Quick Share Buttons */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Quick Share To</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="flex-col h-auto py-3" data-testid="button-share-tiktok">
                <SiTiktok className="w-5 h-5 mb-1" />
                <span className="text-xs">TikTok</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-3" data-testid="button-share-instagram">
                <SiInstagram className="w-5 h-5 mb-1" />
                <span className="text-xs">Instagram</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-3" data-testid="button-share-twitter">
                <SiX className="w-5 h-5 mb-1" />
                <span className="text-xs">X/Twitter</span>
              </Button>
            </div>
          </div>

          {/* Export Button */}
          <Button
            className="w-full"
            onClick={handleExport}
            disabled={isExporting}
            data-testid="button-confirm-export"
          >
            {isExporting ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {format === 'video' ? `${duration}s Video` : 'Image'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
