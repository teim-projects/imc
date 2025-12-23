import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Music, Award, Clock, CheckCircle, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from 'framer-motion';

const batches = [
  { value: 'morning', label: 'Morning (9 AM - 11 AM)', days: 'Mon, Wed, Fri' },
  { value: 'afternoon', label: 'Afternoon (2 PM - 4 PM)', days: 'Tue, Thu, Sat' },
  { value: 'evening', label: 'Evening (6 PM - 8 PM)', days: 'Mon, Wed, Fri' },
  { value: 'weekend', label: 'Weekend (10 AM - 1 PM)', days: 'Sat, Sun' },
];

const benefits = [
  'Expert vocal coaches with 10+ years experience',
  'Small batch sizes for personalized attention',
  'Regular performance opportunities',
  'Access to practice rooms',
  'Recording session included',
  'Certificate upon completion',
];

const instructors = [
  {
    name: 'Sarah Mitchell',
    specialty: 'Western Classical',
    experience: '15 years',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
  },
  {
    name: 'David Chen',
    specialty: 'Pop & Contemporary',
    experience: '12 years',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
  },
  {
    name: 'Priya Sharma',
    specialty: 'Indian Classical',
    experience: '18 years',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
  },
];

export default function SingingClasses() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    preferred_batch: '',
    reference_by: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const admissionMutation = useMutation({
    mutationFn: (data) => base44.entities.SingingClass.create(data),
    onSuccess: () => {
      toast.success('Admission request submitted! We will contact you shortly.');
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        preferred_batch: '',
        reference_by: '',
      });
      setAcceptTerms(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.phone || !formData.email || !formData.preferred_batch) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    admissionMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/50 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="inline-block text-blue-600 font-semibold text-sm tracking-wider uppercase mb-4">
                Learn to Sing
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                Unlock Your
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Vocal Potential
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Join our professional singing classes and transform your voice with expert guidance. 
                Perfect for beginners and advanced singers alike.
              </p>

              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-slate-700">Small Batches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-slate-700">Certified Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-slate-700">Flexible Timings</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-sm text-slate-600 mb-2">Monthly Fee</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-600">$150</span>
                  <span className="text-slate-500">/ month</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-200">
                <img 
                  src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=500&fit=crop"
                  alt="Singing Class"
                  className="w-full h-80 object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Benefits List */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-8">What You'll Get</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 bg-blue-50 rounded-xl p-4"
                  >
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Instructors */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Meet Our Instructors</h2>
              <div className="space-y-4">
                {instructors.map((instructor, index) => (
                  <motion.div
                    key={instructor.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-lg shadow-slate-100 border border-slate-100"
                  >
                    <img 
                      src={instructor.image} 
                      alt={instructor.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{instructor.name}</h3>
                      <p className="text-sm text-blue-600">{instructor.specialty}</p>
                      <p className="text-sm text-slate-500">{instructor.experience} experience</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Admission Form */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden"
          >
            <div className="p-8 bg-gradient-to-r from-blue-600 to-cyan-500">
              <h2 className="text-2xl font-bold text-white">Admission Form</h2>
              <p className="text-blue-100">Join our singing classes today</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    placeholder="Enter first name"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    placeholder="Enter last name"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label>Street Address</Label>
                <Input
                  value={formData.street_address}
                  onChange={(e) => setFormData({...formData, street_address: e.target.value})}
                  placeholder="Enter street address"
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="City"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    placeholder="State"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    placeholder="Zip code"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Preferred Batch *</Label>
                  <Select 
                    value={formData.preferred_batch} 
                    onValueChange={(v) => setFormData({...formData, preferred_batch: v})}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-xl">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map(batch => (
                        <SelectItem key={batch.value} value={batch.value}>
                          <div>
                            <div>{batch.label}</div>
                            <div className="text-xs text-slate-500">{batch.days}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div className="flex items-center gap-3">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={setAcceptTerms}
                />
                <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                  I accept the terms and conditions
                </label>
              </div>

              <Button
                type="submit"
                disabled={admissionMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl py-6 text-lg"
              >
                {admissionMutation.isPending ? 'Submitting...' : 'Submit Admission Request'}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}