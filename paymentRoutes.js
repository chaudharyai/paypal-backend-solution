const express = require("express");
const router = express.Router();
const paypal = require("paypal-rest-sdk");
const moment = require("moment-timezone");
const axios = require("axios");

// Currency Conversion Function
async function convertCurrency(amount, fromCurrency, toCurrency) {
  const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
  const rate = response.data.rates[toCurrency];
  return amount * rate;
}

// Payment Capture Route
router.post("/capture", async (req, res) => {
  try {
    const { card_number, type, expire_month, expire_year, cvv, total, currency, userTimezone, userRegion } = req.body;

    // Step 1: Validate Region
    const allowedRegions = ["US", "AE", "UK"];
    if (!allowedRegions.includes(userRegion)) {
      return res.status(400).json({ error: `Region ${userRegion} is not supported.` });
    }

    // Step 2: Handle Currency Conversion
    const convertedAmount = await convertCurrency(total, currency, "USD");

    // Step 3: Create Payment Data
    const paymentData = {
      intent: "sale",
      payer: {
        payment_method: "credit_card",
        funding_instruments: [
          {
            credit_card: {
              number: card_number,
              type: type,
              expire_month: expire_month,
              expire_year: expire_year,
              cvv2: cvv,
              first_name: "Customer",
              last_name: "Name",
            },
          },
        ],
      },
      transactions: [
        {
          amount: {
            total: convertedAmount.toFixed(2),
            currency: "USD",
          },
          description: "Payment with region and timezone handling",
        },
      ],
    };

    // Step 4: Create Payment
    paypal.payment.create(paymentData, (error, payment) => {
      if (error) {
        console.error("PayPal Error:", error.response);
        return res.status(500).json({ error: error.response });
      } else {
        // Step 5: Adjust Timezone for Confirmation
        const utcTime = moment().utc().format();
        const localTime = moment(utcTime).tz(userTimezone).format("YYYY-MM-DD HH:mm:ss");

        res.status(200).json({
          message: "Payment successfully captured!",
          payment,
          transactionTime: localTime,
        });
      }
    });
  } catch (error) {
    console.error("Payment Capture Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
