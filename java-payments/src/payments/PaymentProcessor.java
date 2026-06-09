package payments;

public class PaymentProcessor {
    private PaymentMethod paymentMethod;

    // Polymorphism: This method accepts ANY object that implements PaymentMethod
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void checkout(double amount) {
        if (paymentMethod == null) {
            System.out.println("No payment method selected.");
            return;
        }
        System.out.println("Initiating checkout...");
        
        // Abstracted method call - behavior changes based on the actual object type
        paymentMethod.processPayment(amount);
        
        System.out.println("Payment Details: " + paymentMethod.getPaymentDetails());
        System.out.println("Checkout complete.");
    }
}
