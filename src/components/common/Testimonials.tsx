import React from 'react';
import { Star } from 'lucide-react';

interface Review {
  quote: string;
  name: string;
  location: string;
  initials: string;
  gradient: string;
}

const REVIEWS: Review[] = [
  {
    quote: "Traveling from Senpara Mirpur to Gazipur every week used to be a nightmare of surge pricing. With Tripyy, I set my fare at BDT 1600 and get a Hiace or Sedan in minutes!",
    name: "Mohammad Rafiq",
    location: "Mirpur, Dhaka",
    initials: "MR",
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    quote: "We booked a Chander Gari for our Sajek tour right through the app. The driver was verified, polite, and negotiated directly without any middleman commissions.",
    name: "Tahsina Akter",
    location: "Dhanmondi, Dhaka",
    initials: "TA",
    gradient: "from-amber-500 to-red-500",
  },
  {
    quote: "The live tracking foreground service is incredible. My family could follow my journey to Gazipur in real-time with the arrival countdown. Super safe and transparent!",
    name: "Shakil Ahmed",
    location: "Uttara, Dhaka",
    initials: "SA",
    gradient: "from-indigo-500 to-blue-500",
  },
];

export const Testimonials: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {REVIEWS.map((review, idx) => (
        <div
          key={idx}
          className="bg-brand-card/75 border border-white/10 rounded-2xl p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
        >
          <div>
            <div className="flex items-center gap-1 mb-4 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
              &ldquo;{review.quote}&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center font-bold text-white text-xs shadow-md`}
            >
              {review.initials}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{review.name}</div>
              <div className="text-xs text-slate-400">{review.location}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
