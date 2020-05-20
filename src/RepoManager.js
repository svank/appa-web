function parseServerResponse(data) {
    return {
        originalSource: data.original_src,
        originalDest: data.original_dest,
        originalSourceWithMods: data.original_src_with_mods,
        originalDestWithMods: data.original_dest_with_mods,
        docData: data.doc_data,
        chains: data.chains,
        paperChoicesForChain: data.paper_choices_for_chain,
        stats: data.stats,
    };
}

function copyRepo(repo) {
    const newRepo = {};
    newRepo.chains = [...repo.chains];
    newRepo.paperChoicesForChain = repo.paperChoicesForChain.map(
        (paperChoicesForAChain) => paperChoicesForAChain.map(
            (paperChoicesForALink) => paperChoicesForALink.slice()
        )
    );
    newRepo.docData = Object.assign({}, repo.docData);
    newRepo.originalSource = repo.originalSource;
    newRepo.originalDest = repo.originalDest;
    newRepo.originalSourceWithMods = repo.originalSourceWithMods;
    newRepo.originalDestWithMods= repo.originalDestWithMods;
    newRepo.stats = Object.assign({}, repo.stats);
    return newRepo;
}

function applyNewExclusion(repo, exclusion)  {
    const newRepo = copyRepo(repo);
    const removedChains = [];
    
    if (newRepo.docData[exclusion]) {
        // A bibcode was excluded. Delete the corresponding doc.
        delete newRepo.docData[exclusion];
        // Now filter it out of paperChoicesForChain
        newRepo.paperChoicesForChain = newRepo.paperChoicesForChain.map(
            (paperChoicesForAChain) => paperChoicesForAChain.map(
                (paperChoicesForALink) => paperChoicesForALink.filter(
                    (paperChoice) => paperChoice[0] !== exclusion
                )
            )
        );
        // Now delete any chains that are no longer valid
        for (let i=0; i<newRepo.chains.length; i++) {
            const paperChoices = newRepo.paperChoicesForChain[i];
            for (let j=0; j<paperChoices.length; j++) {
                if (paperChoices[j].length === 0) {
                    removedChains.push(newRepo.chains[i]);
                    newRepo.chains.splice(i, 1);
                    newRepo.paperChoicesForChain.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
    } else if (exclusion.charAt(0) === "=") {
        exclusion = exclusion.slice(1);
        // An author was excluded with strict matching.
        // Filter it out of paperChoicesForChain, being sure to
        // match how the name appears _on the paper_ to the exclusion given.
        newRepo.paperChoicesForChain = newRepo.paperChoicesForChain.map(
            (paperChoicesForAChain) => paperChoicesForAChain.map(
                (paperChoicesForALink) => paperChoicesForALink.filter(
                    (paperChoice) => {
                        const [bibcode, a1idx, a2idx] = paperChoice;
                        const document = newRepo.docData[bibcode];
                        return (document.authors[a1idx] !== exclusion
                                && document.authors[a2idx] !== exclusion);
                    }
                )
            )
        );
        
        // Now delete any chains that are no longer valid
        for (let i=0; i<newRepo.chains.length; i++) {
            const paperChoices = newRepo.paperChoicesForChain[i];
            for (let j=0; j<paperChoices.length; j++) {
                if (paperChoices[j].length === 0) {
                    removedChains.push(newRepo.chains[i]);
                    newRepo.chains.splice(i, 1);
                    newRepo.paperChoicesForChain.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
        
        // Now walk paperChoicesForChain to identify documents
        // that are still relevant
        const newDocData = {};
        newRepo.paperChoicesForChain.forEach(
            (paperChoicesForAChain) => paperChoicesForAChain.forEach(
                (paperChoicesForALink) => paperChoicesForALink.forEach(
                    (paperChoice) => {
                        const bibcode = paperChoice[0];
                        newDocData[bibcode] = newRepo.docData[bibcode];
                    }
                )
            )
        );
        newRepo.docData = newDocData;
    } else {
        // Likely an author was excluded without an '=' flag attached to the
        // name. I don't want to implement the logic to handle full ADS name
        // matching in JS, so this needs to go up to the server
        return [null, null];
    }
    return [newRepo, removedChains];
}

export {parseServerResponse, applyNewExclusion}