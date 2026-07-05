import React from "react";
import Link from "next/link";
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0A0A0A] pt-16 pb-8 px-6 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-black tracking-tighter text-white">
                Ticket<span className="text-primary">Web</span>
              </span>
            </Link>
            <p className="text-neutral-400 mb-8 max-w-sm leading-relaxed">
              The premier platform for discovering, creating, and managing incredible events. Turn your ideas into sold-out experiences with ease.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Product</h3>
            <ul className="space-y-4">
              <li><Link href="/events" className="text-neutral-400 hover:text-primary transition-colors text-sm">Browse Events</Link></li>
              <li><Link href="/auth/register" className="text-neutral-400 hover:text-primary transition-colors text-sm">Create Event</Link></li>
              <li><Link href="/pricing" className="text-neutral-400 hover:text-primary transition-colors text-sm">Pricing</Link></li>
              <li><Link href="/features" className="text-neutral-400 hover:text-primary transition-colors text-sm">Features</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/help" className="text-neutral-400 hover:text-primary transition-colors text-sm">Help Center</Link></li>
              <li><Link href="/contact" className="text-neutral-400 hover:text-primary transition-colors text-sm">Contact Us</Link></li>
              <li><Link href="/faq" className="text-neutral-400 hover:text-primary transition-colors text-sm">FAQ</Link></li>
              <li><Link href="/terms" className="text-neutral-400 hover:text-primary transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Newsletter</h3>
            <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
              Subscribe to get the latest events and updates delivered to your inbox.
            </p>
            <form className="flex flex-col gap-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button 
                type="button" 
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} TicketWeb. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-neutral-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-neutral-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
