const express = require("express");
require('dotenv').config()
const app = express();
// This is your test secret API key.
const stripe = require("stripe")(process.env.REACT_APP_SECRET_KEY,{apiVersion: '2020-08-27; server_side_confirmation_beta=v1'});

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "gbp",
    secret_key_confirmation: 'required',
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.post("/pay", async (req, res) => {
  let paymentIntent = await stripe.paymentIntents.retrieve(req.body.payment_intent_id)
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method)
  let fundingType = paymentMethod.card?.funding
  if (fundingType == "credit"){
    stripe.paymentIntents.cancel(paymentIntent.id)
    res.send({
      confirm: false
    });
    return;
  }
  
  paymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id,{
    return_url: "http://localhost:3000/confirm"
  })
  console.log(paymentIntent)
  res.send({
    confirm: true,
    payment_intent_client_secret: paymentIntent.client_secret,
    status: paymentIntent.status
  });
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));