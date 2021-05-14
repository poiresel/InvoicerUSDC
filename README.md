# README

## Invoice Contract

Description:

Simple contract using hardhat framework
Allows the deployer to create invoices and have others pay them USDC or WETH with the invoice amounts
Utilizes the Chainlink price feed for ETH/USDC to do the converstion

TODOs
* Likely add events to emit out when certain actions are occurring
* Strong integration tests as well as better testing the payWithWeth function
* Make determination which Oracle to use 