# README

## Invoice Contract

Description:

Simple contract using hardhat framework
Allows a single deployer to create invoices and have others pay them USDC or WETH with the invoice amounts
Utilizes the Chainlink price feed for ETH/USDC to do the converstion

TODOs
* Make the Invoicer as an interface and actually have a InvoiceFactory instead and ues the InvoiceFactory to track
* Likely add events to emit out when certain actions are occurring
* Strong integration tests as well as better testing the payWithWeth function
* Make determination which Oracle to use

Setup Steps and run steps:

```npm install``

```npx hardhat compile```
Compiles and creates the artifacts

```npx hardhat test```
Runs the tests

```npx hardhat```
General command to find out any other hardhat helpers