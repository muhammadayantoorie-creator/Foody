package payments;

import javax.swing.SwingUtilities;
import java.awt.GraphicsEnvironment;

public class Main {
    public static void main(String[] args) {
        boolean startCli = false;

        // Parse arguments for CLI/CUI overrides
        for (String arg : args) {
            if ("--cli".equalsIgnoreCase(arg) || "--cui".equalsIgnoreCase(arg) || "-c".equalsIgnoreCase(arg)) {
                startCli = true;
                break;
            }
        }

        // Auto-detect headless systems
        if (GraphicsEnvironment.isHeadless()) {
            startCli = true;
        }

        if (startCli) {
            // Run Command-line User Interface (CUI) mode
            PaymentCUI cui = new PaymentCUI();
            cui.start();
        } else {
            // Run Graphical User Interface (GUI) mode in the Event Dispatch Thread
            SwingUtilities.invokeLater(() -> {
                PaymentUI ui = new PaymentUI();
                ui.setVisible(true);
            });
        }
    }
}
