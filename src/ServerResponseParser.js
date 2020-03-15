function parseResponse(data) {
    let list_of_chains = [];
    let chain_starter = [];
    
    processChildNode(data.author_graph, list_of_chains, chain_starter);
    return {
        chains: list_of_chains,
        bibcodeLookup: data.bibcode_pairings,
        docData: data.doc_data
    };
}

function processChildNode(node, list_of_chains, chain_starter) {
    chain_starter.push(node.name);
    if (node.neighbors_toward_dest.length === 0)
        list_of_chains.push(Array.from(chain_starter));
    else {
        for (let neighbor of node.neighbors_toward_dest)
            processChildNode(neighbor, list_of_chains, chain_starter);
    }
    chain_starter.pop();
}

export default parseResponse;