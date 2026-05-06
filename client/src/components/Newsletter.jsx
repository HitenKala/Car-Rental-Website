import React, { useState } from 'react'
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Newsletter = () => {
    const { axios } = useAppContext();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const { data } = await axios.post('/api/user/newsletter/subscribe', { email: email.trim() });
            if (data.success) {
                toast.success(data.message);
                setEmail('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto my-12 mb-24 flex max-w-4xl flex-col items-center justify-center rounded-[28px] bg-slate-50 px-4 py-12 text-center sm:px-6 md:mb-32 md:px-8"
        >
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl font-semibold sm:text-3xl md:text-4xl"
            >
                Never Miss a Deal!
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-2xl pb-8 text-sm leading-6 text-gray-500/80 sm:text-base md:text-lg"
            >
                Subscribe to get the latest offers, new arrivals, and exclusive discounts
            </motion.p>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                onSubmit={handleSubmit}
                className="flex w-full max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
                <input
                    className="h-12 w-full rounded-md border border-gray-300 px-4 text-gray-500 outline-none sm:rounded-r-none sm:border-r-0"
                    type="email"
                    placeholder="Enter your email id"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 rounded-md bg-[#185a9d] px-8 text-white transition-all hover:bg-[#102f4e] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-l-none sm:px-10 md:px-12"
                >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
            </motion.form>
        </motion.div>
    )
}

export default Newsletter
