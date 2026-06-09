package payments;

import java.util.Scanner;

public class PaymentCUI {
    private double amountToPay = 1500.00; // Example order amount

    public void start() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("========================================");
        System.out.println("   FOOD DASH - PAYMENT CHECKOUT (CUI)   ");
        System.out.println("========================================");
        System.out.printf("Total Amount to Pay: Rs. %.2f\n\n", amountToPay);

        System.out.println("Select Payment Method:");
        System.out.println("1. Cash on Delivery");
        System.out.println("2. Credit/Debit Card");
        System.out.println("3. JazzCash");
        System.out.println("4. EasyPaisa");
        System.out.println("5. Exit");
        System.out.print("\nEnter your choice (1-5): ");

        int choice = 0;
        try {
            choice = Integer.parseInt(scanner.nextLine());
        } catch (NumberFormatException e) {
            System.out.println("\nInvalid input. Exiting checkout.");
            return;
        }

        PaymentMethod method = null;
        try {
            switch (choice) {
                case 1:
                    System.out.print("\nEnter Delivery Address: ");
                    String address = scanner.nextLine().trim();
                    if (address.isEmpty()) throw new Exception("Delivery Address is required.");
                    method = new CashOnDelivery(address);
                    break;
                case 2:
                    System.out.print("\nEnter Card Number: ");
                    String cardNum = scanner.nextLine().trim();
                    System.out.print("Enter Card Holder Name: ");
                    String cardHolder = scanner.nextLine().trim();
                    if (cardNum.isEmpty() || cardHolder.isEmpty()) {
                        throw new Exception("Card details are required.");
                    }
                    method = new CardPayment(cardNum, cardHolder);
                    break;
                case 3:
                    System.out.print("\nEnter JazzCash Mobile Number: ");
                    String jazzMobile = scanner.nextLine().trim();
                    if (jazzMobile.isEmpty()) throw new Exception("Mobile number is required.");
                    method = new JazzCashPayment(jazzMobile);
                    break;
                case 4:
                    System.out.print("\nEnter EasyPaisa Mobile Number: ");
                    String easyMobile = scanner.nextLine().trim();
                    if (easyMobile.isEmpty()) throw new Exception("Mobile number is required.");
                    method = new EasyPaisaPayment(easyMobile);
                    break;
                case 5:
                    System.out.println("\nExiting checkout. Goodbye!");
                    return;
                default:
                    System.out.println("\nInvalid choice. Exiting checkout.");
                    return;
            }

            // Polymorphism: Checkout processing
            System.out.println("\n----------------------------------------");
            PaymentProcessor processor = new PaymentProcessor();
            processor.setPaymentMethod(method);
            processor.checkout(amountToPay);
            System.out.println("----------------------------------------");
            System.out.println("✔ Order Confirmed Successfully!");
            System.out.println("========================================");

        } catch (Exception e) {
            System.out.println("\n❌ Error: " + e.getMessage());
            System.out.println("Checkout failed.");
        }
    }
}
