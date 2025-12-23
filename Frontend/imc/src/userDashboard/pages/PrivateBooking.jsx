import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, addDays } from 'date-fns';
import { PartyPopper, Heart, Building2, Music, Users, Sparkles, Calendar } from 'lucide-react';
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import { motion } from 'framer-motion';

const eventTypes = [
  { value: 'birthday', label: 'Birthday Party', icon: PartyPopper, color: 'from-pink-500 to-rose-500' },
  { value: 'anniversary', label: 'Anniversary', icon: Heart, color: 'from-red-500 to-pink-500' },
  { value: 'corporate', label: 'Corporate Event', icon: Building2, color: 'from-blue-500 to-indigo-500' },
  { value: 'wedding', label: 'Wedding Celebration', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
  { value: 'private_concert', label: 'Private Concert', icon: Music, color: 'from-violet-500 to-purple-500' },
  { value: 'other', label: 'Other Event', icon: Users, color: 'from-slate-500 to-slate-600' },
];

export default function PrivateBooking() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_number: '',
    email: '',
    event_type: '',
    event_time: '',
    number_of_guests: '',
    special_requests: '',
    estimated_budget: '',
  });

  const bookingMutation = useMutation({
    mutationFn: (data) => base44.entities.PrivateBooking.create(data),
    onSuccess: () => {
      toast.success('Booking request submitted! Our team will contact you within 24 hours.');
      setFormData({
        customer_name: '',
        contact_number: '',
        email: '',
        event_type: '',
        event_time: '',
        number_of_guests: '',
        special_requests: '',
        estimated_budget: '',
      });
      setSelectedDate(null);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.contact_number || !formData.event_type || !selectedDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    bookingMutation.mutate({
      ...formData,
      event_date: format(selectedDate, 'yyyy-MM-dd'),
      number_of_guests: parseInt(formData.number_of_guests) || 0,
      estimated_budget: parseFloat(formData.estimated_budget) || 0,
    });
  };

  const selectedEventType = eventTypes.find(t => t.value === formData.event_type);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/50 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block text-emerald-600 font-semibold text-sm tracking-wider uppercase mb-4">
              Private Events
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Host Your
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Special Occasion
              </span>
            </h1>
            <p className="text-xl text-slate-600">
              Create unforgettable memories with our customized private event packages. 
              From intimate gatherings to grand celebrations.
            </p>
          </motion.div>

          {/* Event Type Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12"
          >
            {eventTypes.map((type, index) => (
              <button
                key={type.value}
                onClick={() => setFormData({...formData, event_type: type.value})}
                className={`relative p-4 rounded-2xl transition-all duration-300 ${
                  formData.event_type === type.value
                    ? 'bg-white shadow-xl scale-105 ring-2 ring-emerald-500'
                    : 'bg-white/60 hover:bg-white hover:shadow-lg'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mx-auto mb-3`}>
                  <type.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium text-slate-700 text-center">{type.label}</div>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100"
          >
            <div className="p-8 bg-gradient-to-r from-emerald-600 to-teal-500">
              <h2 className="text-2xl font-bold text-white">Book Your Private Event</h2>
              <p className="text-emerald-100">Tell us about your special occasion</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Select Event Date *</Label>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < addDays(new Date(), 7)}
                      className="rounded-xl"
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">* Minimum 7 days advance booking required</p>
                </div>

                {/* Event Details */}
                <div className="space-y-6">
                  <div>
                    <Label>Event Type *</Label>
                    <Select 
                      value={formData.event_type} 
                      onValueChange={(v) => setFormData({...formData, event_type: v})}
                    >
                      <SelectTrigger className="mt-2 h-12 rounded-xl">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Event Time</Label>
                    <Select 
                      value={formData.event_time} 
                      onValueChange={(v) => setFormData({...formData, event_time: v})}
                    >
                      <SelectTrigger className="mt-2 h-12 rounded-xl">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10:00 AM - 2:00 PM">10:00 AM - 2:00 PM</SelectItem>
                        <SelectItem value="2:00 PM - 6:00 PM">2:00 PM - 6:00 PM</SelectItem>
                        <SelectItem value="6:00 PM - 10:00 PM">6:00 PM - 10:00 PM</SelectItem>
                        <SelectItem value="Full Day">Full Day Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Number of Guests</Label>
                    <Input
                      type="number"
                      value={formData.number_of_guests}
                      onChange={(e) => setFormData({...formData, number_of_guests: e.target.value})}
                      placeholder="Expected number of guests"
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label>Estimated Budget ($)</Label>
                    <Input
                      type="number"
                      value={formData.estimated_budget}
                      onChange={(e) => setFormData({...formData, estimated_budget: e.target.value})}
                      placeholder="Your budget"
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
                </div>

                <div className="mt-6">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email"
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>

                <div className="mt-6">
                  <Label>Special Requests</Label>
                  <Textarea
                    value={formData.special_requests}
                    onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                    placeholder="Tell us about any special requirements, themes, or preferences..."
                    className="mt-2 rounded-xl min-h-32"
                  />
                </div>
              </div>

              {/* Summary */}
              {selectedDate && formData.event_type && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">Booking Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-slate-600">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedEventType && <selectedEventType.icon className="w-5 h-5 text-emerald-600" />}
                      <span>{selectedEventType?.label}</span>
                    </div>
                    {formData.event_time && (
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-600">🕐</span>
                        <span>{formData.event_time}</span>
                      </div>
                    )}
                    {formData.number_of_guests && (
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <span>{formData.number_of_guests} guests</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={bookingMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 rounded-xl py-6 text-lg"
              >
                {bookingMutation.isPending ? 'Submitting...' : 'Submit Booking Request'}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}