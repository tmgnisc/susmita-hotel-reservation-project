import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  ""
);

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onSuccess: () => void;
  reservationIds?: string[];
  orderIds?: string[];
}

function PaymentForm({
  amount,
  onSuccess,
  onClose,
  reservationIds,
  orderIds,
}: {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
  reservationIds?: string[];
  orderIds?: string[];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const createIntent = async () => {
      setIsLoading(true);
      try {
        const response = await api.createPaymentIntent({
          amount,
          currency: "usd",
          reservationId: reservationIds?.[0],
          orderId: orderIds?.[0],
          metadata: {
            reservationIds: reservationIds?.join(",") || "",
            orderIds: orderIds?.join(",") || "",
          },
        });
        setClientSecret(response.paymentIntent.clientSecret);
        setPaymentId(response.paymentId);
      } catch (error) {
        if (error instanceof ApiError) {
          toast({
            title: "Payment Error",
            description: error.message || "Failed to initialize payment",
            variant: "destructive",
          });
        }
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (amount > 0 && !clientSecret) {
      createIntent();
    } else {
      setIsLoading(false);
    }
  }, [amount, reservationIds, orderIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "Payment could not be processed",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm payment on backend
        if (paymentId) {
          await api.confirmPayment({
            paymentIntentId: paymentIntent.id,
            paymentId,
          });
        }

        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });

        onSuccess();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Payment Error",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted-foreground">Initializing payment...</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-destructive">Failed to initialize payment</p>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-secondary/50">
          {stripe && elements && (
            <CardElement options={cardElementOptions} />
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-display font-bold text-foreground">
            ${amount.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            disabled={!stripe || !elements || isProcessing || !clientSecret}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function PaymentDialog({
  open,
  onOpenChange,
  amount,
  onSuccess,
  reservationIds,
  orderIds,
}: PaymentDialogProps) {
  const publishableKey = 
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
    import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Configuration Error</DialogTitle>
            <DialogDescription>
              Stripe publishable key is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.
            </DialogDescription>
          </DialogHeader>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Enter your payment details to complete your purchase
          </DialogDescription>
        </DialogHeader>
        {open && amount > 0 && stripePromise && (
          <Elements 
            stripe={stripePromise}
            options={{
              appearance: {
                theme: 'stripe',
              },
            }}
          >
            <PaymentForm
              amount={amount}
              onSuccess={() => {
                onSuccess();
                onOpenChange(false);
              }}
              onClose={() => onOpenChange(false)}
              reservationIds={reservationIds}
              orderIds={orderIds}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}

