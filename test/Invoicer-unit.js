const { expect } = require("chai");
const { encodeTransferFrom } = require("./utils");


// mock USDC contract
// mock WETH contract
describe("Invoicer unit tests", function() {
  let mockUSDC; 
  let mockWETH;
  before(async () => {
    ;[
      deployer, // also owner by default
      payer1,
    ] = await ethers.getSigners()

    // Setup Mock contracts
    const MockUSDCFactory = await hre.ethers.getContractFactory("MockContract");
    mockUSDC = await MockUSDCFactory.deploy();
    const MockWETHFactory =  await hre.ethers.getContractFactory("MockContract");
    mockWETH = await MockWETHFactory.deploy(); 

    const MockPriceFeed =  await hre.ethers.getContractFactory("MockContract");
    mockPriceFeed = await MockPriceFeed.deploy(); 
    // instantiate "object under test" with mocked contract.
    InvoicerFactory = await ethers.getContractFactory('Invoicer')
    invoicer = await InvoicerFactory.deploy(mockUSDC.address, mockWETH.address, mockPriceFeed.address);
    await invoicer.deployed()
  })

  it("No invoices exist", async function() {
    expect(await invoicer.hasInvoice(1)).to.equal(false);
    expect(await invoicer.getInvoice(1)).to.equal(0);

  })
  it("Add single Invoice not from Owner thus reverts", async function() {
    const thousandUSDC = ethers.utils.parseUnits("1000", 18);
    await expect(
        invoicer.connect(payer1).requestInvoice(1, thousandUSDC)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    expect(await invoicer.hasInvoice(1)).to.equal(false);
    expect(await invoicer.getInvoice(1)).to.equal(0);

  });

  it("Add single Invoice from Owner", async function() {
    const thousandUSDC = ethers.utils.parseUnits("1000", 18);
    await invoicer.connect(deployer).requestInvoice(1, thousandUSDC);
    expect(await invoicer.hasInvoice(1)).to.equal(true);
    expect(await invoicer.getInvoice(1)).to.equal(thousandUSDC);

  });

  // Payer actions
  it("Add single Invoice from Owner and successfully pay USDC", async function() {
    const thousandUSDC = ethers.utils.parseUnits("1000", 6);
    await invoicer.connect(deployer).requestInvoice(1, thousandUSDC);
    expect(await invoicer.hasInvoice(1)).to.equal(true);
    expect(await invoicer.getInvoice(1)).to.equal(thousandUSDC);

    // mock successful transaction
    const transferFromData = encodeTransferFrom(payer1.address, deployer.address, thousandUSDC);
    await mockUSDC.givenCalldataReturnBool(transferFromData, true);     
    await invoicer.connect(payer1).payInvoice(1);
    expect(await invoicer.hasInvoice(1)).to.equal(false);
    expect(await invoicer.getInvoice(1)).to.equal(0);
  });

  // Payer actions
  it("Add single Invoice from Owner and successfully pay WETH", async function() {
    const thousandUSDC = ethers.utils.parseUnits("1000", 6);
    await invoicer.connect(deployer).requestInvoice(1, thousandUSDC);
    expect(await invoicer.hasInvoice(1)).to.equal(true);
    expect(await invoicer.getInvoice(1)).to.equal(thousandUSDC);

    // mock successful transaction
    const transferFromData = encodeTransferFrom(payer1.address, deployer.address, thousandUSDC);
    await mockWETH.givenCalldataReturnBool(transferFromData, true);     
    await invoicer.connect(payer1).payInvoice(1);
    expect(await invoicer.hasInvoice(1)).to.equal(false);
    expect(await invoicer.getInvoice(1)).to.equal(0);
  });

  // TODO: mock out unsuccessful transfers
  
  
});