import { useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'
import { HeroGraphic } from './HeroGraphic'
import { CTAButtons } from './CTAButtons'
import { pageVariants, containerVariants, itemVariants } from './animations'
import './landing.css'

export function LandingPage() {
  const { auth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (auth.session) {
      if (auth.role === 'super_admin' || auth.role === 'corporate_executive') {
        navigate({ to: '/corporate-dashboard', replace: true })
      } else if (auth.role === 'mine_manager') {
        navigate({ to: '/mine-manager', replace: true })
      } else {
        navigate({ to: '/inspection', replace: true })
      }
    }
  }, [auth.session, auth.role, navigate])

  if (auth.session) {
    return null
  }

  return (
    <motion.main
      className="landing-container bg-gradient-to-br from-background to-secondary/30 min-h-screen flex flex-col justify-center items-center overflow-hidden relative"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Decorative background blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <section className="hero-section container mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        
        {/* Left side text and CTA */}
        <motion.div
          className="hero-content flex-1 max-w-2xl text-center lg:text-left flex flex-col gap-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary w-fit mx-auto lg:mx-0 font-medium text-sm border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            COMET Platform 2.0
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Smart Governance <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              for Coal Mining.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Digitally unify your entire governance chain. Real-time compliance monitoring, automated workflows, and AI-powered risk detection.
          </motion.p>
          
          <motion.div variants={itemVariants} className="mt-4">
            <CTAButtons />
          </motion.div>
        </motion.div>
        
        {/* Right side graphic */}
        <motion.div 
          className="hero-graphic flex-1 w-full max-w-2xl relative"
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          <HeroGraphic />
        </motion.div>

      </section>
    </motion.main>
  )
}
