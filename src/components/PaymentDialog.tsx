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
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onSuccess: () => void;
  bookingIds?: string[];
  orderIds?: string[];
}

function PaymentForm({
  amount,
  onSuccess,
  onClose,
  bookingIds,
  orderIds,
}: {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
  bookingIds?: string[];
  orderIds?: string[];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const createIntent = async () => {
      try {
        const response = await api.createPaymentIntent({
          amount,
          currency: "usd",
          bookingId: bookingIds?.[0],
          orderId: orderIds?.[0],
          metadata: {
            bookingIds: bookingIds?.join(",") || "",
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
      }
    };

    if (amount > 0 && !clientSecret) {
      createIntent();
    }
  }, [amount, bookingIds, orderIds]);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-secondary/50">
          <CardElement options={cardElementOptions} />
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
            disabled={!stripe || isProcessing || !clientSecret}
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
  bookingIds,
  orderIds,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Enter your payment details to complete your purchase
          </DialogDescription>
        </DialogHeader>
        {open && amount > 0 && stripePromise && (
          <Elements stripe={stripePromise}>
            <PaymentForm
              amount={amount}
              onSuccess={() => {
                onSuccess();
                onOpenChange(false);
              }}
              onClose={() => onOpenChange(false)}
              bookingIds={bookingIds}
              orderIds={orderIds}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}

