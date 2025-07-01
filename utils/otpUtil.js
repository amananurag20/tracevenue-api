const { sendOTP, resendOTP, verifyOTP} = require("otpless-node-js-auth-sdk");
require('dotenv').config();

const { CLIENT_ID, CLIENT_SECRET } = process.env;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing required environment variables: CLIENT_ID and/or CLIENT_SECRET");
}

const sendOtpService = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("OTP service configuration is missing");
    }

    // Ensure phone number is in correct format
    let formattedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedPhoneNumber = phoneNumber.startsWith('91') ? `+${phoneNumber}` : `+91${phoneNumber}`;
    }


    const response = await sendOTP(
      formattedPhoneNumber,
      "",
      "SMS",
      "",
      "",
      60 * 60 * 10, // 10 hours expiry
      4, // 4 digit OTP
      CLIENT_ID,
      CLIENT_SECRET
    );


    if (!response || typeof response !== 'object') {
      throw new Error("Invalid response from OTP service");
    }

    if (response.error) {
      throw new Error(response.error.message || "OTP service error");
    }

    return {
      success: true,
      orderId: response.orderId
    };
  } catch (error) {
    console.error("Send OTP Error:", error);
    return {
      success: false,
      errorMessage: error.message || "Failed to send OTP",
      details: error
    };
  }
};

const resendOtpService = async(orderId) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("OTP service configuration is missing");
    }

    const response = await resendOTP(orderId, CLIENT_ID, CLIENT_SECRET);
    
    if (!response || typeof response !== 'object') {
      throw new Error("Invalid response from OTP service");
    }

    return response;
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return {
      success: false,
      errorMessage: error.message || "Failed to resend OTP"
    };
  }
};

const verifyOtpService = async (phoneNumber, orderId, otp) => {
  try {

    if (!phoneNumber || !orderId || !otp) {
      throw new Error("Phone number, order ID and OTP are required");
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("OTP service configuration is missing");
    }

    // Ensure phone number is in correct format
    let formattedPhoneNumber = phoneNumber;
    if (!formattedPhoneNumber.startsWith('+')) {
      formattedPhoneNumber = formattedPhoneNumber.startsWith('91') ? 
        `+${formattedPhoneNumber}` : 
        `+91${formattedPhoneNumber}`;
    }


    const response = await verifyOTP(
      "", 
      formattedPhoneNumber, 
      orderId, 
      otp, 
      CLIENT_ID, 
      CLIENT_SECRET
    );


    if (!response || typeof response !== 'object') {
      throw new Error("Invalid response from OTP service");
    }

    // Check for specific error conditions in response
    if (response.error) {
      throw new Error(response.error.message || "OTP service error");
    }

    if (response.isOTPVerified === false) {
      throw new Error("Invalid OTP provided");
    }

    return {
      success: true,
      message: "OTP verified successfully",
      details: response
    };
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return {
      success: false,
      errorMessage: error.message || "Failed to verify OTP",
      details: error
    };
  }
};

// Specific function for restaurant registration OTP verification
const verifyRestaurantRegistrationOtp = async (phoneNumber, orderId, otp) => {
  try {
    
    const verificationResponse = await verifyOtpService(phoneNumber, orderId, otp);
    
    if (!verificationResponse.success) {
      return {
        success: false,
        errorMessage: verificationResponse.errorMessage || "OTP verification failed",
        details: verificationResponse.details
      };
    }

    return {
      success: true,
      message: "Restaurant registration OTP verified successfully"
    };
  } catch (error) {
    console.error("Restaurant Registration OTP Verification Error:", error);
    return {
      success: false,
      errorMessage: error.message || "Failed to verify restaurant registration OTP",
      details: error
    };
  }
};

module.exports = {
  sendOtpService,
  resendOtpService,
  verifyOtpService,
  verifyRestaurantRegistrationOtp
};