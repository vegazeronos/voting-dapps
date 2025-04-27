// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {TrustVote} from "../src/TrustVote.sol";

contract DeployTrustVote is Script {
    function run() external {
        // Mulai broadcast transaksi
        vm.startBroadcast();

        // Deploy kontrak TrustVote
        TrustVote trustVote = new TrustVote();
        console.log("TrustVote deployed at:", address(trustVote));

        // Selesai broadcast
        vm.stopBroadcast();
    }
}