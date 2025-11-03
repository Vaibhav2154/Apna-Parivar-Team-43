'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Github, Linkedin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Security', href: '#security' }
    ],
    Company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '#contact' }
    ],
    Legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' }
    ]
  }

  return (
  <footer className='bg-background border-t border-border px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto py-12 sm:py-16 lg:py-20'>
        
        {/* Main Footer Content */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 sm:mb-16'>
          
          {/* Brand Column */}
          <div className='col-span-2 md:col-span-1'>
            <Link href='/' className='flex items-center space-x-2 group mb-6'>
              <div className='w-8 h-8 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-black/50 transition-shadow'>
                  <Image src="/logo.png" alt="Apna Parivar Logo" width={42} height={42} className="w-8 h-8" />
                </div>
                <span className='text-lg font-bold text-foreground'>Apna Parivar</span>
            </Link>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              Connect with your family and preserve memories together.
            </p>
            
            {/* Social Links */}
            <div className='flex gap-3 mt-4'>
              <a
                href='mailto:hello@apnaparivar.com'
                className='w-10 h-10 rounded-lg bg-sidebar hover:bg-white/5 text-foreground flex items-center justify-center transition-all'
                aria-label='Email'
              >
                <Mail size={18} />
              </a>
              <a
                href='https://github.com'
                className='w-10 h-10 rounded-lg bg-sidebar hover:bg-white/5 text-foreground flex items-center justify-center transition-all'
                aria-label='GitHub'
              >
                <Github size={18} />
              </a>
              <a
                href='https://linkedin.com'
                className='w-10 h-10 rounded-lg bg-sidebar hover:bg-white/5 text-foreground flex items-center justify-center transition-all'
                aria-label='LinkedIn'
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className='text-white font-semibold mb-4'>{category}</h3>
              <ul className='space-y-3'>
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className='text-muted-foreground hover:text-foreground transition-colors text-sm'
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className='border-t border-[#262626]'></div>

        {/* Bottom Footer */}
        <div className='pt-8 sm:pt-12 flex flex-col sm:flex-row justify-between items-center gap-4'>
          <p className='text-muted-foreground text-sm'>
            &copy; {currentYear} Apna Parivar. All rights reserved.
          </p>
          <div className='flex gap-6 text-sm'>
            <Link href='/privacy' className='text-muted-foreground hover:text-foreground transition-colors'>
              Privacy Policy
            </Link>
            <Link href='/terms' className='text-muted-foreground hover:text-foreground transition-colors'>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
