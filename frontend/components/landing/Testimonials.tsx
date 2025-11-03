'use client'

import React from 'react'
import { Star } from 'lucide-react'

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Grandmother',
      content: 'Apna Parivar has brought our scattered family closer together. I can now see photos of my grandchildren every day!',
      rating: 5
    },
    {
      name: 'Raj Patel',
      role: 'Software Engineer',
      content: 'The privacy features are top-notch. I feel confident sharing family moments knowing our data is secure.',
      rating: 5
    },
    {
      name: 'Priya Singh',
      role: 'Stay-at-home Mom',
      content: 'Managing family events and keeping everyone updated has never been easier. Love the intuitive interface!',
      rating: 5
    }
  ]

  return (
    <section id='testimonials' className='py-20 sm:py-32 bg-background px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-16 sm:mb-20'>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground'>
            What Families Say
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Join thousands of satisfied families using Apna Parivar
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8'>
          {testimonials.map((testimonial, index) => (
                <div
              key={index}
              className='bg-card/20 border border-border/50 rounded-2xl p-6 sm:p-8 hover:border-border/40 hover:bg-card/30 transition-all duration-300'
            >
              {/* Rating */}
              <div className='flex gap-1 mb-4'>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className='fill-primary text-foreground' />
                ))}
              </div>

              {/* Content */}
              <p className='text-muted-foreground leading-relaxed mb-6'>
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div>
                <h3 className='text-foreground font-semibold'>{testimonial.name}</h3>
                <p className='text-muted-foreground text-sm'>{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
