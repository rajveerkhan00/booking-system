# Iframe Search to Booking Page - Implementation Complete ✅

## Overview
Successfully implemented functionality to redirect search button clicks from the embedded booking form to the parent website's `/booking` page.

## What Was Changed

### 1. Airport Transfers Form (`app/components/airport-transfers-form.tsx`)
Modified the `handleSearch` function to:
- Check for the `redirectOnSearch=true` URL parameter
- Detect if the form is running inside an iframe
- Send form data to the parent window via `postMessage` instead of processing the search locally
- Include all relevant form fields: locations, dates, times, passengers, route information, and coordinates

### 2. Car Rentals Form (`app/components/car-rentals-form.tsx`)
Modified the `handleSearch` function to:
- Check for the `redirectOnSearch=true` URL parameter
- Detect if the form is running inside an iframe
- Send form data to the parent window via `postMessage` instead of processing the search locally
- Include all relevant form fields: locations, dates, times, different drop-off option, and coordinates

## How It Works

### Step 1: Embedding with Parameter
When embedding the booking form in your website, add the `redirectOnSearch=true` parameter to the iframe URL:

```html
<iframe
  id="booking-iframe"
  src="https://booking-system-rouge-phi.vercel.app/embed?domain=YOUR_DOMAIN&hide-bg=true&hide-header=true&redirectOnSearch=true"
  style="width: 100%; border: none; overflow: hidden;"
></iframe>
```

### Step 2: Form Detects Parameter
When the search button is clicked:
1. The form checks if `redirectOnSearch=true` is in the URL
2. It verifies it's running inside an iframe (`window.parent !== window`)
3. If both conditions are true, it sends the form data to the parent window

### Step 3: PostMessage Structure
The embedded form sends a message with this structure:

```javascript
{
  type: 'searchClicked',
  formData: {
    serviceType: 'airport-transfers' | 'car-rentals',
    pickupLocation: string,
    dropoffLocation: string,
    pickupDate: string,
    pickupTime: string,
    returnDate?: string,
    returnTime?: string,
    passengers?: string,
    mode: 'transfer' | 'rental',
    estimatedDistance?: string,
    estimatedDuration?: string,
    pickupCoords?: { lat: number; lon: number },
    dropoffCoords?: { lat: number; lon: number }
  }
}
```

### Step 4: Parent Website Listens
Your parent website needs to listen for this message and handle the redirect. Here's the code you need to add:

```javascript
// Listen for messages from the iframe
window.addEventListener('message', (event) => {
  // Verify the message is from the booking form
  if (event.data.type === 'searchClicked') {
    const formData = event.data.formData;
    
    // Store the form data (e.g., in sessionStorage)
    sessionStorage.setItem('bookingFormData', JSON.stringify(formData));
    
    // Redirect to the booking page
    window.location.href = '/booking';
  }
});
```

### Step 5: Display on Booking Page
On your `/booking` page, retrieve and use the form data:

```javascript
// On the /booking page
const storedData = sessionStorage.getItem('bookingFormData');
if (storedData) {
  const formData = JSON.parse(storedData);
  
  // Use formData to pre-fill the booking form or show step 2
  console.log('Received form data:', formData);
  
  // Clear the storage after use
  sessionStorage.removeItem('bookingFormData');
}
```

## Testing Locally

1. **Booking System** is running on: `http://localhost:3001`
2. **Embed URL**: `http://localhost:3001/embed?redirectOnSearch=true`

### Test Steps:
1. Create a simple HTML file on your parent website with the iframe and message listener
2. Fill out the booking form in the iframe
3. Click the "Search" button
4. Verify that the postMessage is sent and the parent website redirects to `/booking`

## Deployment

Once you deploy the updated booking system to Vercel, the embed URL will be:
```
https://booking-system-rouge-phi.vercel.app/embed?domain=YOUR_DOMAIN&hide-bg=true&hide-header=true&redirectOnSearch=true
```

## Next Steps

On your main website (the one embedding the iframe), you need to:

1. ✅ Add the `redirectOnSearch=true` parameter to the iframe URL (already done in hero.tsx)
2. ✅ Add the message event listener to handle the postMessage (already done in hero.tsx)
3. ⚠️ Create or update the `/booking` page to:
   - Retrieve the form data from sessionStorage
   - Display the booking form in "step 2" mode with the data pre-filled
   - Show the appropriate service (airport transfers or car rentals)

## Benefits

✅ **Seamless UX**: Users can search on the homepage and continue booking on a dedicated page  
✅ **Data Persistence**: All form data is preserved during the redirect  
✅ **Flexible**: Works with both Airport Transfers and Car Rentals  
✅ **Safe**: Only responds when the correct parameter is present  
✅ **Complete Data**: Includes coordinates, route info, and all user inputs

## Code Quality

- **TypeScript**: Fully typed with proper type annotations
- **Error Handling**: Checks for iframe context before sending postMessage
- **Backward Compatible**: Normal search behavior still works without the parameter
- **Clean Code**: Minimal changes, clear comments, no breaking changes
