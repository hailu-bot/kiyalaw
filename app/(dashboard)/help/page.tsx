import React from 'react';
import Link from 'next/link';
import { BookOpen, Mail, MessageCircle, FileQuestion } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <div className="mb-10">
        <h1 className="text-headline-md font-headline-md text-on-background mb-2">Help Center</h1>
        <p className="text-body-md text-on-surface-variant">Resources and support for Kiya Law</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <Link href="/documents" className="bg-white border border-outline-variant p-8 hover:border-champagne-gold transition-colors group">
          <BookOpen size={24} className="text-secondary mb-4" />
          <h2 className="text-headline-sm font-headline-sm text-on-background group-hover:text-champagne-gold transition-colors mb-2">Documentation</h2>
          <p className="text-body-md text-on-surface-variant">Guides and reference for all platform features.</p>
        </Link>

        <div className="bg-white border border-outline-variant p-8">
          <Mail size={24} className="text-secondary mb-4" />
          <h2 className="text-headline-sm font-headline-sm text-on-background mb-2">Contact Support</h2>
          <p className="text-body-md text-on-surface-variant mb-2">Reach out to the Kiya Law team.</p>
          <a href="mailto:support@kiyalaw.com" className="text-label-md font-label-md text-secondary hover:underline">support@kiyalaw.com</a>
        </div>

        <div className="bg-white border border-outline-variant p-8">
          <MessageCircle size={24} className="text-secondary mb-4" />
          <h2 className="text-headline-sm font-headline-sm text-on-background mb-2">Live Chat</h2>
          <p className="text-body-md text-on-surface-variant">Chat with our team during business hours.</p>
        </div>

        <div className="bg-white border border-outline-variant p-8">
          <FileQuestion size={24} className="text-secondary mb-4" />
          <h2 className="text-headline-sm font-headline-sm text-on-background mb-2">FAQ</h2>
          <p className="text-body-md text-on-surface-variant">Find answers to common questions.</p>
        </div>
      </div>
    </div>
  );
}
