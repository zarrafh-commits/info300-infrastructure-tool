Infrastructure Decision Tool
Haitham Zarraf
INFO 300

SETUP AND RUN
Install Node.js and npm. In this project folder run:
  npm install
  npm start
Choose 1 for the Subnet Host Checker, 2 for the Compute Environment
Selector, or 3 to exit. After a calculation, answer yes to run again.


SUBNET HOST CHECKER
Enter VPC and subnet prefixes as /16 through /30 (16 through 30 also
works). Devices must be a positive whole number. The subnet prefix must
be greater than or equal to the VPC prefix. Because only prefixes are
provided, this checks subnet size consistency, not actual IP containment.
Usable addresses = max(0, 2^(32 - subnet prefix) - 5).
The five reserved AWS addresses are excluded from device capacity.

Example where the subnet is sufficient:
  VPC CIDR: /16
  Subnet CIDR: /24
  Devices: 200
  CIDRs are consistent. Total addresses: 256. Usable addresses: 251.
  Subnet capacity is sufficient. Unused IP addresses: 51.

Example where the subnet is not sufficient:
  VPC CIDR: /16
  Subnet CIDR: /28
  Devices: 20
  CIDRs are consistent. Total addresses: 16. Usable addresses: 11.
  Subnet capacity is insufficient. Additional IP addresses needed: 9.

Inconsistent example: VPC /24 and subnet /16. The subnet is larger than
the VPC. Capacity is reported separately, and the program warns that the
prefix must be corrected before use.
The assignment permits /29 and /30 inputs even though AWS IPv4 subnets
normally use /16 through /28. For /30, four total addresses cannot cover
the five reserved addresses, so usable capacity is clamped to zero.

COMPUTE ENVIRONMENT SELECTOR
Application name cannot be blank. Monthly users must be a nonnegative
whole number; budget must be a nonnegative finite number. HA accepts
yes/no or y/n. Invalid entries are prompted again.
  Under 1,000 users and no HA: Single EC2.
  1,000 through 10,000 users and no HA: EC2 + Load Balancer.
  Above 10,000 users OR HA at any user count:
    EC2 + Load Balancer + Auto Scaling.
HA takes priority over user count.
Budget below $1,000 warns when more than a single EC2 is recommended.
Budget from $1,000 through $3,000 warns when Auto Scaling is recommended.
Budget warnings do not change the architecture recommendation. These are
assignment rules, not real AWS price estimates.

Example: App Campus Events, 500 users, $500 budget, no HA -> Single EC2.
Example: App Campus Events, 5,000 users, $900 budget, no HA -> EC2 +
Load Balancer, with a budget warning.
Example: App Campus Events, 500 users, $2,000 budget, HA yes -> EC2 +
Load Balancer + Auto Scaling, with a budget warning.

Repository: https://github.com/zarrafh-commits/info300-infrastructure-tool
