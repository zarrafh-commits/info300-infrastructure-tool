'use strict';

function checkSubnet(vpcPrefix, subnetPrefix, devices) {
  for (const prefix of [vpcPrefix, subnetPrefix]) {
    if (!Number.isInteger(prefix) || prefix < 16 || prefix > 30) {
      throw new Error('CIDR prefixes must be integers between 16 and 30.');
    }
  }
  if (!Number.isSafeInteger(devices) || devices <= 0) {
    throw new Error('Devices must be a positive safe integer.');
  }
  const totalAddresses = 2 ** (32 - subnetPrefix);
  const usableAddresses = Math.max(0, totalAddresses - 5);
  const consistent = subnetPrefix >= vpcPrefix;
  return {
    consistent,
    totalAddresses,
    usableAddresses,
    sufficient: usableAddresses >= devices,
    unused: Math.max(0, usableAddresses - devices),
    additionalNeeded: Math.max(0, devices - usableAddresses)
  };
}

function selectCompute(users, budget, highAvailability) {
  if (!Number.isSafeInteger(users) || users < 0) throw new Error('Users must be a nonnegative safe integer.');
  if (!Number.isFinite(budget) || budget < 0) throw new Error('Budget must be nonnegative and finite.');
  if (typeof highAvailability !== 'boolean') throw new Error('High availability must be yes or no.');
  const autoScaling = users > 10000 || highAvailability;
  const loadBalancer = autoScaling || users >= 1000;
  const architecture = autoScaling ? 'EC2 + Load Balancer + Auto Scaling'
    : loadBalancer ? 'EC2 + Load Balancer' : 'Single EC2';
  let warning = '';
  if (budget < 1000 && loadBalancer) {
    warning = 'The recommended architecture requires more than a single EC2, but the budget is under $1,000.';
  } else if (budget >= 1000 && budget <= 3000 && autoScaling) {
    warning = 'The recommended architecture requires Auto Scaling, but the budget is between $1,000 and $3,000.';
  }
  return { architecture, warning };
}

function main() {
  const input = require('readline-sync');
  function askNumber(prompt, valid, error) {
    while (true) {
      const raw = input.question(prompt).trim();
      const value = Number(raw);
      if (raw !== '' && valid(value, raw)) return value;
      console.log(error);
    }
  }
  function readPrefix(prompt) {
    while (true) {
      const raw = input.question(prompt).trim();
      if (/^\/?\d+$/.test(raw)) {
        const prefix = Number(raw.replace('/', ''));
        if (prefix >= 16 && prefix <= 30) return prefix;
      }
      console.log('Enter a CIDR from /16 through /30.');
    }
  }
  function askYesNo(prompt) {
    while (true) {
      const answer = input.question(prompt).trim().toLowerCase();
      if (answer === 'yes' || answer === 'y') return true;
      if (answer === 'no' || answer === 'n') return false;
      console.log('Enter yes or no.');
    }
  }
  console.log('Infrastructure Decision Tool');
  do {
    console.log('\n1. Subnet Host Checker\n2. Compute Environment Selector\n3. Exit');
    const choice = askNumber('Choose 1, 2, or 3: ', n => Number.isInteger(n) && n >= 1 && n <= 3,
      'Enter 1, 2, or 3.');
    if (choice === 3) break;
    if (choice === 1) {
      const vpc = readPrefix('VPC CIDR (for example /16): ');
      const subnet = readPrefix('Subnet CIDR (for example /24): ');
      const devices = askNumber('Number of devices required: ', n => Number.isSafeInteger(n) && n > 0,
        'Enter a positive whole number within the safe integer range.');
      const result = checkSubnet(vpc, subnet, devices);
      console.log(`\nCIDR consistency: ${result.consistent ? 'consistent' : 'inconsistent'} with the VPC.`);
      console.log(`Subnet addresses: ${result.totalAddresses} total, ${result.usableAddresses} usable after AWS reserves 5.`);
      if (subnet === 30) console.log('A /30 has only 4 total addresses, so none are usable after the reservation.');
      if (result.sufficient) console.log(`Subnet capacity is sufficient. Unused IP addresses: ${result.unused}.`);
      else console.log(`Subnet capacity is insufficient. Additional IP addresses needed: ${result.additionalNeeded}.`);
      if (!result.consistent) console.log('Choose a subnet prefix greater than or equal to the VPC prefix before using this subnet.');
    } else {
      let name;
      do {
        name = input.question('Application name: ').trim();
        if (!name) console.log('Application name cannot be blank.');
      } while (!name);
      const users = askNumber('Monthly users: ', n => Number.isSafeInteger(n) && n >= 0,
        'Enter a nonnegative whole number within the safe integer range.');
      const budget = askNumber('Monthly budget in dollars: ', n => Number.isFinite(n) && n >= 0,
        'Enter a nonnegative finite dollar amount, without a dollar sign.');
      const ha = askYesNo('High availability required (yes/no): ');
      const result = selectCompute(users, budget, ha);
      console.log(`\nApplication: ${name}\nRecommended architecture: ${result.architecture}`);
      console.log(`Monthly users: ${users}; monthly budget: $${budget.toFixed(2)}; HA: ${ha ? 'yes' : 'no'}.`);
      if (result.warning) console.log(`Warning: ${result.warning}`);
    }
  } while (askYesNo('\nRun another tool (yes/no): '));
  console.log('Goodbye.');
}

if (require.main === module) main();
module.exports = { checkSubnet, selectCompute };
