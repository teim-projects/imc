import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, addDays } from 'date-fns';
import { Speaker, Mic2, Music, Radio, Headphones, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from 'framer-motion';

const services = [
  { id: 'basic_pa', name: 'Basic PA System', description: 'Speakers + Microphone', price: 150, icon: Speaker },
  { id: 'advanced_pa', name: 'Advanced PA System', description: 'Multi-mic + Professional Mixer', price: 300, icon: Mic2 },
  { id: 'dj_setup', name: 'DJ Setup', description: 'Complete DJ equipment package', price: 250, icon: Music },
  { id: 'stage_monitoring', name: 'Stage Monitoring', description: 'Floor monitors or in-ear systems', price: 175, icon: Headphones },
  { id: 'sound_engineering', name: 'Live Sound Engineering', description: 'Professional sound engineer', price: 200, icon: Radio },
  { id: 'live_recording', name: 'Live Recording', description: 'Multi-track live recording', price: 350, icon: Mic2 },
  { id: 'lighting_fx', name: 'Lighting & FX', description: 'Stage lighting and effects', price: 400, icon: Speaker },
];

export default function SoundServices() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_number: '',
    email: '',
    address: '',
    event_type: '',
    event_venue: '',
    expected_audience: '',
  });

  const bookingMutation = useMutation({
    mutationFn: (data) => base44.entities.SoundService.create(data),
    onSuccess: () => {
      toast.success('Quote request submitted! Our team will contact you within 24 hours.');
      setFormData({
        customer_name: '',
        contact_number: '',
        email: '',
        address: '',
        event_type: '',
        event_venue: '',
        expected_audience: '',
      });
      setSelectedDate(null);
      setSelectedServices([]);
    }
  });

  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const totalPrice = selectedServices.reduce((sum, id) => {
    const service = services.find(s => s.id === id);
    return sum + (service?.price || 0);
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.contact_number || !selectedDate || !formData.event_venue) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    bookingMutation.mutate({
      ...formData,
      event_date: format(selectedDate, 'yyyy-MM-dd'),
      services: selectedServices,
      expected_audience: parseInt(formData.expected_audience) || 0,
      total_amount: totalPrice,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-amber-50 to-yellow-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200/50 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="inline-block text-amber-600 font-semibold text-sm tracking-wider uppercase mb-4">
                Sound System Services
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                Professional
                <span className="block bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
                  Sound Solutions
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Complete sound system rental and services for events of any scale. 
                From intimate gatherings to large-scale concerts.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="text-3xl font-bold text-amber-600">500+</div>
                  <div className="text-sm text-slate-600">Events Covered</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="text-3xl font-bold text-amber-600">50K+</div>
                  <div className="text-sm text-slate-600">Max Audience</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-amber-200">
                <img 
                  src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=500&fit=crop"
                  alt="Sound System"
                  className="w-full h-80 object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Selection */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Select Your Services</h2>
            <p className="text-slate-600">Choose the services you need for your event</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  onClick={() => toggleService(service.id)}
                  className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2 ${
                    selectedServices.includes(service.id)
                      ? 'border-amber-500 bg-amber-50 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedServices.includes(service.id)
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-500'
                        : 'bg-slate-100'
                    }`}>
                      <service.icon className={`w-6 h-6 ${
                        selectedServices.includes(service.id) ? 'text-white' : 'text-slate-600'
                      }`} />
                    </div>
                    <Checkbox 
                      checked={selectedServices.includes(service.id)}
                      className="mt-1"
                    />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-slate-500 mb-3">{service.description}</p>
                  <div className="text-xl font-bold text-amber-600">${service.price}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-6 text-white"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <div className="text-sm text-amber-100">Selected Services: {selectedServices.length}</div>
                  <div className="text-3xl font-bold">Estimated Total: ${totalPrice}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map(id => {
                    const service = services.find(s => s.id === id);
                    return (
                      <span key={id} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        {service?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden"
          >
            <div className="p-8 bg-gradient-to-r from-amber-600 to-yellow-500">
              <h2 className="text-2xl font-bold text-white">Request a Quote</h2>
              <p className="text-amber-100">Fill in your event details</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Event Date *</Label>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < addDays(new Date(), 3)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-6">
                  <div>
                    <Label>Event Type</Label>
                    <Select 
                      value={formData.event_type} 
                      onValueChange={(v) => setFormData({...formData, event_type: v})}
                    >
                      <SelectTrigger className="mt-2 h-12 rounded-xl">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Event Venue *</Label>
                    <Input
                      value={formData.event_venue}
                      onChange={(e) => setFormData({...formData, event_venue: e.target.value})}
                      placeholder="Venue name and address"
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label>Expected Audience Size</Label>
                    <Input
                      type="number"
                      value={formData.expected_audience}
                      onChange={(e) => setFormData({...formData, expected_audience: e.target.value})}
                      placeholder="Approximate number of attendees"
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-8 border-t border-slate-200">
                <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      placeholder="Enter your name"
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={formData.contact_number}
                      onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                      placeholder="Enter phone number"
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter email"
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Your address"
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              {selectedServices.length > 0 && selectedDate && (
                <div className="bg-amber-50 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">Quote Summary</h3>
                  <div className="space-y-2">
                    {selectedServices.map(id => {
                      const service = services.find(s => s.id === id);
                      return (
                        <div key={id} className="flex justify-between">
                          <span>{service?.name}</span>
                          <span className="font-medium">${service?.price}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between pt-4 border-t border-amber-200">
                      <span className="font-semibold">Estimated Total:</span>
                      <span className="text-2xl font-bold text-amber-600">${totalPrice}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-4">* Final quote may vary based on event specifics</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={bookingMutation.isPending}
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 rounded-xl py-6 text-lg"
              >
                {bookingMutation.isPending ? 'Submitting...' : 'Request Quote'}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}