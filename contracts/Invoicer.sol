pragma solidity ^0.7.0;


import "@openzepplin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


import "./interfaces/IWETH.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

/**
 * @title Invoicer: 
 * @notice Supports (ERC-20) USDC transfers specified on deploy
 * @dev inherits Ownable
 */
contract Invoicer is Ownable {
    using SafeMath for uint256;

    // invoice# -> paymentAmount (usdc)
    mapping(uint256 => uint256) public invoiceStore; 
    // invoice# => marks whether there is a valid / payable invoice
    mapping(uint256 => bool) public validInvoice;

    // The WETH contract to wrap ether
    IWETH public wethContract;
    // The UDSC contract to send usdc
    IERC20 public usdcContract;
    // Chainlink interface for ETH/USD price feed
    AggregatorV3Interface internal ethUSDPriceFeed;

    /**
    * @notice Contract Constructor
    * @dev owner defaults to msg.sender
    * @param usdcAddress address 
    * @param wethAddress address
    * @param priceFeed address Contract address of Chainlink ETH/USD price
    */
    constructor(address usdcAddress, address wethAddress, address priceFeed) public {
        usdcContract  = IERC20(usdcAddress);
        wethContract = IWETH(wethAddress);
        ethUSDPriceFeed = AggregatorV3Interface(priceFeed);
    }

    /**
    * @notice Owner requests invoices using invoiceNumber as identifier
    * @dev only callable by the owner of the contract, allows overwriting existing invoices
    * @param invoiceNumber uint256 unique identifier for the invoice
    * @param invoiceAmount uint256 amount in base USDC ie 1 USDC means paymentAmount 1000000
    */    
    function requestInvoice(uint256 invoiceNumber, uint256 invoiceAmount) external onlyOwner {
        validInvoice[invoiceNumber] = true;
        invoiceStore[invoiceNumber] = invoiceAmount;
    }

    /**
    * @notice Lookup in map for live invoices
    * @param invoiceNumber uint256 unique identifier for the invoice
    * @return bool whether invoiceNumber is valid invoice in invoiceStore
    */ 
    function hasInvoice(uint256 invoiceNumber) external view returns (bool) {
        return validInvoice[invoiceNumber];
    }

    /**
    * @notice Lookup in invoiceStore for invoiceAmount
    * @param invoiceNumber uint256 unique identifier for the invoice
    * @return uint256 amount owed, may return 0 if not validInvoice
    */ 
    function getInvoice(uint256 invoiceNumber) external view returns (uint256) {
        return invoiceStore[invoiceNumber];
    }

    /**
    * @notice Allows anyone to pay the owner of this contract in USDC
    * @param invoiceNumber uint256 unique identifier for the invoice
    * @dev requires caller to approve this contract to transfer USDC
    * @dev requires caller to have sufficient USDC to be transfered
    * @return bool only returns on not reverting
    */ 
    function payInvoice(uint256 invoiceNumber) public returns (bool) {
        if (validInvoice[invoiceNumber]) {
            if (validInvoice[invoiceNumber] > 0) {
                usdcContract.transferFrom(msg.sender,  owner(), invoiceStore[invoiceNumber]);
                invoiceStore[invoiceNumber] = 0;          
            }
            validInvoice[invoiceNumber] = false;     
        }
        // output an event that this has been done
        return true;
    }

    // copied over from https://docs.chain.link/docs/get-the-latest-price/
    // may not be the practical function/pricefeed to use
    function getThePrice() public view returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }

    /**
    * @notice Allows anyone to pay the owner of this invoice in WETH
    * @param invoiceNumber uint256 unique identifier for the invoice
    * @dev requires caller to approve this contract to transfer WETH
    * @dev requires caller to have sufficient WETH to be transfered
    * @return bool only returns on not reverting
    */ 
    function payInvoiceViaWETH(uint256 invoiceNumber) public {
        if (validInvoice[invoiceNumber]) {
            uint256 paymentAmount = invoiceStore[invoiceNumber];                
            if (paymentAmount > 0) {
                // todo could be its own function
                // input: 1000* 10**6 baseUSDC 
                // price feed is WEI/USDC
                // output: in wei which we're taking to be 1:1 with WETH 
                // paymentAmount / (10**6) * rate
                uint256 rate = getThePrice();
                uint256 wethConvertedAmount = paymentAmount.mult(rate.div(1000000)); 
                wethContract.transferFrom(msg.sender,  owner(), wethConvertedAmount);
                invoiceStore[invoiceNumber] = 0;              
            }
            validInvoice[invoiceNumber] = false;
        }
        return true;    
    }

}