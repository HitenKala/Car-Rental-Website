import { assets } from '../assets/assets'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'

const Banner = () => {
  const navigate = useNavigate()
  const { setShowLogin, user, isOwner, axios, fetchUser } = useAppContext()
  const [showOwnerForm, setShowOwnerForm] = useState(false)
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [registrationFile, setRegistrationFile] = useState(null)
  const [isSubmittingOwnerForm, setIsSubmittingOwnerForm] = useState(false)

  const openOwnerRegistration = () => {
    if (!user) {
      setShowLogin(true)
      return
    }
    if (user.ownerVerificationStatus === 'pending') {
      toast('Your owner request is under admin review.')
      return
    }
    setShowOwnerForm(true)
  }

  const closeOwnerRegistration = (forceClose = false) => {
    if (isSubmittingOwnerForm && !forceClose) return
    setShowOwnerForm(false)
    setRegistrationNumber('')
    setRegistrationFile(null)
  }

  const submitOwnerRegistration = async (event) => {
    event.preventDefault()
    try {
      if (!registrationNumber.trim()) {
        toast.error('Please enter your registration number')
        return
      }
      if (!registrationFile) {
        toast.error('Please upload your car registration document')
        return
      }

      setIsSubmittingOwnerForm(true)

      const formData = new FormData()
      formData.append('registrationNumber', registrationNumber.trim())
      formData.append('registrationDocument', registrationFile)

      const { data } = await axios.post('/api/owner/change-role', formData)
      if (data.success) {
        toast.success(data.message)
        await fetchUser()
        closeOwnerRegistration(true)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmittingOwnerForm(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className='flex flex-col items-center justify-center gap-6 rounded-2xl bg-gradient-to-r from-[#0558FE] to-[#A9CFFF] px-5 pt-10 text-center sm:px-8 md:mx-auto md:flex-row md:items-start md:justify-between md:pl-14 md:text-left max-w-6xl overflow-hidden'
      >
        <div>
          <h2 className='text-2xl md:text-3xl font-semibold text-white max-w-lg'>Do You Own a Sports Car?</h2>
          <p className='mt-2 text-white/90'>Monetize your Vehicle effortlessly by listing it on TurboRides</p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (isOwner ? navigate('/owner') : openOwnerRegistration())}
            className='px-6 py-2 bg-white hover:bg-slate-100 transition-all text-primary rounded-lg text-sm mt-4 cursor-pointer'
          >
            {isOwner
              ? 'Go to Dashboard'
              : user?.ownerVerificationStatus === 'pending'
                ? 'Owner Review Pending'
                : user?.ownerVerificationStatus === 'rejected'
                  ? 'Reapply as Owner'
                  : 'List your Car'}
          </motion.button>
        </div>
        <motion.img
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          src={assets.banner_car_image}
          alt='car'
          className='mt-4 max-h-45 w-full max-w-[420px] md:mt-10 md:w-auto'
        />
      </motion.div>

      {showOwnerForm && (
        <div
          onClick={closeOwnerRegistration}
          className='fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4 py-8'
        >
          <form
            onSubmit={submitOwnerRegistration}
            onClick={(e) => e.stopPropagation()}
            className='w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl'
          >
            <p className='text-xs font-semibold uppercase tracking-[0.22em] text-slate-500'>Owner registration</p>
            <h3 className='mt-2 text-xl font-semibold text-slate-900'>Submit your car registration</h3>
            <p className='mt-2 text-sm text-slate-600'>Share your registration number and a clear document copy. Admin approval is required before owner access is enabled.</p>

            <label className='mt-5 block text-sm font-medium text-slate-700'>
              Registration number
              <input
                type='text'
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500'
                placeholder='e.g. DL3CAF1234'
              />
            </label>

            <label className='mt-4 block text-sm font-medium text-slate-700'>
              Car registration document
              <input
                type='file'
                required
                accept='image/*,.pdf'
                onChange={(e) => setRegistrationFile(e.target.files?.[0] || null)}
                className='mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium'
              />
            </label>

            <div className='mt-6 flex justify-end gap-3'>
              <button
                type='button'
                onClick={closeOwnerRegistration}
                className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSubmittingOwnerForm}
                className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70'
              >
                {isSubmittingOwnerForm ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default Banner
