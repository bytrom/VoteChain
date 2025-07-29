"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    console.log("Deploying VotingSystem contract...");
    const VotingSystem = await hardhat_1.ethers.getContractFactory("VotingSystem");
    const votingSystem = await VotingSystem.deploy();
    await votingSystem.waitForDeployment();
    const address = await votingSystem.getAddress();
    console.log(`VotingSystem deployed to: ${address}`);
    // Get the owner address
    const [owner] = await hardhat_1.ethers.getSigners();
    console.log(`Contract owner: ${owner.address}`);
    // Log initial fees
    const registrationFee = await votingSystem.registrationFee();
    const candidateFee = await votingSystem.candidateRegistrationFee();
    console.log(`Initial registration fee: ${hardhat_1.ethers.formatEther(registrationFee)} ETH`);
    console.log(`Initial candidate registration fee: ${hardhat_1.ethers.formatEther(candidateFee)} ETH`);
    console.log("Deployment completed successfully!");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
