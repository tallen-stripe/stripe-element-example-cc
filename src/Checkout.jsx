import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";
import "./App.css";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(process.env.REACT_APP_PUB_KEY,{
  betas: ['server_side_confirmation_beta_1'],
  apiVersion: '2020-08-27;server_side_confirmation_beta=v1',
});

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="App">
      <h1>Element:</h1>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise} setClientSecret={setClientSecret}>
          <CheckoutForm />
        </Elements>
      )}
      <h3>Test Cards:</h3>
      <li>Visa Credit: <strong>4242424242424242</strong></li>
      <li>Visa Debit: <strong>4000056655665556</strong></li>
      <hr />
      <li>Always 3ds: <strong>4000002760003184</strong></li>
    </div>
  );
}