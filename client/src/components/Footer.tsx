import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="text-gray-400 hover:text-primary transition-colors transform hover:scale-110">
            <Instagram className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-primary transition-colors transform hover:scale-110">
            <Twitter className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-primary transition-colors transform hover:scale-110">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-primary transition-colors transform hover:scale-110">
            <Youtube className="w-6 h-6" />
          </a>
        </div>
        
        <p className="text-gray-500 text-sm mb-2">
          &copy; {new Date().getFullYear()} Stoned Goose Productions. All rights reserved. 
        </p>
        <p className="text-gray-600 text-xs font-mono">
          Website Design by Kyle Mixon.
        </p>
      </div>
    </footer>
  );
}
