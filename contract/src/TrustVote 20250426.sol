// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TrustVote is ReentrancyGuard {
    // Custom Error
    error InvalidInput(string reason);

    // State Variable
    uint256 countIdElection = 0;

    // Structs
    struct Election {
        uint256 idElection;
        string title;
        string descr;
        uint64 startDate;
        uint64 endDate;
        address addrOrg;
        uint256 totalVoter;
        uint128 totalHasVoted;
    }

    struct Candidate {
        uint256 idCandidate;
        string name;
        string pic; // dalam bentuk string ipfsHash
        uint256 votedCandidate;
    }

    struct ElectionSummary {
        uint256 idElection;
        string title;
        uint64 endDate;
        uint256 totalVoter;
        uint128 totalHasVoted;
    }

    // Mapping
    mapping(uint256 => Election) public electionData; // untuk mapping idElection ke data Election
    mapping(uint256 => Candidate[]) public candidateData; // untuk mapping idElection punya kandidat siapa saja
    mapping(address => uint256[]) public organizerElection; // untuk mapping organizer punya idElection apa saja
    mapping(address => uint256[]) public voterElection; // untuk mapping voter punya idElection apa saja
    mapping(uint256 => address[]) public whiteListedVoter; // untuk mapping idElection punya list whitelist address siapa saja
    mapping(uint256 => mapping(address => bool)) public isWhitelisted; // untuk mapping list address voter pada idElection tertentu
    mapping(uint256 => mapping(address => bool)) public hasVoted; // untuk mapping address voter sudah melakukan voting atau belum

    // Events
    event electionCreated(uint256 indexed idElection, address indexed addrOrg, string title, uint256 startDate, uint256 endDate);
    event votingSuccess(uint256 indexed idElection, address indexed voterAddr, uint256 indexed idCandidate);

    // Getter untuk mengembalikan seluruh struct Election, bisa juga menggunakan mapping yang sudah didefinisi diatas, tapi untuk pengembangan lebih baik pakai function getter ini
    function getElection(uint256 idElection) public view returns (Election memory) {
        return electionData[idElection];
    }

    // Getter untuk mengembalikan seluruh array Candidate[], bisa juga menggunakan mapping yang sudah didefinisi diatas, tapi untuk pengembangan lebih baik pakai function getter ini
    function getCandidates(uint256 idElection) public view returns (Candidate[] memory) {
        return candidateData[idElection];
    }

    // Function untuk organizer membuat election
    function createElection(
        string memory title,
        string memory description,
        uint64 startDate,
        uint64 endDate,
        address[] memory whitelist,
        Candidate[] memory candidateList
    ) public {
        if (bytes(title).length == 0) revert InvalidInput("input title cannot be empty");
        if (bytes(description).length == 0) revert InvalidInput("description cannot be empty");
        if (startDate >= endDate) revert InvalidInput("End Date must be farther than Start Date");
        if (whitelist.length == 0) revert InvalidInput("There must be at least 1 whitelisted address inputed");
        if (candidateList.length < 2) revert InvalidInput("There must be at least 2 candidate inputted");

        Election memory newElection = Election({
            idElection: countIdElection++,
            title: title,
            descr: description,
            startDate: startDate,
            endDate: endDate,
            addrOrg: msg.sender,
            totalVoter: whitelist.length,
            totalHasVoted: 0
        });
        electionData[newElection.idElection] = newElection;

        for (uint256 i = 0; i < candidateList.length; i++) {
            if (bytes(candidateList[i].name).length == 0) revert InvalidInput("Candidate's name cannot be empty");
            if (bytes(candidateList[i].pic).length == 0) revert InvalidInput("Candidate's pic cannot be empty");
            candidateData[newElection.idElection].push(
                Candidate({
                    idCandidate: i,
                    name: candidateList[i].name,
                    pic: candidateList[i].pic,
                    votedCandidate: 0
                })
            );
        }

        for (uint256 i = 0; i < whitelist.length; i++) {
            if (whitelist[i] == address(0)) revert InvalidInput("Address cannot be empty or zero");
            voterElection[whitelist[i]].push(newElection.idElection);
            whiteListedVoter[newElection.idElection].push(whitelist[i]);
            isWhitelisted[newElection.idElection][whitelist[i]] = true;
            hasVoted[newElection.idElection][whitelist[i]] = false;
        }

        organizerElection[msg.sender].push(newElection.idElection);
        emit electionCreated(newElection.idElection, msg.sender, newElection.title, newElection.startDate, newElection.endDate);
    }

function updateElection(
        uint256 idElection,
        string memory title,
        string memory description
    ) public {
        electionData[idElection].title = title;
        electionData[idElection].descr = description;
    }


function voting(uint256 idElection, uint256 idCandidate) public {
    Election storage election = electionData[idElection];

    // Validasi terkait pengirim dalam satu if
    if (msg.sender == address(0) || 
        msg.sender == election.addrOrg || 
        !isWhitelisted[idElection][msg.sender] || 
        hasVoted[idElection][msg.sender]
    ) revert InvalidInput("Invalid or unauthorized voter");
    uint64 timestamp = uint64(block.timestamp);
    // Validasi waktu dalam satu if
    if (election.startDate > timestamp || election.endDate < timestamp)
        revert InvalidInput("Election not active");

    // Update state
    if (election.totalHasVoted >= election.totalVoter) 
        revert InvalidInput("Exceeds total voters");
    election.totalHasVoted++;
    hasVoted[idElection][msg.sender] = true;
    candidateData[idElection][idCandidate].votedCandidate++;
    emit votingSuccess(idElection, msg.sender, idCandidate);
}


    // Function untuk page top Votes, diambil yang aktif dan diurutkan berdasarkan top votes
    function getTopVotes() public view returns (ElectionSummary[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < countIdElection; i++) {
            Election memory election = electionData[i];
            if (uint64(block.timestamp) >= election.startDate && uint64(block.timestamp) <= election.endDate) {
                activeCount++;
            }
        }

        ElectionSummary[] memory activeElections = new ElectionSummary[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < countIdElection; i++) {
            Election memory election = electionData[i];
            if (uint64(block.timestamp) >= election.startDate && uint64(block.timestamp) <= election.endDate) {
                activeElections[index] = ElectionSummary({
                    idElection: election.idElection,
                    title: election.title,
                    endDate: election.endDate,
                    totalVoter: election.totalVoter,
                    totalHasVoted: election.totalHasVoted
                });
                index++;
            }
        }

        // Urutkan berdasarkan totalHasVoted (descending) menggunakan bubble sort
        for (uint256 i = 0; i < activeCount; i++) {
            for (uint256 j = 0; j < activeCount - i - 1; j++) {
                if (activeElections[j].totalHasVoted < activeElections[j + 1].totalHasVoted) {
                    // Swap
                    ElectionSummary memory temp = activeElections[j];
                    activeElections[j] = activeElections[j + 1];
                    activeElections[j + 1] = temp;
                }
            }
        }

        return activeElections;
    }
}