'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X, Home, Users, Heart, Mail, LogIn, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const navLinks = [
    { name: 'Home', href: '#home', icon: Home },
    { name: 'Features', href: '#features', icon: Users },
    { name: 'How It Works', href: '#how', icon: Heart },
    { name: 'Contact', href: '#contact', icon: Mail },
  ]

  const [activeId, setActiveId] = useState('home')
  const [theme, setTheme] = useState<'dark' | 'shadcn'>('dark')

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    // If it's an in-page anchor, smooth-scroll to the element
    if (href.startsWith('#')) {
      e.preventDefault()
      const id = href.slice(1)
      const el = document.getElementById(id)
      if (el) {
        // account for fixed navbar height
        const y = el.getBoundingClientRect().top + window.pageYOffset - 64
        window.scrollTo({ top: y, behavior: 'smooth' })
        // mark as active immediately for visual feedback
        setActiveId(id)
      }
      setIsOpen(false)
    }
  }

  useEffect(() => {
    // initialize theme from localStorage or prefers-color-scheme
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'shadcn') {
        setTheme('shadcn')
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('shadcn')
      } else if (stored === 'dark') {
        setTheme('dark')
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('shadcn')
      } else {
        // fallback to prefers-color-scheme
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          setTheme('dark')
          document.documentElement.classList.add('dark')
        } else {
          setTheme('shadcn')
          document.documentElement.classList.add('shadcn')
        }
      }
    } catch (e) {
      // ignore if localStorage not available
    }

    // scroll spy: update activeId based on scroll position
    const sectionIds = ['home', 'features', 'how', 'testimonials', 'contact']
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const offset = 80 // account for navbar height
          const scrollPos = window.scrollY + offset
          let current = 'home'
          for (const id of sectionIds) {
            const el = document.getElementById(id)
            if (el) {
              const top = el.offsetTop
              if (scrollPos >= top) {
                current = id
              }
            }
          }
          setActiveId(current)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // run once to set initial active
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'shadcn' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem('theme', next)
    } catch (e) {}

    if (next === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('shadcn')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('shadcn')
    }
  }

  return (
  <nav className='fixed w-full top-0 z-50 bg-background border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          
          {/* Logo/Branding */}
            <Link href='/' className='flex items-center space-x-2 group'>
            <div className='w-8 h-8  rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-black/50 transition-shadow'>
              <Image src={theme === 'shadcn' ? '/logolight.png' : '/logo.png'} alt={theme === 'shadcn' ? 'Apna Parivar Logo (light)' : 'Apna Parivar Logo'} width={42} height={42} className="w-8 h-8" />
            </div>
            <span className='text-xl font-bold hidden sm:inline text-foreground'>
              Apna Parivar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            {navLinks.map((link) => {
              const Icon = link.icon
              const id = link.href.startsWith('#') ? link.href.slice(1) : ''
              const isActive = id && activeId === id
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-all duration-200 group ${isActive ? 'text-foreground font-semibold bg-white/6 border border-white/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/2'}`}
                >
                  <Icon size={18} className={`transition-colors ${isActive ? 'text-foreground' : 'group-hover:text-foreground'}`} />
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </div>

          {/* CTA Button & Mobile Menu Toggle */}
          <div className='flex items-center space-x-4'>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className='inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-sidebar/5 transition-colors'
              aria-label='Toggle theme'
              title='Toggle theme'
            >
              {theme === 'dark' ? (
                <Sun size={18} className='text-foreground' />
              ) : (
                <Moon size={18} className='text-foreground' />
              )}
            </button>

            {/* Sign In Button */}
            <button
              className={`hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 font-semibold ${theme === 'shadcn' ? 'bg-foreground text-primary-foreground hover:shadow-lg hover:shadow-black/30' : 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30'}`}
            >
              <LogIn size={18} className={`${theme === 'shadcn' ? 'text-primary-foreground' : 'text-primary-foreground'}`} />
              <span className={`${theme === 'shadcn' ? 'text-primary-foreground' : 'text-primary-foreground'}`}>Sign In</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className='md:hidden inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:text-card-foreground hover:bg-sidebar/5 transition-colors'
              aria-label='Toggle navigation menu'
            >
              {isOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
  <div className='md:hidden bg-background border-t border-border animate-in fade-in slide-in-from-top-2 duration-300'>
          <div className='px-4 py-4 space-y-2'>
            {/* Mobile theme toggle */}
            <div className='flex items-center justify-end px-2'>
              <button
                onClick={toggleTheme}
                className='inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/5'
                aria-label='Toggle theme'
              >
                {theme === 'dark' ? (
                  <Sun size={18} className='text-white' />
                ) : (
                  <Moon size={18} className='text-[#0f172a]' />
                )}
              </button>
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon
              const id = link.href.startsWith('#') ? link.href.slice(1) : ''
              const isActive = id && activeId === id
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-150 ${isActive ? 'bg-white/6 text-foreground font-semibold border border-white/20' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar'}`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              )
            })}
            
            {/* Mobile Sign In Button */}
            <button className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 mt-4 font-semibold ${theme === 'shadcn' ? 'bg-foreground text-primary-foreground hover:shadow-lg hover:shadow-black/30' : 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30'}`}>
              <LogIn size={18} className={`${theme === 'shadcn' ? 'text-primary-foreground' : 'text-primary-foreground'}`} />
              <span className={`${theme === 'shadcn' ? 'text-primary-foreground' : 'text-primary-foreground'}`}>Sign In</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar