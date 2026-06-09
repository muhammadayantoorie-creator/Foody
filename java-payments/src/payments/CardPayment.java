package payments;

public class CardPayment implements PaymentMethod {
    private String cardNumber;
    private String cardHolder;

    public CardPayment(String cardNumber, String cardHolder) {
        this.cardNumber = cardNumber;
        this.cardHolder = cardHolder;
    }

    @Override
    public void processPayment(double amount) {
        System.out.println("Processing card payment of Rs. " + amount + " for " + cardHolder);
        // Stripe or bank API integration goes here
    }

    @Override
    public String getPaymentDetails() {
        return "Card ending in " + cardNumber.substring(Math.max(0, cardNumber.length() - 4));
    }
}
