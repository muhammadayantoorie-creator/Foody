package payments;

public class EasyPaisaPayment implements PaymentMethod {
    private String mobileNumber;

    public EasyPaisaPayment(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    @Override
    public void processPayment(double amount) {
        System.out.println("Processing EasyPaisa payment of Rs. " + amount + " from account " + mobileNumber);
        // EasyPaisa API integration goes here
    }

    @Override
    public String getPaymentDetails() {
        return "EasyPaisa Account: " + mobileNumber;
    }
}
