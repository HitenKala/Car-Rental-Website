import React from 'react'
import toast from 'react-hot-toast'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Login = () => {
    const { setShowLogin, axios, setToken, navigate } = useAppContext()

    const [state, setState] = React.useState('login')
    const [name, setName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [resetCode, setResetCode] = React.useState('')
    const [newPassword, setNewPassword] = React.useState('')
    const [showPassword, setShowPassword] = React.useState(false)
    const [showNewPassword, setShowNewPassword] = React.useState(false)
    const [generatedResetCode, setGeneratedResetCode] = React.useState('')

    const isRegister = state === 'register'
    const isForgotPassword = state === 'forgot-password'
    const isResetPassword = state === 'reset-password'
    const isLogin = state === 'login'

    const resetFormFields = () => {
        setPassword('')
        setResetCode('')
        setNewPassword('')
        setShowPassword(false)
        setShowNewPassword(false)
        setGeneratedResetCode('')
    }

    const switchState = (nextState) => {
        resetFormFields()
        setState(nextState)
    }

    const onsubmitHandler = async (event) => {
        try {
            event.preventDefault()

            if (isForgotPassword) {
                const { data } = await axios.post('/api/user/forgot-password', { email })
                if (data.success) {
                    if (data.resetCode) {
                        setGeneratedResetCode(data.resetCode)
                        toast.success(`Reset code generated: ${data.resetCode}`)
                    } else {
                        toast.success(data.message)
                    }
                    setResetCode('')
                    setNewPassword('')
                    setState('reset-password')
                } else {
                    toast.error(data.message)
                }
                return
            }

            if (isResetPassword) {
                const { data } = await axios.post('/api/user/reset-password', {
                    email,
                    code: resetCode,
                    password: newPassword,
                })

                if (data.success) {
                    toast.success(data.message)
                    resetFormFields()
                    setState('login')
                } else {
                    toast.error(data.message)
                }
                return
            }

            const { data } = await axios.post(`/api/user/${state}`, {
                name,
                email,
                password,
            })

            if (data.success) {
                navigate('/')
                setToken(data.token)
                localStorage.setItem('token', data.token)
                setShowLogin(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const heading = isRegister
        ? 'Join Turbo Rides today'
        : isForgotPassword
            ? 'Reset your password'
            : isResetPassword
                ? 'Create a new password'
                : 'Sign in to continue'

    const description = isRegister
        ? 'Create your account to book cars faster, track reservations, and manage your trips in one place.'
        : isForgotPassword
            ? 'Enter your account email and we will generate a reset code so you can securely update your password.'
            : isResetPassword
                ? 'Enter the reset code and choose a new password with at least 8 characters.'
                : 'Access your bookings, saved details, and rental history with a professional, secure sign-in experience.'

    const badge = isRegister
        ? 'Create Account'
        : isForgotPassword || isResetPassword
            ? 'Password Recovery'
            : 'Welcome Back'

    return (
        <div
            onClick={() => setShowLogin(false)}
            className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
        >
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-[8%] top-[12%] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
            </div>

            <div
                onClick={(e) => e.stopPropagation()}
                className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/15 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] lg:grid-cols-[1.05fr_0.95fr]"
            >
                <button
                    type="button"
                    aria-label="Close login modal"
                    onClick={() => setShowLogin(false)}
                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-slate-900/70 text-white transition hover:bg-slate-900"
                >
                    <img src={assets.close_icon2} alt="close" className="h-4 w-4 invert" />
                </button>

                <div className="relative hidden min-h-full overflow-hidden bg-[linear-gradient(145deg,#07111f_0%,#123b68_55%,#1c6ea4_100%)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute inset-0">
                        <div className="absolute left-10 top-10 h-32 w-32 rounded-full border border-white/10" />
                        <div className="absolute bottom-14 right-12 h-48 w-48 rounded-full bg-white/6 blur-2xl" />
                        <div className="absolute bottom-8 left-8 h-24 w-24 rounded-full border border-cyan-200/20" />
                    </div>

                    <div className="relative">
                        <img src={assets.turbo_rides2} alt="Turbo Rides" className="h-16 w-auto" />
                        <p className="mt-10 max-w-sm text-4xl font-semibold leading-tight">
                            Drive bookings, rentals, and account access from one secure place.
                        </p>
                        <p className="mt-5 max-w-md text-sm leading-6 text-slate-200">
                            Manage reservations, recover your account securely, and get back to booking with a cleaner workflow.
                        </p>
                    </div>

                    <div className="relative grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                            <p className="text-2xl font-semibold">24/7</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-300">Support</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                            <p className="text-2xl font-semibold">Fast</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-300">Recovery</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                            <p className="text-2xl font-semibold">Secure</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-300">Access</p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={onsubmitHandler}
                    className="relative flex flex-col justify-center bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-8 sm:px-10 sm:py-10"
                >
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <img src={assets.turbo_rides2} alt="Turbo Rides" className="h-12 w-auto" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Turbo Rides</p>
                            <p className="text-sm text-slate-600">Secure access to your rental account</p>
                        </div>
                    </div>

                    <div className="max-w-md">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                            {badge}
                        </span>

                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                            {heading}
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>

                    <div className="mt-8 space-y-5">
                        {isRegister && (
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                                <input
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                    placeholder="Enter your full name"
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
                                    type="text"
                                    required
                                />
                            </label>
                        )}

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                placeholder="name@example.com"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
                                type="email"
                                required
                            />
                        </label>

                        {(isLogin || isRegister) && (
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                                <div className="relative">
                                    <input
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                        placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex w-14 items-center justify-center"
                                    >
                                        <img
                                            src={showPassword ? assets.eye_close_icon : assets.eye_icon}
                                            alt={showPassword ? 'Hide password' : 'Show password'}
                                            className="h-5 w-5 opacity-70"
                                        />
                                    </button>
                                </div>
                            </label>
                        )}

                        {isResetPassword && (
                            <>
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">Reset code</span>
                                    <input
                                        onChange={(e) => setResetCode(e.target.value)}
                                        value={resetCode}
                                        placeholder="Enter the 6-digit reset code"
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
                                        type="text"
                                        inputMode="numeric"
                                        required
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
                                    <div className="relative">
                                        <input
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            value={newPassword}
                                            placeholder="Choose a new password"
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
                                            type={showNewPassword ? 'text' : 'password'}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 flex w-14 items-center justify-center"
                                        >
                                            <img
                                                src={showNewPassword ? assets.eye_close_icon : assets.eye_icon}
                                                alt={showNewPassword ? 'Hide password' : 'Show password'}
                                                className="h-5 w-5 opacity-70"
                                            />
                                        </button>
                                    </div>
                                </label>
                            </>
                        )}

                        {generatedResetCode && isResetPassword && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                Reset code for local testing: <span className="font-semibold">{generatedResetCode}</span>
                            </div>
                        )}
                    </div>

                    {isLogin && (
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => switchState('forgot-password')}
                                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <button className="mt-8 rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/25">
                        {isRegister
                            ? 'Create Account'
                            : isForgotPassword
                                ? 'Send Reset Code'
                                : isResetPassword
                                    ? 'Update Password'
                                    : 'Login'}
                    </button>

                    <div className="mt-6 text-sm text-slate-500">
                        {(isLogin || isRegister) && (
                            <p>
                                {isRegister ? 'Already have an account?' : 'Need an account?'}{' '}
                                <button
                                    type="button"
                                    onClick={() => switchState(isRegister ? 'login' : 'register')}
                                    className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
                                >
                                    {isRegister ? 'Sign in here' : 'Create one now'}
                                </button>
                            </p>
                        )}

                        {(isForgotPassword || isResetPassword) && (
                            <p>
                                Remembered your password?{' '}
                                <button
                                    type="button"
                                    onClick={() => switchState('login')}
                                    className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
                                >
                                    Back to login
                                </button>
                            </p>
                        )}

                        {isResetPassword && (
                            <p className="mt-3">
                                Need a new code?{' '}
                                <button
                                    type="button"
                                    onClick={() => switchState('forgot-password')}
                                    className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
                                >
                                    Request another one
                                </button>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
