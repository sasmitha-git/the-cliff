import Link from "next/link";

interface StreamCardProps {
  id: string;
  title: string;
  streamerName: string;
  viewerCount: number;
  isLive?: boolean;
}

export default function StreamCard({ id, title, streamerName, viewerCount, isLive = false }: StreamCardProps) {
  const hue = (streamerName?.charCodeAt(0) ?? 0) * 37 % 360;
  const initial = streamerName?.[0]?.toUpperCase() ?? "?";

  return (
    <Link href={`/watch/${id}`} className="group block">
      <div className="bg-cliff-surface/80 backdrop-blur-xl border border-cliff-border/50 rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-cliff-accent/10 group-hover:border-cliff-accent/30">

        {/* Thumbnail */}
        <div className="relative pt-[56.25%] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, hsl(${hue},45%,14%), hsl(${(hue + 60) % 360},40%,18%))`,
            }}
          />
          {/* Monogram watermark */}
          <span className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white/10 select-none font-syne">
            {initial}
          </span>
          {/* LIVE badge - Only show if stream is actually live */}
          {isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-cliff-live/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
          )}
          {/* Viewer count */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white/90 text-[11px] px-3 py-1.5 rounded-full font-dm border border-white/10">
            👁 {viewerCount} viewers
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 3a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info row */}
        <div className="flex gap-4 p-4 items-start">
          <div
            className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white font-syne shadow-lg"
            style={{
              background: `linear-gradient(135deg, hsl(${hue},60%,45%), hsl(${(hue + 50) % 360},55%,35%))`,
              boxShadow: `0 4px 14px 0 hsla(${hue}, 60%, 45%, 0.3)`,
            }}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-cliff-text truncate font-dm group-hover:text-cliff-accent transition-colors">
              {title}
            </p>
            <p className="text-xs text-cliff-subtle mt-1 font-dm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cliff-green" />
              {streamerName}
            </p>
          </div>
        </div>

      </div>
    </Link>
  );
}