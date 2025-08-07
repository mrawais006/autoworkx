import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, Wrench, Settings, Car, Battery, Gauge, Zap, Award, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './components/Logo';

const App = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const services = [
    { icon: <Car className="w-8 h-8" />, name: "Car Maintenance", desc: "Regular servicing & upkeep" },
    { icon: <Settings className="w-8 h-8" />, name: "Logbook Servicing", desc: "Manufacturer warranty compliant" },
    { icon: <Gauge className="w-8 h-8" />, name: "Engine Diagnostics", desc: "Advanced computer diagnostics" },
    { icon: <Zap className="w-8 h-8" />, name: "Tyres", desc: "Replacement & wheel alignment" },
    { icon: <Wrench className="w-8 h-8" />, name: "Puncture Repair", desc: "Fast & reliable fixes" },
    { icon: <Settings className="w-8 h-8" />, name: "Brakes & Suspensions", desc: "Safety-critical repairs" },
    { icon: <Battery className="w-8 h-8" />, name: "Battery Replacement", desc: "Testing & replacement service" },
    { icon: <Wrench className="w-8 h-8" />, name: "All Mechanical Repairs", desc: "Comprehensive auto repair" }
  ];

  const stats = [
    { icon: <Users className="w-8 h-8" />, number: "500+", label: "Happy Customers" },
    { icon: <Award className="w-8 h-8" />, number: "5.0", label: "Star Rating" },
    { icon: <Wrench className="w-8 h-8" />, number: "7+", label: "Years Experience" }
  ];

  const handleCall = () => {
    window.open('tel:0451109786', '_self');
  };

  const handleMessage = () => {
    window.open('sms:0451109786?body=How%20can%20we%20help%20you%3F', '_self');
  };

  const handleWorkshop = () => {
    window.open('https://maps.app.goo.gl/1Frnarsfi4PJ4Bfk6', '_blank');
  };

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000); // Hide after 5 seconds
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData);
    
    // Basic validation
    const requiredFields = ['name', 'phone', 'email', 'service'];
    const missingFields = requiredFields.filter(field => !data[field] || (data[field] as string).trim() === '');
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email as string)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Phone validation (basic)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    if (!phoneRegex.test(data.phone as string)) {
      alert('Please enter a valid phone number');
      return;
    }
    
    setIsSubmitting(true);
    
    // Add timestamp and additional data
    const submissionData = {
      ...data,
      timestamp: new Date().toISOString(),
      source: 'Website Booking Form'
    };
    
    try {
      // Send to Google Apps Script - PRODUCTION FIXED VERSION
      await fetch('https://script.google.com/macros/s/AKfycbw5qrBp_81Q69gTp-7Ok9DuaxpFiyeShRjWmq76y2iEtpH2W5xvOF_EHW7ecvGgT_vTqg/exec', {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script cross-origin
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });
      
      console.log('Request sent to Google Apps Script successfully');
      
      // Show beautiful success message instead of alert
      showSuccessMessage();
      console.log('Form submitted successfully:', submissionData);
      
      // Reset form
      formElement.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again or call us directly at 0451 109 786.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-body">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-4">
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        
        <div className="relative z-20 text-center px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Logo Component */}
            <Logo className="mb-0" />
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-1 space-y-0"
            >
              <p className="text-xl md:text-2xl font-light text-blue-200 tracking-wide">
                Next-Gen Mechanics. Zero Guesswork.
              </p>
              <p className="text-lg md:text-xl font-light text-purple-300 tracking-wide">
                Fix Fast. Roll Faster.
              </p>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl md:text-6xl font-display font-bold mb-6 text-white"
            >
              PREMIUM CAR REPAIR
            </motion.h2>
            
            {/* Glass morphism CTA buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
            >
              <button
                onClick={handleCall}
                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 backdrop-blur-md px-8 py-4 rounded-2xl border border-green-500/30 hover:border-green-400/50 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
              >
                <Phone className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">CALL NOW</span>
              </button>
              
              <button
                onClick={handleMessage}
                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 backdrop-blur-md px-8 py-4 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <MessageSquare className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">MESSAGE</span>
              </button>
              
              <button
                onClick={handleWorkshop}
                className="group flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-md px-8 py-4 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                <MapPin className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">GO TO WORKSHOP</span>
              </button>
            </motion.div>

            {/* Contact info with glass morphism */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-white/90">
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-green-400" />
                  <span className="text-xl font-medium">0451 109 786</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-purple-400" />
                  <span className="text-lg">1/87 Newlands Road, Coburg North</span>
            </div>
                <div className="text-blue-300 font-medium">www.autoworkx.com.au</div>
            </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-blue-400 mb-4 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold font-display mb-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-white/70 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              OUR SERVICES
            </h2>
            <p className="text-xl text-white/80 font-light">Professional automotive repair & maintenance</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                <h3 className="text-lg font-semibold font-display mb-2 text-white group-hover:text-blue-300 transition-colors">{service.name}</h3>
                <p className="text-white/70 text-sm font-light leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-white">CUSTOMER REVIEWS</h2>
          
          <div className="bg-white rounded-lg p-8 text-gray-900 mb-8 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <div className="flex text-yellow-400 text-2xl">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-800">4.8/5</span>
            </div>
            <p className="text-gray-600 mb-6 text-lg">Based on Google Reviews</p>
            
            <div className="space-y-6">
              <div className="border-b pb-4">
                <p className="text-lg italic mb-2">"Excellent service and honest pricing. Fixed my brake issues quickly!"</p>
                <p className="text-sm text-gray-500">- Sarah M.</p>
              </div>
              
              <div className="border-b pb-4">
                <p className="text-lg italic mb-2">"Professional team, quick turnaround. Highly recommend!"</p>
                <p className="text-sm text-gray-500">- Mike T.</p>
              </div>
              
              <div>
                <p className="text-lg italic mb-2">"Best auto repair in Coburg North. Always reliable service."</p>
                <p className="text-sm text-gray-500">- Emma K.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Booking Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BOOK YOUR SERVICE
            </h2>
            <p className="text-xl text-white/80 font-light">Get your car back on the road</p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            onSubmit={handleBooking} 
            className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-white/50 font-light transition-all"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                required
                className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-white/50 font-light transition-all"
              />
            </div>
            
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="w-full bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-6 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-white/50 font-light transition-all"
            />
            
            <select
              name="service"
              required
              className="w-full bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-6 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white font-light transition-all"
            >
              <option value="" className="bg-slate-800">Select Service</option>
              {services.map((service, index) => (
                <option key={index} value={service.name} className="bg-slate-800">{service.name}</option>
              ))}
            </select>
            
            <textarea
              name="message"
              placeholder="Describe your car issue..."
              rows={4}
              className="w-full bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-8 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-white/50 font-light transition-all resize-none"
            ></textarea>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 backdrop-blur-md py-4 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 text-lg font-semibold font-display transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'SUBMITTING...' : 'BOOK NOW'}
            </button>
          </motion.form>

          {/* Beautiful Success Message */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-md rounded-2xl border border-green-400/30 p-6 shadow-2xl max-w-md mx-auto"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Booking Submitted! ✨</h3>
                <p className="text-green-100 text-sm leading-relaxed">
                  Thank you! Your service request has been received. We'll contact you within 24 hours to schedule your appointment.
                </p>
                <div className="mt-4 text-xs text-green-200">
                  📞 Emergency? Call us: <span className="font-semibold">0451 109 786</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/20 backdrop-blur-md py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <img 
                src="/Autoworx.webp" 
                alt="AutoworkX Logo" 
                className="w-48 h-auto object-contain"
              />
            </div>
            <div className="space-y-2">
              <p className="text-white/80 text-lg font-light tracking-wide">Next-Gen Mechanics. Zero Guesswork.</p>
              <p className="text-white/70 text-base font-light tracking-wide">Fix Fast. Roll Faster.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white/80 mb-12">
            <div className="text-center">
              <h4 className="font-semibold font-display mb-6 text-white text-xl">CONTACT</h4>
              <div className="space-y-3">
                <p className="flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5 text-green-400" />
                  0451 109 786
                </p>
                <p className="text-blue-300 font-medium">www.autoworkx.com.au</p>
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold font-display mb-6 text-white text-xl">LOCATION</h4>
              <div className="space-y-2">
                <p className="flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  1/87 Newlands Road
                </p>
              <p>Coburg North, VIC 3058</p>
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold font-display mb-6 text-white text-xl">HOURS</h4>
              <div className="space-y-2">
                <p>Mon-Fri: 8AM-6PM</p>
              <p>Sat: 9AM-4PM</p>
                <p className="text-red-400 font-medium">Sun: Closed</p>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-white/50 font-light">&copy; 2024 AutoworkX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;