import React, { useEffect, useState } from "react";
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cardNotSupported, setCardNotSupported] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);
    console.log(isLoading)

    // const { error } = await stripe.confirmPayment({
    //   elements,
    //   confirmParams: {
    //     // Make sure to change this to your payment completion page
    //     return_url: "http://localhost:3000",
    //   },
    // });

    stripe.updatePaymentIntent({
        elements, // elements instance
    }).then(function (result) {
      stripePaymentMethodHandler(result)
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    // if (error.type === "card_error" || error.type === "validation_error") {
    //   setMessage(error.message);
    // } else {
    //   setMessage("An unexpected error occurred.");
    // }
  };

  const stripePaymentMethodHandler = (result) => {
    if (result.error) {
      // Show error in payment form
    } else {
      // Otherwise send paymentIntent.id to your server
      fetch('/pay', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          payment_intent_id: result.paymentIntent.id,
        })
      }).then(function (res) {
        setIsLoading(false);
        return res.json();
      }).then(function (paymentResponse) {
        handleServerResponse(paymentResponse);
      });
    }
  };

  const handleServerResponse = function (response) {
    if (!response.confirm) {
      setCardNotSupported(true);
      // elements.getElement('payment').clear();
      
    } else if (response.status === "requires_action") {
      // Use Stripe.js to handle the required next action
      stripe.handleNextAction({
        clientSecret: response.payment_intent_client_secret
      }).then(function (result) {
        if (result.error) {
          // Show error from Stripe.js in payment form
        } else {
          // Actions handled, show success message
        }
      });
    } else {
      navigate('/confirm');
    }
    setIsLoading(false);
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <Alert show={cardNotSupported} variant="success">
        <Alert.Heading>Credit cards are not supported</Alert.Heading>
        <p>
          Credit cards are not supported, please enter a debit card
        </p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button onClick={() => window.location.reload(false)} variant="outline-success">
            Clear Form
          </Button>
        </div>
      </Alert>
      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe || !elements || cardNotSupported} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}