export function HeroGraphic() {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border/50 group bg-card">
      {/* 
        Ideally this image would be placed in the public folder, 
        but since we just generated it as an artifact, we'll reference it directly 
        or use a placeholder if it's missing during build.
        We'll use a placeholder styling here, and you can swap the src to your actual asset.
      */}
      <img 
        src="/landing-hero.jpg" // Note: Please move the generated artifact image to public/landing-hero.jpg
        alt="COMET Platform Dashboard Visualization" 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        onError={(e) => {
          // Fallback if image isn't in public folder yet
          e.currentTarget.src = 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=2000&auto=format&fit=crop';
        }}
      />
      
      {/* Glassmorphism overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      
      {/* Floating UI Elements */}
      <div className="absolute bottom-6 left-6 p-4 rounded-xl bg-background/60 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-500">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">System Status</p>
          <p className="text-xs text-muted-foreground">All nodes online</p>
        </div>
      </div>
    </div>
  )
}
