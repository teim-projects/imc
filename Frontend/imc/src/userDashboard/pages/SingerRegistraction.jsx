import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Music, Star, Award, Mic2, Users, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from 'framer-motion';

const benefits = [
  { icon: Star, title: 'Priority Booking', description: 'Get first access to studio slots and events' },
  { icon: Mic2, title: 'Free Studio Hours', description: '2 hours free studio time every month' },
  { icon: Award, title: 'Performance Opportunities', description: 'Feature at our live shows and events' },
  { icon: Users, title: 'Networking', description: 'Connect with other artists and industry professionals' },
];

const membershipPlans = [
  { name: 'Basic', price: 49, features: ['Priority event booking', 'Member discounts (10%)', 'Monthly newsletter'] },
  { name: 'Artist', price: 99, popular: true, features: ['All Basic features', '2 hours free studio/month', 'Performance opportunities', 'Profile on website'] },
  { name: 'Pro', price: 199, features: ['All Artist features', '5 hours free studio/month', 'Priority performance slots', 'Personal promotion', 'Recording discount (30%)'] },
];

export default function SingerRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    mobile: '',
    profession: '',
    music_education: '',
    achievements: '',
    favourite_singer: '',
    reference_by: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const registrationMutation = useMutation({
    mutationFn: (data) => base44.entities.Singer.create(data),
    onSuccess: () => {
      toast.success('Registration submitted! We will review your application and contact you soon.');
      setFormData({
        name: '',
        birth_date: '',
        mobile: '',
        profession: '',
        music_education: '',
        achievements: '',
        favourite_singer: '',
        reference_by: '',
      });
      setAcceptTerms(false);
      setSelectedPlan(null);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    registrationMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-violet-50 to-purple-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="inline-block text-violet-600 font-semibold text-sm tracking-wider uppercase mb-4">
                Club Membership
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                Join Our
                <span className="block bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                  Artist Community
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Become a member and unlock exclusive benefits, networking opportunities, 
                and priority access to all our services and events.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
                  >
                    <benefit.icon className="w-8 h-8 text-violet-600 mb-2" />
                    <h3 className="font-semibold text-slate-900">{benefit.title}</h3>
                    <p className="text-sm text-slate-600">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-violet-200">
                <img 
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=500&fit=crop"
                  alt="Artist Community"
                  className="w-full h-80 object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
            <p className="text-slate-600">Select the membership that suits your needs</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {membershipPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`relative cursor-pointer rounded-3xl p-8 transition-all duration-300 h-full ${
                    selectedPlan === plan.name
                      ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-2xl scale-105'
                      : 'bg-white border border-slate-200 hover:shadow-xl hover:border-violet-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className={`text-2xl font-bold mb-2 ${selectedPlan === plan.name ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name}
                    </h3>
                    <div className={`text-4xl font-bold ${selectedPlan === plan.name ? 'text-white' : 'text-violet-600'}`}>
                      ${plan.price}
                      <span className="text-lg font-normal">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
                          selectedPlan === plan.name ? 'text-white' : 'text-green-500'
                        }`} />
                        <span className={selectedPlan === plan.name ? 'text-white/90' : 'text-slate-600'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full mt-6 rounded-xl ${
                      selectedPlan === plan.name
                        ? 'bg-white text-violet-600 hover:bg-white/90'
                        : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700'
                    }`}
                  >
                    {selectedPlan === plan.name ? 'Selected' : 'Select Plan'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden"
          >
            <div className="p-8 bg-gradient-to-r from-violet-600 to-purple-600">
              <h2 className="text-2xl font-bold text-white">Singer Registration Form</h2>
              <p className="text-violet-100">Join our artist community today</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Mobile Number *</Label>
                  <Input
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    placeholder="Enter mobile number"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>Profession</Label>
                  <Input
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    placeholder="Your profession"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label>Education in Music (if any)</Label>
                <Textarea
                  value={formData.music_education}
                  onChange={(e) => setFormData({...formData, music_education: e.target.value})}
                  placeholder="Describe your musical education or training"
                  className="mt-2 rounded-xl"
                />
              </div>

              <div>
                <Label>Special Achievements (if any)</Label>
                <Textarea
                  value={formData.achievements}
                  onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                  placeholder="Any awards, recognitions, or notable performances"
                  className="mt-2 rounded-xl"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Favourite Singer</Label>
                  <Input
                    value={formData.favourite_singer}
                    onChange={(e) => setFormData({...formData, favourite_singer: e.target.value})}
                    placeholder="Who inspires you?"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>Referred By</Label>
                  <Input
                    value={formData.reference_by}
                    onChange={(e) => setFormData({...formData, reference_by: e.target.value})}
                    placeholder="Who referred you?"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={setAcceptTerms}
                />
                <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                  I accept the terms and conditions and agree to the membership guidelines
                </label>
              </div>

              <Button
                type="submit"
                disabled={registrationMutation.isPending}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl py-6 text-lg"
              >
                {registrationMutation.isPending ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}