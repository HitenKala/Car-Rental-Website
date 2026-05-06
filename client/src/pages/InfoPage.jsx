import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const pageContent = {
  'about-us': {
    title: 'About TurboRides',
    subtitle: 'Built for smooth rentals, trusted owners, and happy road trips.',
    body: [
      'TurboRides connects verified car owners with renters through a simple and secure booking flow.',
      'We focus on transparent pricing, verified documents, and support-first operations for both customers and owners.',
      'This car rental platform was developed with the aim of connecting car owners and renters through a simple and efficient system.',
      
      'Team Members:',
      'Hiten Kala',
      'Rahul Khichar',
      'Gaurav Chamoli',
      'Aditya'
    ],
  },
  'help-center': {
    title: 'Help Center',
    subtitle: 'Need help? We are here for bookings, payments, and support.',
    body: [
      'For booking issues, please include your booking ID and registered email when contacting support.',
      'For urgent issues, call our support line for faster resolution.',
    ],
  },
  'terms-of-service': {
    title: 'Terms of Service',
    subtitle: 'Clear rules for using the TurboRides platform.',
    body: [
      'By using TurboRides, you agree to follow booking, payment, and vehicle-use policies.',
      'Accounts violating platform policies may be restricted or removed for safety and compliance.',
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'Your data is handled with care and purpose.',
    body: [
      'We only collect information required for account access, booking operations, and support.',
      'Sensitive information is processed securely and never sold to third parties.',
    ],
  },
  'insurance': {
    title: 'Insurance',
    subtitle: 'Coverage basics for safer trips and owner confidence.',
    body: [
      'Coverage depends on trip type, vehicle eligibility, and selected plan.',
      'Please review trip-level coverage details before confirming your reservation.',
    ],
  },
  cookies: {
    title: 'Cookies',
    subtitle: 'How we use cookies to improve your experience.',
    body: [
      'Cookies help us keep sessions secure, improve performance, and personalize basic preferences.',
      'You can manage cookie preferences in your browser settings at any time.',
    ],
  },
}

const InfoPage = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const content = pageContent[slug] || {
    title: 'Page Not Found',
    subtitle: 'The page you requested does not exist.',
    body: ['Please return to the home page and try again.'],
  }

  return (
    <div className='min-h-[65vh] px-6 py-16 md:px-16 lg:px-24 xl:px-32'>
      <div className='mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10'>
        <p className='text-xs font-semibold uppercase tracking-[0.15em] text-slate-500'>TurboRides</p>
        <h1 className='mt-3 text-3xl font-semibold text-slate-900 md:text-4xl'>{content.title}</h1>
        <p className='mt-3 text-base text-slate-600'>{content.subtitle}</p>
        <div className='mt-8 space-y-4 text-slate-700'>
          {content.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <button
          onClick={() => navigate('/')}
          className='mt-10 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700'
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default InfoPage
