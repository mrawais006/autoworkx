// Form submission utility with multiple fallback methods
export interface FormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  message?: string;
  timestamp: string;
  source: string;
}

export const submitFormData = async (data: FormData): Promise<boolean> => {
  const params = new URLSearchParams();
  params.append('name', data.name || '');
  params.append('phone', data.phone || '');
  params.append('email', data.email || '');
  params.append('service', data.service || '');
  params.append('message', data.message || '');
  params.append('timestamp', data.timestamp);
  params.append('source', data.source);

  const targetUrl = `https://script.google.com/macros/s/AKfycbw5qrBp_81Q69gTp-7Ok9DuaxpFiyeShRjWmq76y2iEtpH2W5xvOF_EHW7ecvGgT_vTqg/exec?${params.toString()}`;

  // Method 1: Try direct fetch (works in development)
  try {
    await fetch(targetUrl, {
      method: 'GET',
      mode: 'no-cors' // This allows the request but we can't read the response
    });
    console.log('Direct fetch attempted');
    return true;
  } catch (error) {
    console.log('Direct fetch failed, trying CORS proxy...');
  }

  // Method 2: CORS Proxy
  try {
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(corsProxy + targetUrl, {
      method: 'GET',
      headers: {
        'Origin': 'https://autoworks.com.au'
      }
    });
    
    if (response.ok) {
      console.log('Form submitted successfully via CORS proxy');
      return true;
    }
  } catch (error) {
    console.log('CORS proxy failed, trying iframe method...');
  }

  // Method 3: Iframe method
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = targetUrl;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
    
    console.log('Request sent via iframe to Google Apps Script');
    return true;
  } catch (error) {
    console.log('Iframe method failed, trying form action...');
  }

  // Method 4: Form action (most reliable for production)
  try {
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = targetUrl;
    form.target = '_blank';
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    console.log('Form submitted via form action');
    return true;
  } catch (error) {
    console.error('All submission methods failed:', error);
    return false;
  }
};

// Alternative: Use a webhook service like webhook.site for testing
export const submitToWebhook = async (data: FormData): Promise<boolean> => {
  try {
    // You can replace this with your own webhook endpoint
    const webhookUrl = 'https://webhook.site/your-unique-url';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      console.log('Data sent to webhook successfully');
      return true;
    }
  } catch (error) {
    console.error('Webhook submission failed:', error);
  }
  
  return false;
}; 