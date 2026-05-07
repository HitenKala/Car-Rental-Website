import React, { useEffect, useMemo, useState } from 'react'
import LocationMap from './LocationMap'
import { buildGoogleMapsUrl, resolveCoordinates } from '../utils/locationMap'

const InfoItem = ({ label, value }) => (
  <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>{label}</p>
    <p className='mt-2 text-sm font-medium text-slate-800'>{value || '-'}</p>
  </div>
)

const CarDetailsModal = ({ car, onClose, currency, showOwner = false, onEdit = null }) => {
  if (!car) return null

  const galleryImages = useMemo(() => {
    if (Array.isArray(car.images) && car.images.length > 0) return car.images
    return car.image ? [car.image] : []
  }, [car])
  const [activeImage, setActiveImage] = useState(galleryImages[0] || '')

  useEffect(() => {
    setActiveImage(galleryImages[0] || '')
  }, [galleryImages])

  const mapCoordinates = resolveCoordinates(car.location, car.pickupCoordinates)
  const mapLabel = car.preciseLocation || car.location || ''

  return (
    <div
      className='fixed inset-0 z-[140] flex items-center justify-center bg-black/55 px-4 py-8'
      onClick={onClose}
    >
      <div
        className='max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 md:p-7'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500'>Car details</p>
            <h3 className='mt-2 text-2xl font-semibold text-slate-900'>
              {car.brand} {car.model}
            </h3>
            <p className='mt-1 text-sm text-slate-500'>
              {car.category} • {car.year} • {currency}{car.pricePerDay}/day
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {onEdit ? (
              <button
                type='button'
                onClick={onEdit}
                className='rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white'
              >
                Edit Details
              </button>
            ) : null}
            <button
              type='button'
              onClick={onClose}
              className='rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600'
            >
              Close
            </button>
          </div>
        </div>

        <div className='mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]'>
          <div className='space-y-6'>
            <div className='overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100'>
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={`${car.brand} ${car.model}`}
                  className='h-[260px] w-full object-cover sm:h-[320px]'
                />
              ) : (
                <div className='flex h-[260px] items-center justify-center text-sm text-slate-400 sm:h-[320px]'>
                  No image available
                </div>
              )}
            </div>

            {galleryImages.length > 1 ? (
              <div className='grid grid-cols-4 gap-3 sm:grid-cols-5'>
                {galleryImages.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    type='button'
                    onClick={() => setActiveImage(imageUrl)}
                    className={`overflow-hidden rounded-2xl border ${activeImage === imageUrl ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'}`}
                  >
                    <img src={imageUrl} alt={`${car.brand} ${car.model} ${index + 1}`} className='h-18 w-full object-cover' />
                  </button>
                ))}
              </div>
            ) : null}

            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              <InfoItem label='Brand' value={car.brand} />
              <InfoItem label='Model' value={car.model} />
              <InfoItem label='Year' value={car.year} />
              <InfoItem label='Category' value={car.category} />
              <InfoItem label='Transmission' value={car.transmission} />
              <InfoItem label='Fuel Type' value={car.fuel_type} />
              <InfoItem label='Seats' value={car.seating_capacity} />
              <InfoItem label='Availability' value={car.isAvailable ? 'Available' : 'Unavailable'} />
              <InfoItem label='RC Number' value={car.rcNumber} />
            </div>

            <div className='rounded-[24px] border border-slate-200 bg-white p-5'>
              <p className='text-sm font-semibold text-slate-900'>Owner Description</p>
              <p className='mt-3 text-sm leading-7 text-slate-600'>{car.description || 'No description provided.'}</p>
            </div>
          </div>

          <div className='space-y-6'>
            {showOwner ? (
              <div className='rounded-[24px] border border-slate-200 bg-white p-5'>
                <p className='text-sm font-semibold text-slate-900'>Owner Information</p>
                <div className='mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1'>
                  <InfoItem label='Owner Name' value={car.owner?.name} />
                  <InfoItem label='Owner Email' value={car.owner?.email} />
                </div>
              </div>
            ) : null}

            <div className='rounded-[24px] border border-slate-200 bg-white p-5'>
              <p className='text-sm font-semibold text-slate-900'>Pickup Details</p>
              <div className='mt-4 grid gap-4'>
                <InfoItem label='City' value={car.location} />
                <InfoItem label='Precise Location' value={car.preciseLocation || 'Not provided'} />
              </div>

              {mapLabel ? (
                <a
                  href={buildGoogleMapsUrl({ label: mapLabel, coordinates: mapCoordinates })}
                  target='_blank'
                  rel='noreferrer'
                  className='mt-4 inline-flex text-sm font-medium text-blue-600'
                >
                  Open in Google Maps
                </a>
              ) : null}

              {mapCoordinates ? (
                <div className='mt-4 overflow-hidden rounded-2xl border border-slate-200'>
                  <LocationMap
                    coordinates={mapCoordinates}
                    title='Pickup preview'
                    subtitle={mapLabel}
                    height={260}
                    zoom={14}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarDetailsModal
