import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from './ui/button';

/**
 * ShareButton - Copy current view URL to clipboard
 * @param {Function} onGetShareableUrl - Function to generate shareable URL
 */
export function ShareButton({ onGetShareableUrl }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const url = onGetShareableUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for browsers that don't support clipboard API
      alert(`Copy this URL:\n${onGetShareableUrl()}`);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </>
      )}
    </Button>
  );
}

