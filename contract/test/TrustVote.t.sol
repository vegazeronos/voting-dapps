// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TrustVote.sol";

contract TrustVoteTest is Test {
    TrustVote trustVote;
    address organizer = address(1);
    address voter1 = address(2);
    address voter2 = address(3);
    address nonWhitelistedVoter = address(4);

    // Setup function to deploy the contract before each test
    function setUp() public {
        trustVote = new TrustVote();
        vm.deal(organizer, 1 ether);
        vm.deal(voter1, 1 ether);
        vm.deal(voter2, 1 ether);
        vm.deal(nonWhitelistedVoter, 1 ether);
    }

    // Helper function to create a basic election
    function createBasicElection() internal returns (uint256) {
        address[] memory whitelist = new address[](2);
        whitelist[0] = voter1;
        whitelist[1] = voter2;

        TrustVote.Candidate[] memory candidates = new TrustVote.Candidate[](2);
        candidates[0] = TrustVote.Candidate({
            idCandidate: 0,
            name: "Candidate 1",
            pic: "ipfs://hash1",
            votedCandidate: 0
        });
        candidates[1] = TrustVote.Candidate({
            idCandidate: 1,
            name: "Candidate 2",
            pic: "ipfs://hash2",
            votedCandidate: 0
        });

        uint64 startDate = uint64(block.timestamp + 1 days);
        uint64 endDate = uint64(block.timestamp + 2 days);

        vm.prank(organizer);
        trustVote.createElection(
            "Election 1",
            "Description 1",
            startDate,
            endDate,
            whitelist,
            candidates
        );

        return 0; // idElection starts at 0
    }

    // Test successful election creation
    function testCreateElectionSuccess() public {
        uint256 idElection = createBasicElection();

        // Ambil data Election menggunakan getter
        TrustVote.Election memory election = trustVote.getElection(idElection);
        assertEq(election.idElection, 0);
        assertEq(election.title, "Election 1");
        assertEq(election.descr, "Description 1");
        assertEq(election.addrOrg, organizer);
        assertEq(election.totalVoter, 2);
        assertEq(election.totalHasVoted, 0);

        // Ambil data Candidate menggunakan getter
        TrustVote.Candidate[] memory candidates = trustVote.getCandidates(idElection);
        assertEq(candidates.length, 2);
        assertEq(candidates[0].name, "Candidate 1");
        assertEq(candidates[1].name, "Candidate 2");

        // Verify whitelisting
        assertTrue(trustVote.isWhitelisted(idElection, voter1));
        assertTrue(trustVote.isWhitelisted(idElection, voter2));
    }

    // Test election creation with invalid inputs
    function testCreateElectionInvalidInputs() public {
        address[] memory whitelist = new address[](1);
        whitelist[0] = voter1;

        TrustVote.Candidate[] memory candidates = new TrustVote.Candidate[](2);
        candidates[0] = TrustVote.Candidate({
            idCandidate: 0,
            name: "Candidate 1",
            pic: "ipfs://hash1",
            votedCandidate: 0
        });
        candidates[1] = TrustVote.Candidate({
            idCandidate: 1,
            name: "Candidate 2",
            pic: "ipfs://hash2",
            votedCandidate: 0
        });

        uint64 startDate = uint64(block.timestamp + 1 days);
        uint64 endDate = uint64(block.timestamp + 2 days);

        // Test empty title
        vm.prank(organizer);
        vm.expectRevert(abi.encodeWithSelector(TrustVote.InvalidInput.selector, "input title cannot be empty"));
        trustVote.createElection("", "Description", startDate, endDate, whitelist, candidates);

        // Test empty description
        vm.prank(organizer);
        vm.expectRevert(abi.encodeWithSelector(TrustVote.InvalidInput.selector, "description cannot be empty"));
        trustVote.createElection("Title", "", startDate, endDate, whitelist, candidates);

        // Test invalid dates
        vm.prank(organizer);
        vm.expectRevert(abi.encodeWithSelector(TrustVote.InvalidInput.selector, "End Date must be farther than Start Date"));
        trustVote.createElection("Title", "Description", endDate, startDate, whitelist, candidates);

        // Test insufficient candidates
        TrustVote.Candidate[] memory insufficientCandidates = new TrustVote.Candidate[](1);
        insufficientCandidates[0] = TrustVote.Candidate({
            idCandidate: 0,
            name: "Candidate 1",
            pic: "ipfs://hash1",
            votedCandidate: 0
        });
        vm.prank(organizer);
        vm.expectRevert(abi.encodeWithSelector(TrustVote.InvalidInput.selector, "There must be at least 2 candidate inputted"));
        trustVote.createElection("Title", "Description", startDate, endDate, whitelist, insufficientCandidates);
    }

    // Test successful voting
    function testVotingSuccess() public {
        uint256 idElection = createBasicElection();

        // Fast-forward to election start time
        vm.warp(block.timestamp + 1 days + 1);

        // Voter1 votes for Candidate 0
        vm.prank(voter1);
        trustVote.voting(idElection, 0);

        // Verify voting data
        assertTrue(trustVote.hasVoted(idElection, voter1));
        TrustVote.Election memory election = trustVote.getElection(idElection);
        assertEq(election.totalHasVoted, 1);
        TrustVote.Candidate[] memory candidates = trustVote.getCandidates(idElection);
        assertEq(candidates[0].votedCandidate, 1);
    }

    // Test voting with invalid conditions
    function testVotingInvalidConditions() public {
        uint256 idElection = createBasicElection();

        // Test non-whitelisted voter
        vm.prank(nonWhitelistedVoter);
        vm.expectRevert(abi.encodeWithSelector(TrustVote.InvalidInput.selector, "Invalid or unauthorized voter"));
        trustVote.voting(idElection, 0);

        // Fast-forward to election start time
        vm.warp(block.timestamp + 1 days + 1);

        // Test voting twice
        vm.prank(voter1);
        trustVote.voting(idElection, 0);
        vm.prank(voter1);
        vm.expectRevert(abi.encodeWithSelector(TrustVote.InvalidInput.selector, "Invalid or unauthorized voter"));
        trustVote.voting(idElection, 0);

        // Test voting after election ends
        vm.warp(block.timestamp + 2 days + 1);
        vm.prank(voter2);
        vm.expectRevert(abi.encodeWithSelector(TrustVote.InvalidInput.selector, "Election not active"));
        trustVote.voting(idElection, 0);
    }

    // Test getTopVotes functionality
    function testGetTopVotes() public {
        // Create two elections
        address[] memory whitelist = new address[](2);
        whitelist[0] = voter1;
        whitelist[1] = voter2;

        TrustVote.Candidate[] memory candidates = new TrustVote.Candidate[](2);
        candidates[0] = TrustVote.Candidate({
            idCandidate: 0,
            name: "Candidate 1",
            pic: "ipfs://hash1",
            votedCandidate: 0
        });
        candidates[1] = TrustVote.Candidate({
            idCandidate: 1,
            name: "Candidate 2",
            pic: "ipfs://hash2",
            votedCandidate: 0
        });

        // Election 1: Active, more votes
        vm.prank(organizer);
        trustVote.createElection(
            "Election 1",
            "Description 1",
            uint64(block.timestamp),
            uint64(block.timestamp + 2 days),
            whitelist,
            candidates
        );

        // Election 2: Active, fewer votes
        vm.prank(organizer);
        trustVote.createElection(
            "Election 2",
            "Description 2",
            uint64(block.timestamp),
            uint64(block.timestamp + 2 days),
            whitelist,
            candidates
        );

        // Voters vote in Election 1
        vm.prank(voter1);
        trustVote.voting(0, 0);
        vm.prank(voter2);
        trustVote.voting(0, 1);

        // Voter votes in Election 2
        vm.prank(voter1);
        trustVote.voting(1, 0);

        // Get top votes
        TrustVote.ElectionSummary[] memory topVotes = trustVote.getTopVotes();
        assertEq(topVotes.length, 2);
        assertEq(topVotes[0].idElection, 0); // Election 1 should be first (2 votes)
        assertEq(topVotes[0].totalHasVoted, 2);
        assertEq(topVotes[1].idElection, 1); // Election 2 should be second (1 vote)
        assertEq(topVotes[1].totalHasVoted, 1);
    }
}