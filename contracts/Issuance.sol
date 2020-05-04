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

    string constant internal INVALID_INFLATION_RATE_ERROR = "ISS_INVALID_INFLATION_RATE";
    string constant internal NO_BLOCKS_ELAPSED_ERROR = "ISS_NO_BLOCKS_ELAPSED";

    struct Policy {
        address beneficiary;
        uint256 blockInflationRate;
    }

    TokenManager public tokenManager;
    MiniMeToken public token;

    Policy[] public policies;
    uint256 public lastMintBlockNumber;

    event AddPolicy(address indexed beneficiary, uint256 blockInflationRate);
    event RemovePolicy();

    function initialize(TokenManager _tokenManager) public onlyInit {
        tokenManager = _tokenManager;
        token = tokenManager.token();
        lastMintBlockNumber = block.number;

        initialized();
    }

    /** 
    
    */
    function addPolicy(address _beneficiary, uint256 _blockInflationRate) auth(ADD_POLICY_ROLE) external {
        require(_blockInflationRate > 0 && _blockInflationRate <= PCT_BASE, INVALID_INFLATION_RATE_ERROR);

        policies.push(Policy(_beneficiary, _blockInflationRate));

        emit AddPolicy(_beneficiary, _blockInflationRate);
    }

    // function removePolicy()

    function mint() external {
        uint256 currentSupply = token.totalSupply();
        uint256 currentBlockNumber = block.number;
        uint256 elapsedBlocks = currentBlockNumber - lastMintBlockNumber; // no safe math as it assumes the block number can only increase
        require(elapsedBlocks > 0, NO_BLOCKS_ELAPSED_ERROR);
        
        lastMintBlockNumber = currentBlockNumber;
        uint256 totalMinted = 0;

        uint256 policiesLength = policies.length;
        for (uint256 i = 0; i < policiesLength; i++) {
            Policy storage policy = policies[i];

            uint256 mintAmount = _calculateMintAmountForPolicy(policy, currentSupply, elapsedBlocks);

            totalMinted = totalMinted.add(mintAmount);
            tokenManager.mint(policy.beneficiary, mintAmount);
        }
    }

    function _calculateMintAmountForPolicy(Policy storage policy, uint256 currentSupply, uint256 elapsedBlocks) internal returns (uint256 amount) {
        return elapsedBlocks.mul(
            currentSupply.mul(policy.blockInflationRate) / PCT_BASE
        );
    }
}
