"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotingSystemContract = void 0;
exports.connectToMetaMask = connectToMetaMask;
exports.getVotingSystemContract = getVotingSystemContract;
exports.formatTime = formatTime;
exports.isElectionActive = isElectionActive;
exports.getElectionStatus = getElectionStatus;
const ethers_1 = require("ethers");
const VotingSystem_json_1 = __importDefault(require("../artifacts/contracts/VotingSystem.sol/VotingSystem.json"));
class VotingSystemContract {
    constructor(contractAddress, signer) {
        this.contract = new ethers_1.ethers.Contract(contractAddress, VotingSystem_json_1.default.abi, signer);
        this.signer = signer;
    }
    // Election Management
    async createElection(name, description, startTime, endTime) {
        return await this.contract.createElection(name, description, startTime, endTime);
    }
    async getElection(electionId) {
        const election = await this.contract.getElection(electionId);
        return {
            id: Number(election.id),
            name: election.name,
            description: election.description,
            startTime: Number(election.startTime),
            endTime: Number(election.endTime),
            isActive: election.isActive,
            isCompleted: election.isCompleted,
            totalVotes: Number(election.totalVotes),
            totalCandidates: Number(election.totalCandidates),
        };
    }
    async getActiveElections() {
        const elections = await this.contract.getActiveElections();
        return elections.map((election) => ({
            id: Number(election.id),
            name: election.name,
            description: election.description,
            startTime: Number(election.startTime),
            endTime: Number(election.endTime),
            isActive: election.isActive,
            isCompleted: election.isCompleted,
            totalVotes: Number(election.totalVotes),
            totalCandidates: Number(election.totalCandidates),
        }));
    }
    // Candidate Management
    async registerCandidate(electionId, name, party, position, imageHash, fee) {
        const feeWei = ethers_1.ethers.parseEther(fee);
        return await this.contract.registerCandidate(electionId, name, party, position, imageHash, { value: feeWei });
    }
    async getCandidate(electionId, candidateId) {
        const candidate = await this.contract.getCandidate(electionId, candidateId);
        return {
            id: Number(candidate.id),
            name: candidate.name,
            party: candidate.party,
            position: candidate.position,
            imageHash: candidate.imageHash,
            voteCount: Number(candidate.voteCount),
            isActive: candidate.isActive,
            registrationTime: Number(candidate.registrationTime),
        };
    }
    async getElectionResults(electionId) {
        const results = await this.contract.getElectionResults(electionId);
        return results.map((candidate) => ({
            id: Number(candidate.id),
            name: candidate.name,
            party: candidate.party,
            position: candidate.position,
            imageHash: candidate.imageHash,
            voteCount: Number(candidate.voteCount),
            isActive: candidate.isActive,
            registrationTime: Number(candidate.registrationTime),
        }));
    }
    // Voter Management
    async registerVoter(fee) {
        const feeWei = ethers_1.ethers.parseEther(fee);
        return await this.contract.registerVoter({ value: feeWei });
    }
    async getVoter(address) {
        const voter = await this.contract.getVoter(address);
        return {
            isRegistered: voter.isRegistered,
            hasVoted: voter.hasVoted,
            votedFor: Number(voter.votedFor),
            registrationTime: Number(voter.registrationTime),
        };
    }
    async vote(electionId, candidateId) {
        return await this.contract.vote(electionId, candidateId);
    }
    // Fee Management
    async getRegistrationFee() {
        const fee = await this.contract.registrationFee();
        return ethers_1.ethers.formatEther(fee);
    }
    async getCandidateRegistrationFee() {
        const fee = await this.contract.candidateRegistrationFee();
        return ethers_1.ethers.formatEther(fee);
    }
    async updateFees(registrationFee, candidateFee) {
        const regFeeWei = ethers_1.ethers.parseEther(registrationFee);
        const candFeeWei = ethers_1.ethers.parseEther(candidateFee);
        return await this.contract.updateFees(regFeeWei, candFeeWei);
    }
    // Admin Functions
    async completeElection(electionId) {
        return await this.contract.completeElection(electionId);
    }
    async deactivateVoter(address) {
        return await this.contract.deactivateVoter(address);
    }
    async deactivateVoters(addresses) {
        return await this.contract.deactivateVoters(addresses);
    }
    async withdrawFees() {
        return await this.contract.withdrawFees();
    }
    async emergencyStopElection(electionId) {
        return await this.contract.emergencyStopElection(electionId);
    }
    async removeCandidate(electionId, candidateId) {
        return await this.contract.removeCandidate(electionId, candidateId);
    }
    // Utility Functions
    async getTotalElections() {
        return Number(await this.contract.getTotalElections());
    }
    async getTotalCandidates() {
        return Number(await this.contract.getTotalCandidates());
    }
    // Event Listeners
    onElectionCreated(callback) {
        this.contract.on("ElectionCreated", callback);
    }
    onCandidateRegistered(callback) {
        this.contract.on("CandidateRegistered", callback);
    }
    onVoterRegistered(callback) {
        this.contract.on("VoterRegistered", callback);
    }
    onVoteCast(callback) {
        this.contract.on("VoteCast", callback);
    }
    onElectionCompleted(callback) {
        this.contract.on("ElectionCompleted", callback);
    }
    // Remove all listeners
    removeAllListeners() {
        this.contract.removeAllListeners();
    }
}
exports.VotingSystemContract = VotingSystemContract;
// Helper function to connect to MetaMask
async function connectToMetaMask() {
    if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed");
    }
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        return new ethers_1.ethers.BrowserProvider(window.ethereum);
    }
    catch (error) {
        throw new Error("Failed to connect to MetaMask");
    }
}
// Helper function to get contract instance
async function getVotingSystemContract(contractAddress) {
    const provider = await connectToMetaMask();
    const signer = await provider.getSigner();
    return new VotingSystemContract(contractAddress, signer);
}
// Helper function to format time
function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}
// Helper function to check if election is active
function isElectionActive(election) {
    const now = Math.floor(Date.now() / 1000);
    return election.isActive && now >= election.startTime && now <= election.endTime;
}
// Helper function to get election status
function getElectionStatus(election) {
    if (election.isCompleted)
        return "Completed";
    if (!election.isActive)
        return "Inactive";
    const now = Math.floor(Date.now() / 1000);
    if (now < election.startTime)
        return "Upcoming";
    if (now > election.endTime)
        return "Ended";
    return "Active";
}
