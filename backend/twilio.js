const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

// Initialize Twilio client
try {
  if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
  } else {
    console.log('Twilio credentials not provided. Mail functionality will be disabled.');
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
  // For development purposes, we can continue without Twilio
  console.log('Continuing without Mail integration');
}

// Function to send Mail
const sendMail = async (to, body) => {
  if (!client) {
    console.log('Twilio client not initialized. Mail not sent.');
    return null;
  }
  
  try {
    const message = await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to
    });
    
    console.log('Mail sent successfully:', message.sid);
    return message;
  } catch (error) {
    console.error('Error sending Mail:', error);
    throw error;
  }
};

// Function to send bulk Mail
const sendBulkMail = async (numbers, body) => {
  if (!client) {
    console.log('Twilio client not initialized. Bulk Mail not sent.');
    return [];
  }
  
  try {
    const promises = numbers.map(number => 
      client.messages.create({
        body,
        from: twilioPhoneNumber,
        to: number
      })
    );
    
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    console.log(`${successful} out of ${numbers.length} Mail sent successfully`);
    
    return results;
  } catch (error) {
    console.error('Error sending bulk Mail:', error);
    throw error;
  }
};

module.exports = {
  sendMail,
  sendBulkMail
}; 