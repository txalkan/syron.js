export async function selectWeightedAyjaHolder(accounts) {
    // Count the total tokens
    let totalTokens = 0;
    for (const username of Object.keys(accounts)) {
      	totalTokens += accounts[username].balance;
    }
    // Create a copy of balances where the amount each holder owns is represented by a value 0-1
    const weighted = {};
    for (const username of Object.keys(accounts)) {
		const addr = accounts[username].ssi;
      	weighted[addr] = accounts[username].balance / totalTokens;
    }
  
    let sum = 0;
    const r = Math.random();
    for (const address of Object.keys(weighted)) {
		sum += weighted[address];
		if (r <= sum && weighted[address] > 0.0001) {
			return address;
		}
    }
    throw new Error('Unable to select token holder.');
}
  