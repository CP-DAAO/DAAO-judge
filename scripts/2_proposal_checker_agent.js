const { ethers } = require("hardhat");
require("dotenv").config();
const axios = require('axios');

const callChatGPT = async (apiKey, content) => {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
  const body = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: content }],
    max_tokens: 150,
  });

  const response = await axios.post(url, body, { headers });
  return response.data.choices[0].message.content;
};

async function main() {
  const deployer = (await ethers.getSigners())[0];
  console.log(`Deployer: ${deployer.address}, ${await ethers.provider.getBalance(deployer.address)}`);

  /* Checker */
  const checker = await ethers.getContractAt("Checker",
    "0xDeEc6F702b3db25C6B413E8bF2e91fe6179e444c"
  );
  console.log(`Checker: ${await checker.getAddress()}`);

  /* Governance */
  const governor = await ethers.getContractAt("IGovernor",
    "0xAb563D95Aeb44aA2aa4FD49Bb7915E7C55CdEeB9"
  );
  console.log(`Governor: ${await governor.getAddress()}`);

  let proposalId = "37746331935989784777527355319835173876222299405257570199728512702580734313731";

  // judging
  let vote = 0;
  let preference = "The agent strictly opposes the use of the foundation's money for any projects that do not directly align with the foundation's core mission and objectives. The agent believes that any diversion of funds to other projects, regardless of their potential benefits, undermines the foundation's purpose and should be avoided at all costs.";
  // Example: https://compound.finance/governance/proposals/289
  let proposalDescription = "Trust Setup for DAO investment into GoldCOMP";

  const apiKey = process.env.OPENAI_API_KEY;
  const query = `You are an agent with the following preference:
"${preference}"

A proposal has been presented with the following description:
"${proposalDescription}"

Based on your preference and the details of the proposal, respond with only one of the following numbers:
- 0 for "Against"
- 1 for "For"
- 2 for "Abstain"`;
  vote = JSON.parse(await callChatGPT(apiKey, query));
  console.log("Agent Response:", vote);

  let utf8Encode = new TextEncoder();
  const tx = await checker.setResponse(
    proposalId,
    utf8Encode.encode(query),
    vote
  );
  const txRes = await tx.wait();
  console.log(`Tx: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).then(() => {
  process.exit();
});
