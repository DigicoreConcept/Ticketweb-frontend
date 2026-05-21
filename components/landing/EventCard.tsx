"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, ArrowUpRight, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
  slug: string;
  title: string;
  date: string;
  image: string;
  price: string;
  location: string;
  category?: string;
  className?: string;
  isTrending?: boolean;
}

export function EventCard({
  slug,
  title,
  date,
  image,
  price,
  location,
  category,
  className,
  isTrending,
}: EventCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/events/${slug}`} className={`block ${className ?? ""}`}>
      <motion.article
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="relative group w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/[0.06] cursor-pointer select-none"
        style={{ aspectRatio: "3/4" }}
      >
        {/* ── Image ── */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-white/[0.04]" />
        )}
        <Image
          src={image}
          alt={title}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${hovered ? "scale-105" : "scale-100"}`}
          onLoadingComplete={() => setLoaded(true)}
        />

        {/* ── Permanent dark scrim — bottom fade ── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* ── Top badges ── */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {isTrending && (
            <span className="px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_12px_rgba(251,45,0,0.4)]">
              Trending
            </span>
          )}
          {category && !isTrending && (
            <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/60 text-[10px] font-semibold uppercase tracking-widest">
              {category}
            </span>
          )}

          {/* Price pill — always visible, top right */}
          <span className="ml-auto px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white text-[11px] font-bold">
            {price}
          </span>
        </div>

        {/* ── Bottom info ── */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Title — always visible */}
          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 mb-2 drop-shadow-md">
            {title}
          </h3>

          {/* Date & location — subtle but always there */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <Calendar className="w-3 h-3 shrink-0" />
              <span className="truncate">{date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>

          {/* ── Hover reveal: CTA ── */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between"
              >
                <span className="text-primary text-xs font-bold">
                  View Event
                </span>
                <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(251,45,0,0.5)]">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Hover border glow ── */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 rounded-2xl border border-primary/30 pointer-events-none"
        />
      </motion.article>
    </Link>
  );
}