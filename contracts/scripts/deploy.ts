import { ethers, run } from "hardhat";

const PROPOSALS = ["Ali", "Diana", "Bekzat"];

function toBytes32(name: string): string {
  return ethers.encodeBytes32String(name);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Ballot with account:", deployer.address);

  const proposalBytes = PROPOSALS.map(toBytes32);
  const ballot = await ethers.deployContract("Ballot", [proposalBytes]);
  await ballot.waitForDeployment();

  const address = await ballot.getAddress();

  console.log("Ballot deployed to:", address);
  console.log("Constructor args:", PROPOSALS);
  console.log("Verify command:");
  console.log(`npx hardhat verify --network bscTestnet ${address} --constructor-args verify-args.js`);

  if (process.env.VERIFY_ON_DEPLOY === "true") {
    console.log("Waiting for block confirmations before verify...");
    await ballot.deploymentTransaction()?.wait(6);
    await run("verify:verify", {
      address,
      constructorArguments: [proposalBytes],
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
