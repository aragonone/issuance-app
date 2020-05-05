pragma solidity ^0.4.24;

import "@aragon/apps-token-manager/contracts/TokenManager.sol";
// Compiling with buidler fails if uncommented
// import "@aragon/abis/os/contracts/apps/AragonApp.sol";
// import "@aragon/abis/os/contracts/lib/math/SafeMath.sol";
// import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

contract Issuance is AragonApp {
    using SafeMath for uint256;

    bytes32 constant public ADD_POLICY_ROLE = keccak256("ADD_POLICY_ROLE");
    bytes32 constant public REMOVE_POLICY_ROLE = keccak256("REMOVE_POLICY_ROLE");

    uint64 public constant PCT_BASE = 10 ** 18; // 0% = 0; 1% = 10^16; 100% = 10^18
    uint64 public constant BLOCKS_PER_YEAR = 2102400;

    string constant internal INVALID_INFLATION_RATE_ERROR = "ISS_INVALID_INFLATION_RATE";
    string constant internal ISS_UNEXISTENT_POLICY_ERROR = "ISS_UNEXISTENT_POLICY";

    struct Policy {
        bool active;
        address beneficiary;
        uint256 blockInflationRate;
    }

    TokenManager public tokenManager;
    MiniMeToken public token;

    mapping (uint256 => Policy) public policies;
    uint256[] internal activePolicyIds;
    uint256 internal nextPolicyId;
    uint256 public lastMintBlockNumber;

    event AddPolicy(uint256 indexed policyId, address indexed beneficiary, uint256 blockInflationRate);
    event RemovePolicy(uint256 indexed policyId);
    event ExecuteIssuance(uint256 totalMinted, uint256 elapsedBlocks);

    /**
     * @param _tokenManager TokenManager instance that controls the token being issued
     */
    function initialize(TokenManager _tokenManager) public onlyInit {
        tokenManager = _tokenManager;
        token = tokenManager.token();
        lastMintBlockNumber = block.number;

        initialized();
    }

    /** 
     * @notice Add a new issuance policy of `@formatPct(_blockInflationRate * self.BLOCKS_PER_YEAR(): uint256)` for `_beneficiary`
     * @param _beneficiary Address that will receive tokens minted from inflation
     * @param _blockInflationRate Percentage of the token's total supply that will be issued per block (expressed as a percentage of 10^18; eg. 10^16 = 1%, 10^18 = 100%)
     */
    function addPolicy(address _beneficiary, uint256 _blockInflationRate) auth(ADD_POLICY_ROLE) external {
        require(_blockInflationRate > 0 && _blockInflationRate <= PCT_BASE, INVALID_INFLATION_RATE_ERROR);

        // Execute issuance for existing policies to ensure the new added policy starts at the time it is added
        executeIssuance();

        uint256 policyId = nextPolicyId;
        policies[policyId] = Policy({active: true, beneficiary: _beneficiary, blockInflationRate: _blockInflationRate});
        activePolicyIds.push(policyId);
        nextPolicyId++;

        emit AddPolicy(policyId, _beneficiary, _blockInflationRate);
    }

    /**
     * @notice Remove policy with id `_policyId`
     * @param _policyId Id of the policy being removed
     */
    function removePolicy(uint256 _policyId) auth(REMOVE_POLICY_ROLE) external {
        Policy storage policy = policies[_policyId];
        require(policy.active, ISS_UNEXISTENT_POLICY_ERROR);

        // Execute issuance to mint tokens for the policy until removal time
        executeIssuance();

        policy.active = false;
        uint256 activePolicyIdsLength = activePolicyIds.length;
        for (uint256 i = 0; i < activePolicyIdsLength; i++) {
            if (activePolicyIds[i] == _policyId) {
                activePolicyIds[i] = activePolicyIds[activePolicyIdsLength - 1];
                delete activePolicyIds[activePolicyIdsLength - 1];
                activePolicyIds.length--;
                break;
            }
        }
        
        emit RemovePolicy(_policyId);
    }
    
    /**
     * @notice Execute minting for all issuance policies
     */
    function executeIssuance() public {
        uint256 currentBlockNumber = block.number;
        uint256 elapsedBlocks = currentBlockNumber - lastMintBlockNumber; // no safe math as it assumes the block number can only increase
        if (elapsedBlocks == 0) {
            return;
        }
        
        lastMintBlockNumber = currentBlockNumber;

        uint256 currentSupply = token.totalSupply();
        uint256 totalMinted = 0;
        uint256 activePolicyIdsLength = activePolicyIds.length;
        if (activePolicyIdsLength == 0) {
            return;
        }
        
        for (uint256 i = 0; i < activePolicyIdsLength; i++) {
            Policy storage policy = policies[activePolicyIds[i]];
            uint256 mintAmount = _calculateMintAmountForPolicy(policy, currentSupply, elapsedBlocks);

            tokenManager.mint(policy.beneficiary, mintAmount);
            totalMinted = totalMinted.add(mintAmount);
        }
        
        emit ExecuteIssuance(totalMinted, elapsedBlocks);
    }

    /**
     * @param _policyId Id of the policy being checked
     * @return Amount of tokens that would be minted on execution
     */
    function getMintAmountForPolicy(uint256 _policyId) public view returns (uint256 amount) {
        Policy storage policy = policies[_policyId];
        require(policy.active, ISS_UNEXISTENT_POLICY_ERROR);

        return _calculateMintAmountForPolicy(policy, token.totalSupply(), block.number - lastMintBlockNumber);
    }

    function _calculateMintAmountForPolicy(Policy storage _policy, uint256 _currentSupply, uint256 _elapsedBlocks) internal view returns (uint256 amount) {
        return _elapsedBlocks.mul(_currentSupply.mul(_policy.blockInflationRate)) / PCT_BASE;
    }
}
