package payments;

public class CashOnDelivery implements PaymentMethod {
    private String deliveryAddress;

    public CashOnDelivery(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    @Override
    public void processPayment(double amount) {
        System.out.println("Cash on delivery selected for Rs. " + amount + ". Payment will be collected at " + deliveryAddress);
    }

    @Override
    public String getPaymentDetails() {
        return "Cash on Delivery to " + deliveryAddress;
    }
}
