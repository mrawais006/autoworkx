import React, { useState, useEffect } from 'react';
import { Star, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment: string;
  createTime: string;
  updateTime: string;
}

interface GoogleReviewsProps {
  locationId?: string;
  apiKey?: string;
  maxReviews?: number;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({ 
  locationId, 
  apiKey, 
  maxReviews = 6 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(5.0);

  // Convert star rating enum to number
  const getStarCount = (rating: string): number => {
    const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
    return ratingMap[rating as keyof typeof ratingMap] || 5;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch reviews from Google My Business API
  useEffect(() => {
    const fetchReviews = async () => {
      if (!locationId || !apiKey) {
        setError('API credentials not configured');
        setLoading(false);
        return;
      }

      try {
        // Note: This will require CORS proxy in production or server-side implementation
        const response = await fetch(
          `https://mybusiness.googleapis.com/v4/${locationId}/reviews?key=${apiKey}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`, // In real implementation, use OAuth token
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.reviews) {
          const sortedReviews = data.reviews
            .sort((a: Review, b: Review) => 
              new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
            )
            .slice(0, maxReviews);
          
          setReviews(sortedReviews);
          
          // Calculate average rating
          const avg = sortedReviews.reduce((sum: number, review: Review) => 
            sum + getStarCount(review.starRating), 0) / sortedReviews.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Using placeholder data.');
        
        // Fallback to placeholder data
        setReviews([]);
        setAverageRating(5.0);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [locationId, apiKey, maxReviews]);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-white/70">Loading reviews...</span>
        </div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block p-4 bg-red-500/20 rounded-full mb-4">
              <Star className="w-12 h-12 text-red-400" />
            </div>
          </div>
          <p className="text-lg font-light mb-4 text-white/70">Reviews Not Available</p>
          <p className="text-sm text-white/50 max-w-md mx-auto mb-6">{error}</p>
          <a 
            href="https://www.google.com/search?q=AutoworkX+Coburg+North+reviews" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 backdrop-blur-md px-6 py-3 rounded-xl border border-blue-500/30 hover:border-blue-400/50 text-white font-medium transition-all duration-300 hover:scale-105"
          >
            View Google Reviews
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
      {/* Rating Summary */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex text-yellow-400 text-2xl">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-8 h-8 fill-current" />
          ))}
        </div>
        <span className="ml-4 text-3xl font-bold font-display bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
          {averageRating}/5
        </span>
      </div>
      
      <p className="text-white/70 mb-8 text-lg font-light text-center">
        Based on Live Google Reviews
      </p>

      {/* Reviews Grid */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div 
              key={review.reviewId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              {/* Reviewer Info */}
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                  {review.reviewer.profilePhotoUrl ? (
                    <img 
                      src={review.reviewer.profilePhotoUrl} 
                      alt={review.reviewer.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-white font-medium text-sm">
                    {review.reviewer.displayName}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(getStarCount(review.starRating))].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-white/50 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(review.createTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              {review.comment && (
                <p className="text-white/80 text-sm leading-relaxed">
                  "{review.comment}"
                </p>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-white/60 mb-6">No reviews loaded yet</p>
          <a 
            href="https://www.google.com/search?q=AutoworkX+Coburg+North+reviews" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 backdrop-blur-md px-6 py-3 rounded-xl border border-blue-500/30 hover:border-blue-400/50 text-white font-medium transition-all duration-300 hover:scale-105"
          >
            View Google Reviews
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default GoogleReviews;