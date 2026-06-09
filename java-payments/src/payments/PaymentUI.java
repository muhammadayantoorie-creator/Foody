package payments;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class PaymentUI extends JFrame {
    private JComboBox<String> paymentTypeComboBox;
    private JPanel dynamicPanel;
    private JTextField input1;
    private JTextField input2;
    private JButton payButton;
    private double amountToPay = 1500.00; // Example order amount

    public PaymentUI() {
        setTitle("Food Delivery - Payment Checkout");
        setSize(450, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout(10, 10));
        setLocationRelativeTo(null); // Center on screen

        // Top Panel for selecting payment method
        JPanel topPanel = new JPanel();
        topPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        topPanel.add(new JLabel("Select Payment Method: "));
        String[] options = {"Cash on Delivery", "Credit/Debit Card", "JazzCash", "EasyPaisa"};
        paymentTypeComboBox = new JComboBox<>(options);
        topPanel.add(paymentTypeComboBox);
        add(topPanel, BorderLayout.NORTH);

        // Center Panel for dynamic inputs based on selected method
        dynamicPanel = new JPanel();
        dynamicPanel.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 20));
        dynamicPanel.setLayout(new GridLayout(3, 2, 5, 10));
        add(dynamicPanel, BorderLayout.CENTER);

        // Bottom Panel for Pay Button
        JPanel bottomPanel = new JPanel();
        bottomPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 20, 10));
        payButton = new JButton("Confirm Order & Pay Rs. " + amountToPay);
        payButton.setBackground(new Color(46, 204, 113));
        payButton.setForeground(Color.WHITE);
        payButton.setFocusPainted(false);
        payButton.setFont(new Font("Arial", Font.BOLD, 14));
        bottomPanel.add(payButton);
        add(bottomPanel, BorderLayout.SOUTH);

        // Event Listeners
        paymentTypeComboBox.addActionListener(e -> updateDynamicPanel());
        payButton.addActionListener(new PayAction());

        // Initialize UI with default selection
        updateDynamicPanel();
    }

    private void updateDynamicPanel() {
        dynamicPanel.removeAll();
        String selected = (String) paymentTypeComboBox.getSelectedItem();

        if ("Cash on Delivery".equals(selected)) {
            dynamicPanel.add(new JLabel("Delivery Address:"));
            input1 = new JTextField();
            dynamicPanel.add(input1);
            input2 = null;
        } else if ("Credit/Debit Card".equals(selected)) {
            dynamicPanel.add(new JLabel("Card Number:"));
            input1 = new JTextField();
            dynamicPanel.add(input1);
            dynamicPanel.add(new JLabel("Card Holder Name:"));
            input2 = new JTextField();
            dynamicPanel.add(input2);
        } else if ("JazzCash".equals(selected) || "EasyPaisa".equals(selected)) {
            dynamicPanel.add(new JLabel("Mobile Number:"));
            input1 = new JTextField();
            dynamicPanel.add(input1);
            input2 = null;
        }

        dynamicPanel.revalidate();
        dynamicPanel.repaint();
    }

    private class PayAction implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            String selected = (String) paymentTypeComboBox.getSelectedItem();
            PaymentMethod method = null;

            try {
                // Abstraction: Instantiating specific implementation
                if ("Cash on Delivery".equals(selected)) {
                    if (input1.getText().trim().isEmpty()) throw new Exception("Delivery Address is required.");
                    method = new CashOnDelivery(input1.getText());
                } else if ("Credit/Debit Card".equals(selected)) {
                    if (input1.getText().trim().isEmpty() || input2.getText().trim().isEmpty()) 
                        throw new Exception("Card details are required.");
                    method = new CardPayment(input1.getText(), input2.getText());
                } else if ("JazzCash".equals(selected)) {
                    if (input1.getText().trim().isEmpty()) throw new Exception("Mobile number is required.");
                    method = new JazzCashPayment(input1.getText());
                } else if ("EasyPaisa".equals(selected)) {
                    if (input1.getText().trim().isEmpty()) throw new Exception("Mobile number is required.");
                    method = new EasyPaisaPayment(input1.getText());
                }

                // Polymorphism: PaymentProcessor doesn't care which method is used
                PaymentProcessor processor = new PaymentProcessor();
                processor.setPaymentMethod(method);
                processor.checkout(amountToPay);

                JOptionPane.showMessageDialog(PaymentUI.this, 
                    "Payment Successful using " + selected + "!\n\nDetails: " + method.getPaymentDetails(), 
                    "Order Confirmed", JOptionPane.INFORMATION_MESSAGE);
                
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(PaymentUI.this, ex.getMessage(), "Input Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }
}
