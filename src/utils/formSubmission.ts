// Form submission utility with production-ready methods
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

  const targetUrl = `https://script.google.com/macros/s/AKfycbw5qrBp_81Q69gTp-7Ok9DuaxpFiyeShRjWmq76y2iEtpH2W5xvOF_EHW7ecvGgT_vTqg/exec`;

  // Method 1: Hidden iframe method (most reliable for production)
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    
    // Create the URL with parameters
    iframe.src = `${targetUrl}?${params.toString()}`;
    
    document.body.appendChild(iframe);
    
    // Clean up after 3 seconds
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 3000);
    
    console.log('Form data sent via hidden iframe');
    return true;
  } catch (error) {
    console.log('Iframe method failed, trying image pixel method...');
  }

  // Method 2: Image pixel method (works in most environments)
  try {
    const img = new Image();
    img.style.display = 'none';
    
    // Use the image onload/onerror to clean up
    img.onload = img.onerror = () => {
      // Clean up
      img.src = '';
    };
    
    img.src = `${targetUrl}?${params.toString()}&_=${Date.now()}`;
    
    console.log('Form data sent via image pixel');
    return true;
  } catch (error) {
    console.log('Image pixel method failed, trying fetch with no-cors...');
  }

  // Method 3: Fetch with no-cors (backup method)
  try {
    await fetch(`${targetUrl}?${params.toString()}`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    console.log('Form data sent via fetch no-cors');
    return true;
  } catch (error) {
    console.log('Fetch method failed, trying hidden form submission...');
  }

  // Method 4: Hidden form submission (last resort - no new tab)
  try {
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = targetUrl;
    form.target = 'hidden_iframe_' + Date.now();
    form.style.display = 'none';
    
    // Create hidden iframe for form target (prevents new tab)
    const iframe = document.createElement('iframe');
    iframe.name = form.target;
    iframe.style.display = 'none';
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    
    // Add form fields
    params.forEach((value, key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    
    form.submit();
    
    // Clean up after 3 seconds
    setTimeout(() => {
      if (document.body.contains(form)) document.body.removeChild(form);
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    }, 3000);
    
    console.log('Form data sent via hidden form submission');
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