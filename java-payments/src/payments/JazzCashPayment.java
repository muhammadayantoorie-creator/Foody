package payments;

public class JazzCashPayment implements PaymentMethod {
    private String mobileNumber;

    public JazzCashPayment(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    @Override
    public void processPayment(double amount) {
        System.out.println("Processing JazzCash payment of Rs. " + amount + " from account " + mobileNumber);
        // JazzCash API integration goes here
    }

    @Override
    public String getPaymentDetails() {
        return "JazzCash Account: " + mobileNumber;
    }
}
