const { assert } = require('chai')
const { assertRevert } = require('@aragon/contract-test-helpers/assertThrow')
const { newDao, newApp } = require('./helpers/dao')
const { setOpenPermission } = require('./helpers/permissions')

const Issuance = artifacts.require('IssuanceMock.sol')
const TokenManager = artifacts.require('TokenManager.sol')
const MiniMeToken = artifacts.require('MiniMeToken.sol')

contract('Issuance', ([appManager, user, beneficiary, beneficiary2]) => {
  let appBase, tokenManagerBase, app, tokenManager, token
  const ZERO_ADDR = '0x0000000000000000000000000000000000000000'
  const INITIAL_SUPPLY = 1000

  const bigExp = (x, y) =>
    web3.utils
      .toBN(x)
      .mul(web3.utils.toBN(10).pow(web3.utils.toBN(y)))

  const pct16 = x => bigExp(x, 16)

  before(async () => {
    // Deploy the app's base contract.
    appBase = await Issuance.new()
    tokenManagerBase = await TokenManager.new()
  })

  beforeEach(async () => {
    const { dao, acl } = await newDao(appManager)

    // Instantiate a proxy for the app, using the base contract as its logic implementation.
    const proxyAddress = await newApp(dao, 'issuance', appBase.address, appManager)
    const tokenManagerProxy = await newApp(dao, 'token-manager', tokenManagerBase.address, appManager)
    app = await Issuance.at(proxyAddress)
    tokenManager = await TokenManager.at(tokenManagerProxy)

    // Set up the app's permissions.
    await setOpenPermission(acl, tokenManager.address, await tokenManager.MINT_ROLE(), appManager)

    await setOpenPermission(acl, app.address, await app.ADD_POLICY_ROLE(), appManager)
    await setOpenPermission(acl, app.address, await app.REMOVE_POLICY_ROLE(), appManager)
    
    token = await MiniMeToken.new(ZERO_ADDR, ZERO_ADDR, 0, 'n', 0, 'n', true)
    await token.changeController(tokenManager.address)
    await tokenManager.initialize(token.address, true, 0)

    // Mint some tokens as initial supply to kick-off issuance
    await tokenManager.mint(ZERO_ADDR, INITIAL_SUPPLY)
    assert.equal(await token.totalSupply(), INITIAL_SUPPLY)

    await app.initialize(tokenManager.address)
  })

  context('adding an issuance policy', () => {
    const issuanceRate = 10 // % per block

    beforeEach(async () => {
      await app.addPolicy(beneficiary, pct16(issuanceRate))
    })

    it('can execute issuance after 1 block', async () => {
      await app.mock_increaseBlockNumber(1)
      await app.executeIssuance()
      
      const expectedMint = INITIAL_SUPPLY * issuanceRate / 100
  
      assert.equal(await token.balanceOf(beneficiary), expectedMint)
      assert.equal(await token.totalSupply(), INITIAL_SUPPLY + expectedMint)
    })

    it('adding another policy executes issuance', async () => {
      await app.mock_increaseBlockNumber(1)
      await app.addPolicy(beneficiary2, issuanceRate)

      const expectedMint = INITIAL_SUPPLY * issuanceRate / 100
      const supply = INITIAL_SUPPLY + expectedMint
  
      assert.equal(await token.balanceOf(beneficiary), expectedMint)
      assert.equal(await token.totalSupply(), supply)
    })

    context('removing issuance policy', () => {
      beforeEach(async () => {
        await app.removePolicy(0)
      })

      it('stops issuance', async () => {
        await app.mock_increaseBlockNumber(1)
        await app.executeIssuance()

        assert.equal(await token.balanceOf(beneficiary), 0)
        assert.equal(await token.totalSupply(), INITIAL_SUPPLY)
      })
    })
  })
})
