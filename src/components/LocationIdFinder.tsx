import React, { useState } from 'react';
import { Search, Key, MapPin } from 'lucide-react';
import { discoverBusinessLocation } from '../utils/findLocationId';

const LocationIdFinder: React.FC = () => {
  const [accessToken, setAccessToken] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!accessToken.trim()) {
      setError('Please enter your OAuth access token');
      return;
    }

    setSearching(true);
    setError(null);
    setResults(null);

    try {
      const businessInfo = await discoverBusinessLocation(accessToken);
      setResults(businessInfo);
      
      // Also log to console for easy copying
      console.log('Business discovery results:', businessInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search for business locations');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-blue-500/20 rounded-full mb-4">
          <Search className="w-12 h-12 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Find Your Location ID</h3>
        <p className="text-white/70">
          This tool will help you discover your Google Business Location ID
        </p>
      </div>

      <div className="space-y-6">
        {/* OAuth Token Input */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            <Key className="w-4 h-4 inline mr-2" />
            OAuth 2.0 Access Token
          </label>
          <textarea
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Paste your OAuth access token here..."
            rows={3}
            className="w-full bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-white/50 font-mono text-sm"
          />
          <p className="text-white/50 text-xs mt-2">
            Get this from Google OAuth 2.0 Playground or your authentication flow
          </p>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={searching || !accessToken.trim()}
          className="w-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 backdrop-blur-md py-4 rounded-xl border border-blue-500/30 hover:border-blue-400/50 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {searching ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Searching...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              Find My Business Locations
            </div>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-green-400" />
              <h4 className="text-green-300 font-semibold">Business Locations Found</h4>
            </div>
            
            {results.locations.length > 0 ? (
              <div className="space-y-4">
                {results.locations.map((location: any, index: number) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">
                      {location.locationName || `Location ${index + 1}`}
                    </h5>
                    <div className="bg-gray-800/50 rounded p-3 mb-2">
                      <code className="text-green-400 text-sm break-all">
                        {location.name}
                      </code>
                    </div>
                    <p className="text-white/70 text-sm">
                      ☝️ Copy this Location ID to your .env file
                    </p>
                    {location.address && (
                      <p className="text-white/60 text-xs mt-2">
                        {location.address.addressLines?.join(', ')}, {location.address.locality}
                      </p>
                    )}
                  </div>
                ))}
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                  <p className="text-blue-300 text-sm">
                    ✅ <strong>Next Step:</strong> Copy the Location ID above and add it to your .env file as <code className="bg-white/10 px-1 rounded">VITE_GOOGLE_LOCATION_ID</code>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-yellow-300 text-sm">
                No locations found. Make sure your access token has the correct permissions.
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h4 className="text-white font-semibold mb-3">How to get an OAuth Access Token:</h4>
          <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
            <li>Go to <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google OAuth 2.0 Playground</a></li>
            <li>In "Step 1", find and select "Google My Business API v4"</li>
            <li>Click "Authorize APIs" and sign in with your business Google account</li>
            <li>In "Step 2", click "Exchange authorization code for tokens"</li>
            <li>Copy the "Access token" and paste it above</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LocationIdFinder;