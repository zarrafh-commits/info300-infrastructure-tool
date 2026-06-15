const readlineSync = require("readline-sync");

function getValidCIDR(promptText) {
    let cidr;

    do {
        cidr = readlineSync.questionInt(promptText);
        if (cidr < 16 || cidr > 30) {
            console.log("Error: CIDR must be between /16 and /30.");
        }
    } while (cidr < 16 || cidr > 30);

    return cidr;
}

function getPositiveInteger(promptText) {
    let number;

    do {
        number = readlineSync.questionInt(promptText);
        if (number <= 0) {
            console.log("Error: Please enter a positive integer.");
        }
    } while (number <= 0);

    return number;
}

function subnetHostChecker() {
    console.log("\n--- Subnet Host Checker ---");

    let vpcCIDR = getValidCIDR("Enter VPC CIDR (number only, e.g. 16 for /16): ");
    let subnetCIDR = getValidCIDR("Enter Subnet CIDR (number only, e.g. 24 for /24): ");
    let devices = getPositiveInteger("Enter number of devices required: ");

    let usableIPs = Math.pow(2, (32 - subnetCIDR)) - 5;

    console.log();

    if (subnetCIDR >= vpcCIDR) {
        console.log("✓ The subnet CIDR is consistent with the VPC CIDR.");
    } else {
        console.log("✗ The subnet CIDR is NOT consistent with the VPC CIDR.");
    }

    if (usableIPs >= devices) {
        console.log("✓ The subnet is sufficient for the number of devices.");
        console.log("Unused IP addresses: " + (usableIPs - devices));
    } else {
        console.log("✗ The subnet is NOT sufficient for the number of devices.");
        console.log("Additional IP addresses needed: " + (devices - usableIPs));
    }
}

function computeEnvironmentSelector() {
    console.log("\n--- Compute Environment Selector ---");

    let appName = readlineSync.question("Enter application name: ");
    let monthlyUsers = getPositiveInteger("Enter monthly users: ");
    let monthlyBudget = getPositiveInteger("Enter monthly budget ($): ");
    let highAvailability = readlineSync.question("High availability required? (yes/no): ").toLowerCase();

    while (highAvailability !== "yes" && highAvailability !== "no") {
        console.log("Please type yes or no.");
        highAvailability = readlineSync.question("High availability required? (yes/no): ").toLowerCase();
    }

    let recommendation = "";

    if (monthlyBudget < 1000) {
        recommendation = "Single EC2";
    } else if (monthlyBudget >= 1000 && monthlyBudget <= 3000) {
        if (monthlyUsers < 1000 && highAvailability === "no") {
            recommendation = "Single EC2";
        } else {
            recommendation = "EC2 + Load Balancer";
        }
    } else {
        if (monthlyUsers > 10000 || highAvailability === "yes") {
            recommendation = "EC2 + Load Balancer + Auto Scaling";
        } else if (monthlyUsers >= 1000) {
            recommendation = "EC2 + Load Balancer";
        } else {
            recommendation = "Single EC2";
        }
    }

    console.log("\nApplication: " + appName);
    console.log("Recommended Environment: " + recommendation);
}

let runAgain = true;

while (runAgain) {
    console.log("\n======================================");
    console.log("     Infrastructure Decision Tool");
    console.log("======================================");
    console.log("1. Subnet Host Checker");
    console.log("2. Compute Environment Selector");
    console.log("3. Exit");

    let choice = readlineSync.questionInt("Select an option (1-3): ");

    switch (choice) {
        case 1:
            subnetHostChecker();
            break;

        case 2:
            computeEnvironmentSelector();
            break;

        case 3:
            console.log("Goodbye!");
            runAgain = false;
            continue;

        default:
            console.log("Invalid option. Please choose 1, 2, or 3.");
            continue;
    }

    let answer = readlineSync.question("\nWould you like to run the program again? (yes/no): ").toLowerCase();

    if (answer !== "yes") {
        runAgain = false;
        console.log("Goodbye!");
    }
}