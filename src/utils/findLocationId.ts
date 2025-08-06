// Utility to help find Google My Business Location ID
// This will be used temporarily to identify your business location

interface Account {
  name: string;
  accountName: string;
  type: string;
}

interface Location {
  name: string;
  locationName: string;
  primaryPhone: string;
  address: {
    addressLines: string[];
    locality: string;
    administrativeArea: string;
    postalCode: string;
    country: string;
  };
}

export const findGoogleBusinessAccounts = async (accessToken: string) => {
  try {
    const response = await fetch(
      'https://mybusiness.googleapis.com/v4/accounts',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.accounts || [];
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

export const findGoogleBusinessLocations = async (
  accountName: string, 
  accessToken: string
) => {
  try {
    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/${accountName}/locations`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.locations || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

// Helper function to display account and location info
export const displayBusinessInfo = (accounts: Account[], locations: Location[]) => {
  console.log('=== YOUR GOOGLE BUSINESS ACCOUNTS ===');
  accounts.forEach((account, index) => {
    console.log(`${index + 1}. Account Name: ${account.accountName}`);
    console.log(`   Account ID: ${account.name}`);
    console.log(`   Type: ${account.type}`);
    console.log('');
  });

  console.log('=== YOUR BUSINESS LOCATIONS ===');
  locations.forEach((location, index) => {
    console.log(`${index + 1}. Business: ${location.locationName || 'Unnamed Location'}`);
    console.log(`   Location ID: ${location.name} <- USE THIS IN YOUR .env FILE`);
    console.log(`   Phone: ${location.primaryPhone || 'Not provided'}`);
    if (location.address) {
      console.log(`   Address: ${location.address.addressLines?.join(', ')}`);
      console.log(`   City: ${location.address.locality}`);
      console.log(`   State: ${location.address.administrativeArea}`);
    }
    console.log('');
  });

  // Find AutoworkX location specifically
  const autoworkxLocation = locations.find(loc => 
    loc.locationName?.toLowerCase().includes('autoworkx') ||
    loc.address?.locality?.toLowerCase().includes('coburg') ||
    loc.primaryPhone?.includes('0451109786')
  );

  if (autoworkxLocation) {
    console.log('🎯 FOUND YOUR AUTOWORKX LOCATION:');
    console.log(`Location ID: ${autoworkxLocation.name}`);
    console.log('Copy this Location ID to your .env file as VITE_GOOGLE_LOCATION_ID');
  }
};

// Main function to run the discovery process
export const discoverBusinessLocation = async (accessToken: string) => {
  try {
    console.log('🔍 Searching for your Google Business accounts...');
    const accounts = await findGoogleBusinessAccounts(accessToken);
    
    if (accounts.length === 0) {
      throw new Error('No Google Business accounts found');
    }

    console.log('✅ Found accounts, now searching for locations...');
    
    let allLocations: Location[] = [];
    for (const account of accounts) {
      try {
        const locations = await findGoogleBusinessLocations(account.name, accessToken);
        allLocations.push(...locations);
      } catch (error) {
        console.warn(`Could not fetch locations for account ${account.name}:`, error);
      }
    }

    displayBusinessInfo(accounts, allLocations);
    
    return { accounts, locations: allLocations };
  } catch (error) {
    console.error('❌ Error discovering business location:', error);
    throw error;
  }
};