const { expect } = require('chai');

describe('Invoicer', () => {
  let usdcToken;
  let wethToken;
  let invoicer;
  let payer1;
  let deployer;

  const thousandUSDC = ethers.utils.parseUnits('1000', 6);
  before(async () => {
    [
      deployer, // also owner by default
      payer1,
    ] = await ethers.getSigners();

    // Setup contracts
    const USDCFactory = await hre.ethers.getContractFactory('USDCToken');
    usdcToken = await USDCFactory.deploy();
    const WETHFactory = await hre.ethers.getContractFactory('WETH9');
    wethToken = await WETHFactory.deploy();

    const PriceFeedFactory = await hre.ethers.getContractFactory('AggregatorV3');
    const priceFeed = await PriceFeedFactory.deploy();
    // instantiate "object under test" with mocked contract.
    const InvoicerFactory = await ethers.getContractFactory('Invoicer');
    invoicer = await InvoicerFactory.deploy(usdcToken.address, wethToken.address, priceFeed.address);
    await invoicer.deployed();

    // setup balances
    await usdcToken.connect(deployer).mint(payer1.address, thousandUSDC);

    // set up approvals
    await usdcToken.connect(payer1).approve(invoicer.address, thousandUSDC);

    const tenWETH = ethers.utils.parseUnits('10', 18);
    await wethToken.connect(payer1).deposit({ value: tenWETH });

    // set up approvals
    await wethToken.connect(payer1).approve(invoicer.address, tenWETH);
  });

  it('Actually send usdc token from payer1 when invoice present', async () => {
    await invoicer.connect(deployer).requestInvoice(1, thousandUSDC);
    expect(await invoicer.hasInvoice(1)).to.equal(true);
    expect(await invoicer.getInvoice(1)).to.equal(thousandUSDC);
    // perform transaction
    await invoicer.connect(payer1).payInvoice(1);
    expect(await usdcToken.balanceOf(deployer.address)).to.equal(thousandUSDC);
    expect(await usdcToken.balanceOf(payer1.address)).to.equal(0);
    expect(await invoicer.hasInvoice(1)).to.equal(false);
    expect(await invoicer.getInvoice(1)).to.equal(0);
  });

  it('Have an amount greater than balance for usdc token from payer1 when invoice present', async () => {
    await invoicer.connect(deployer).requestInvoice(1, thousandUSDC);
    expect(await invoicer.hasInvoice(1)).to.equal(true);
    expect(await invoicer.getInvoice(1)).to.equal(thousandUSDC);
    await expect(invoicer.connect(payer1).payInvoice(1)).to.be.reverted;
    expect(await invoicer.hasInvoice(1)).to.equal(true);
    expect(await invoicer.getInvoice(1)).to.equal(thousandUSDC);
  });

  it('Pay invoice with WETH in valid transaction', async () => {
    await invoicer.connect(deployer).requestInvoice(2, thousandUSDC);
    expect(await invoicer.hasInvoice(2)).to.equal(true);
    expect(await invoicer.getInvoice(2)).to.equal(thousandUSDC);
    expect(await wethToken.balanceOf(deployer.address)).to.equal(0);
    await invoicer.connect(payer1).payInvoiceViaWETH(2);
    expect(await wethToken.balanceOf(deployer.address)).to.equal('2500000000000000000');
    expect(await wethToken.balanceOf(payer1.address)).to.equal('7500000000000000000');
    expect(await invoicer.hasInvoice(2)).to.equal(false);
    expect(await invoicer.getInvoice(2)).to.equal(0);
  });
});
