Infrastructure Decision Tool

Example where the subnet is sufficient:
VPC CIDR: /16
Subnet CIDR: /24
Devices Required: 100
Result: The subnet is sufficient and there are unused IP addresses available.

Example where the subnet is not sufficient:
VPC CIDR: /16
Subnet CIDR: /30
Devices Required: 100
Result: The subnet is not sufficient and additional IP addresses are needed.

Explanation:
The program calculates the number of usable IP addresses based on the subnet CIDR. It then compares that value with the number of required devices to determine whether the subnet is large enough and reports any extra or missing IP addresses. The compute environment selector uses the number of users, budget, and high availability requirement to recommend an AWS deployment option.

Development notes:
Created for INFO 300 assignment.
Add input validation and rerun menu
Clean up output formatting
