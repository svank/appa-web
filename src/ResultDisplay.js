import React from 'react';
import ChainTable from './ChainTable'
import ChainDetail from './ChainDetail'
import DistanceReport from "./DistanceReport";
import './ResultDisplay.css';
import {Button, Dropdown, DropdownButton} from "react-bootstrap";

const sortOptions = [
    'alphabetical',
    'author_order',
    'citation_count',
    'read_count'
];

const sortOptionsDisplayNames = [
    'Alphabetically',
    'Closer to first author',
    'Citation count',
    'Recent read count'
];

class ResultDisplay extends React.Component {
    constructor(props) {
        super(props);
        const chains = sortChains(this.props.chains,
                                  "alphabetical",
                                  this.props.repo);
        this.state = {
            chain: chains[0],
            chains: chains,
            sortOption: "alphabetical"
        };
                
        this.onChainSelected = this.onChainSelected.bind(this);
        this.onSortSelected = this.onSortSelected.bind(this);
    }
    
    onChainSelected(chain) {
        this.setState({"chain": chain});
    }
    
    onSortSelected(sortOption) {
        let chains = sortChains(this.props.chains,
                                sortOption,
                                this.props.repo);
        this.setState({
            sortOption: sortOption,
            chains: chains
        });
    }
    
    render() {
        return (
            <div className="ResultDisplay">
                <div className="ResultDisplayHeader">
                    <Button variant="link"
                            onClick={this.props.onEditSearch}
                            className="ResultDisplayEditSearchButton"
                    >
                        <span className="ResultDisplayLeftArrow" /> Edit search
                    </Button>
                    <SortSelector onSortSelected={this.onSortSelected}
                                  currentOption={this.state.sortOption}
                    />
                </div>
                <DistanceReport source={this.props.source}
                                dest={this.props.dest}
                                dist={this.state.chains[0].length - 1}
                />
                <ChainTable chains={this.state.chains}
                            onChainSelected={this.onChainSelected}
                            repo={this.props.repo}
                />
                <ChainDetail chain={this.state.chain}
                             repo={this.props.repo}
                             addExclusion={this.props.addExclusion}
                             sortOption={this.state.sortOption}
                             key={this.state.sortOption}
                />
            </div>
        );
    }
}

class SortSelector extends React.Component {
    render() {
        return (
            <DropdownButton id="table-sort"
                            title="Sort Results"
                            alignRight
                            size="sm"
                            className="ResultDisplaySortSelector"
            >
                {sortOptions.map((option, idx) =>
                    <Dropdown.Item key={option}
                                   eventKey={option}
                                   active={option === this.props.currentOption}
                                   onSelect={this.props.onSortSelected}
                    >
                        {sortOptionsDisplayNames[idx]}
                    </Dropdown.Item>
                )}
            </DropdownButton>
        )
    }
}

function sortChains(chains, sortOption, repo) {
    switch (sortOption) {
        case "alphabetical":
            return chains.sort(compareChainsAlphabetically);
        case "author_order":
            return chains.sort((chain1, chain2) =>
                compareChainsAuthorOrder(chain1, chain2, repo));
        case "citation_count":
            return chains.sort((chain1, chain2) =>
                compareChainsCitationCount(chain1, chain2, repo));
        case "read_count":
            return chains.sort((chain1, chain2) =>
                compareChainsReadCount(chain1, chain2, repo));
        default:
            return chains;
    }
}

function compareChainsAlphabetically(chain1, chain2) {
    for (let i = 0; i < chain1.length; i++) {
        if (chain1[i] === chain2[i])
            continue;
        return chain1[i] > chain2[i] ? 1 : -1;
    }
    return 0;
}

function compareChainsAuthorOrder(chain1, chain2, repo) {
    return calcAuthorOrderScore(chain1, repo) - calcAuthorOrderScore(chain2, repo);
}

function calcAuthorOrderScore(chain, repo) {
    let totalScore = 0;
    for (let i = 0; i < chain.length - 1; i++) {
        const documents = repo.bibcodeLookup[chain[i]][chain[i + 1]];
        totalScore += Math.min(
            ...documents.map((data) => data[1] + data[2])
        );
    }
    return totalScore;
}

function compareChainsCitationCount(chain1, chain2, repo) {
    return calcCitationCountScore(chain2, repo) - calcCitationCountScore(chain1, repo);
}

function calcCitationCountScore(chain, repo) {
    let totalScore = 0;
    for (let i = 0; i < chain.length - 1; i++) {
        const documents = repo.bibcodeLookup[chain[i]][chain[i + 1]];
        totalScore += Math.max(
            ...documents.map((data) => repo.docData[data[0]].citation_count)
        );
    }
    return totalScore;
}

function compareChainsReadCount(chain1, chain2, repo) {
    return calcReadCountScore(chain2, repo) - calcReadCountScore(chain1, repo);
}

function calcReadCountScore(chain, repo) {
    let totalScore = 0;
    for (let i = 0; i < chain.length - 1; i++) {
        const documents = repo.bibcodeLookup[chain[i]][chain[i + 1]];
        totalScore += Math.max(
            ...documents.map((data) => repo.docData[data[0]].read_count)
        );
    }
    return totalScore;
}

export default ResultDisplay;
