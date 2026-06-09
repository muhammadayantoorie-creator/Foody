package payments;

public interface PaymentMethod {
    void processPayment(double amount);
    String getPaymentDetails();
}
