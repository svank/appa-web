function parseResponse(data) {
    let list_of_chains = [];
    let chain_starter = [];
    
    processChildNode(data.author_graph, list_of_chains, chain_starter);
    return {
        chains: list_of_chains,
        bibcodeLookup: data.bibcode_pairings,
        docData: data.doc_data,
        originalSource: data.original_src,
        originalDest: data.original_dest,
        stats: data.stats
    };
}

function copyRepo(repo) {
    const newRepo = {};
    newRepo.chains = [...repo.chains];
    newRepo.bibcodeLookup = {};
    for (const a1 of Object.keys(repo.bibcodeLookup)) {
        for (const a2 of Object.keys(repo.bibcodeLookup[a1])) {
            if (!newRepo.bibcodeLookup[a1])
                newRepo.bibcodeLookup[a1] = {};
            newRepo.bibcodeLookup[a1][a2] = [...repo.bibcodeLookup[a1][a2]];
        }
    }
    newRepo.docData = Object.assign({}, repo.docData);
    newRepo.originalSource = repo.originalSource;
    newRepo.originalDest = repo.originalDest;
    newRepo.stats = Object.assign({}, repo.stats);
    return newRepo;
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

function applyNewExclusion(repo, exclusion, selectedIdx)  {
    const newRepo = copyRepo(repo);
    
    if (newRepo.docData[exclusion]) {
        // A bibcode was excluded. Delete the corresponding doc.
        delete newRepo.docData[exclusion];
        // Now delete it from the author-pair->bibcode lookup
        for (const a1 of Object.keys(newRepo.bibcodeLookup)) {
            for (const a2 of Object.keys(newRepo.bibcodeLookup[a1])) {
                newRepo.bibcodeLookup[a1][a2] = 
                    // eslint-disable-next-line no-loop-func
                    newRepo.bibcodeLookup[a1][a2].filter(d => d[0] !== exclusion);
                if (newRepo.bibcodeLookup[a1][a2].length === 0)
                    delete newRepo.bibcodeLookup[a1][a2];
            }
            if (newRepo.bibcodeLookup[a1].length === 0)
                delete newRepo.bibcodeLookup[a1];
        }
        // Now delete any chains that are no longer valid
        for (let i=0; i<newRepo.chains.length; i++) {
            const chain = newRepo.chains[i];
            for (let j=0; j<chain.length - 1; j++) {
                const a1 = chain[j];
                const a2 = chain[j+1];
                if (newRepo.bibcodeLookup[a1] === undefined
                        || newRepo.bibcodeLookup[a1][a2] === undefined) {
                    // This chain is not valid
                    newRepo.chains.splice(i, 1);
                    if (i < selectedIdx)
                        selectedIdx--;
                    i--;
                    break;
                }
            }
        }
    } else if (exclusion.charAt(0) === "=") {
        exclusion = exclusion.slice(1);
        // An author was excluded with strict matching.
        // Delete entries from the author-pair->bibcode lookup, being sure to
        // match how the name appears _on the paper_ to the exclusion given.
        for (const a1 of Object.keys(newRepo.bibcodeLookup)) {
            for (const a2 of Object.keys(newRepo.bibcodeLookup[a1])) {
                newRepo.bibcodeLookup[a1][a2] =
                    // eslint-disable-next-line no-loop-func
                    newRepo.bibcodeLookup[a1][a2].filter(docData => {
                        const [bibcode, a1idx, a2idx] = docData;
                        return (
                            newRepo.docData[bibcode].authors[a1idx] !== exclusion
                            && newRepo.docData[bibcode].authors[a2idx] !== exclusion)
                    });
                if (newRepo.bibcodeLookup[a1][a2].length === 0)
                    delete newRepo.bibcodeLookup[a1][a2];
            }
            if (newRepo.bibcodeLookup[a1].length === 0)
                delete newRepo.bibcodeLookup[a1];
        }
        
        // Now delete any chains that are no longer valid
        for (let i=0; i<newRepo.chains.length; i++) {
            const chain = newRepo.chains[i];
            for (let j=0; j<chain.length - 1; j++) {
                const a1 = chain[j];
                const a2 = chain[j+1];
                if (newRepo.bibcodeLookup[a1] === undefined
                        || newRepo.bibcodeLookup[a1][a2] === undefined) {
                    // This chain is not valid
                    newRepo.chains.splice(i, 1);
                    if (i < selectedIdx)
                        selectedIdx--;
                    i--;
                    break;
                }
            }
        }
        
        // Now walk the author-pair->bibcode lookup to identify documents
        // that are still relevant
        const newDocData = {};
        for (const a1 of Object.keys(newRepo.bibcodeLookup)) {
            for (const a2 of Object.keys(newRepo.bibcodeLookup[a1])) {
                for (const bibcodeData of newRepo.bibcodeLookup[a1][a2]) {
                    newDocData[bibcodeData[0]] = newRepo.docData[bibcodeData[0]]
                }
            }
        }
        newRepo.docData = newDocData;
    } else {
        // Likely an author was excluded without an '=' flag attached to the
        // name. I don't want to implement the logic to handle full ADS name
        // matching in JS, so this needs to go up to the server
        return [null, null];
    }
    return [newRepo, selectedIdx];
}

export {parseResponse, applyNewExclusion}