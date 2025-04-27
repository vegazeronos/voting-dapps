// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {TrustVote} from "../src/TrustVote.sol";

contract CallCreateElection is Script {
    function run() external {
        // Alamat kontrak TrustVote yang sudah dideploy
        TrustVote trustVote = TrustVote(0x2FA35f16Fe2365b33160A83167D97305B4498060);

        // Siapkan data untuk createElection
        address[] memory whitelist = new address[](2);
        whitelist[0] = 0x0000000000000000000000000000000000000002;
        whitelist[1] = 0x0000000000000000000000000000000000000003;

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

        // Panggil fungsi createElection
        vm.startBroadcast();
        trustVote.createElection(
            "Election 1",
            "Description 1",
            startDate,
            endDate,
            whitelist,
            candidates
        );
        vm.stopBroadcast();

        console.log("Election created successfully!");
    }
}
