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
    "0x399A52E15f96108CA4Ffe7dabdd2A7E27b156F74"
  );
  console.log(`Governor: ${await checker.getAddress()}`);

  /* Governance */
  const governor = await ethers.getContractAt("IGovernor",
    "0x9bEe222fDb28F6AedcD9ab349f0c9DCAFFae9a97"
  );
  console.log(`Governor: ${await governor.getAddress()}`);

  let proposalId = "73233423443999964969326103780500477922335521031608880287856556299884774550668";

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
