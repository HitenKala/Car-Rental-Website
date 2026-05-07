import React from 'react'
import Title from '../components/Title'
import { motion } from 'motion/react';

const Testimonial = () => {

    const testimonials = [
        { id: 1, name: "Aarav Mehta", address: "Dehradun, Uttarakhand", image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200", rating: 5, review: "Exceptional service and attention to detail. Everything was handled professionally and efficiently from start to finish. Highly recommended!" },
        { id: 2, name: "Riya Sharma", address: "Rishikesh, Uttarakhand", image: "https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=200", rating: 4, review: "I am truly impressed by the quality and consistency. The entire process was smooth, and the results exceeded all expectations. Thank you!" },
        { id: 3, name: "Kabir Rawat", address: "Nainital, Uttarakhand", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200", rating: 5, review: "Fantastic experience! From start to finish, the team was professional, responsive, and genuinely cared about delivering great results." }
    ];

    const Star = ({ filled }) => (
        <svg className="w-4 h-4 text-yellow-400" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25l-6.16 3.73 1.64-7.03L2.5 9.77l7.19-.61L12 2.5l2.31 6.66 7.19.61-5 4.18 1.64 7.03z" />
        </svg>
    );

    return (
        <div className="px-4 py-18 sm:px-6 md:px-10 md:py-24 lg:px-16 xl:px-24">

            <Title title="What Our Customers Say" subTitle="Discover why travelers choose TurboRides for dependable service, well-maintained cars, and a booking experience that feels smooth from start to finish." />

            <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial) => (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: testimonial.id * 0.2, ease: 'easeInOut' }}
                        viewport={{ once: true, amount: 0.3 }}
                        key={testimonial.id}
                        className="h-full rounded-2xl bg-white p-6 shadow-lg transition-all duration-500 hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-3">
                            <img className="w-12 h-12 rounded-full" src={testimonial.image} alt={testimonial.name} />
                            <div>
                                <p className="text-lg font-medium text-slate-900 sm:text-xl">{testimonial.name}</p>
                                <p className="text-sm text-gray-500">{testimonial.address}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4">
                            {Array(5).fill(0).map((_, index) => (
                                <Star key={index} filled={testimonial.rating > index} />
                            ))}
                        </div>
                        <p className="mt-4 text-sm leading-6 text-gray-500 sm:text-base">"{testimonial.review}"</p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default Testimonial
