'use client'

import React from 'react'
import { UserPlus, Share, Lock } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      number: '01',
      title: 'Model Your Family',
      description: 'Quickly add parents, siblings, twins, step relations, uncles/aunts and cousins. Use relationship labels and up to 10 programmable fields per person.'
    },
    {
      icon: Share,
      number: '02',
      title: 'Assign Admins & Permissions',
      description: 'Admin1 (family owner) can add Admin2/Admin3. Only admins can add members, photos and edit sensitive details. Grant view access to specific people as needed.'
    },
    {
      icon: Lock,
      number: '03',
      title: 'Secure Gmail Authentication',
      description: 'Users sign in with Gmail only — simplifies verification and lets you control access for family members across multiple families.'
    }
  ]

  return (
  <section id='how' className='py-20 sm:py-32 bg-background px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-16 sm:mb-20'>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground'>
            How It Works
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Get started in just three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12'>
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className='relative'>
                {/* Step Container */}
                <div className='space-y-4'>
                  {/* Number and Icon */}
                  <div className='flex items-start gap-4'>
                    <div className='shrink-0'>
                      <div className='flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20'>
                        <Icon size={32} className='text-foreground' />
                      </div>
                    </div>
                    <span className='text-5xl font-bold text-foreground/20'>{step.number}</span>
                  </div>

                  {/* Content */}
                  <div className='pt-2'>
                    <h3 className='text-xl sm:text-2xl font-semibold text-foreground mb-3'>
                      {step.title}
                    </h3>
                    <p className='text-muted-foreground leading-relaxed'>
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className='hidden md:block absolute top-8 -right-6 w-12 h-1 bg-linear-to-r from-white/30 to-transparent'></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
