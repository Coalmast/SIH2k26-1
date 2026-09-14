import { useTranslation } from "react-i18next";
import { useState } from "react"
import { Play, FileAudio, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface MediaItem {
  type: "image" | "video" | "audio"
  url: string
  thumbnailUrl?: string
}

interface MediaGalleryProps {
  media: MediaItem[]
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const {
    t
  } = useTranslation();

  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (!media || media.length === 0) return null

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeIndex !== null) {
      setActiveIndex((activeIndex + 1) % media.length)
    }
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeIndex !== null) {
      setActiveIndex((activeIndex - 1 + media.length) % media.length)
    }
  }

  const activeMedia = activeIndex !== null ? media[activeIndex] : null

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {media.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border bg-muted hover:opacity-90"
          >
            {item.type === "image" && (
              <img src={item.thumbnailUrl || item.url} alt="media" className="h-full w-full object-cover" />
            )}
            
            {item.type === "video" && (
              <>
                <img src={item.thumbnailUrl || "/video-placeholder.png"} alt="video" className="h-full w-full object-cover blur-[2px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="size-8 text-foreground drop-shadow-md transition-transform group-hover:scale-110" />
                </div>
              </>
            )}

            {item.type === "audio" && (
              <div className="flex h-full w-full items-center justify-center bg-secondary">
                <FileAudio className="size-8 text-muted-foreground transition-transform group-hover:scale-110" />
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={(open) => !open && setActiveIndex(null)}>
        <DialogContent className="max-w-4xl bg-black/95 p-0 border-none shadow-2xl overflow-hidden group">
          <DialogTitle className="sr-only">{t("media_view", "Media View")}</DialogTitle>
          <div className="relative flex h-[80vh] w-full items-center justify-center">
            
            <button 
              onClick={() => setActiveIndex(null)}
              className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-foreground hover:bg-black/70"
            >
              <X className="size-5" />
            </button>

            {media.length > 1 && (
              <>
                <button onClick={handlePrev} className="absolute left-4 z-50 rounded-full bg-black/50 p-2 text-foreground hover:bg-black/70 transition-opacity opacity-0 group-hover:opacity-100">
                  <ChevronLeft className="size-6" />
                </button>
                <button onClick={handleNext} className="absolute right-4 z-50 rounded-full bg-black/50 p-2 text-foreground hover:bg-black/70 transition-opacity opacity-0 group-hover:opacity-100">
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}

            {activeMedia?.type === "image" && (
              <img src={activeMedia.url} alt="Full view" className="max-h-full max-w-full object-contain" />
            )}
            
            {activeMedia?.type === "video" && (
              <video src={activeMedia.url} controls autoPlay className="max-h-full max-w-full" />
            )}

            {activeMedia?.type === "audio" && (
              <div className="flex flex-col items-center gap-4 bg-zinc-900 p-8 rounded-lg border border-zinc-800">
                <FileAudio className="size-16 text-zinc-500" />
                <audio src={activeMedia.url} controls autoPlay className="w-64" />
              </div>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-foreground">
              {activeIndex! + 1} / {media.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
