import React from 'react';
import {Button, Dropdown, DropdownButton, Tab, Tabs} from "react-bootstrap";
import ChainTable from './ChainTable'
import ChainDetail from './ChainDetail'
import DistanceReport from "./DistanceReport";
import Graph from "./Graph";
import StatsDisplay from "./StatsDisplay";
import WordCloud from "./WordCloud";
import './ResultDisplay.css';

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
            sortOption: "alphabetical",
            activeTab: "table"
        };
                
        this.onChainSelected = this.onChainSelected.bind(this);
        this.onSortSelected = this.onSortSelected.bind(this);
        this.onTabSelected = this.onTabSelected.bind(this);
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
    
    onTabSelected(tab) {
        this.setState({activeTab: tab});
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
                    <StatsDisplay stats={this.props.repo.stats}
                                  repo={this.props.repo}
                    />
                </div>
                <DistanceReport source={this.props.repo.originalSource}
                                dest={this.props.repo.originalDest}
                                dist={this.state.chains[0].length - 1}
                />
                <Tabs activeKey={this.state.activeTab}
                      onSelect={this.onTabSelected}
                      id="top-row-tabs"
                >
                    <Tab eventKey="table" title="Table">
                        <div className="TableDisplayHeader">
                            <div>
                                The selected row is displayed in detail below.
                            </div>
                            <SortSelector onSortSelected={this.onSortSelected}
                                          currentOption={this.state.sortOption}
                            />
                        </div>
                        <ChainTable chains={this.state.chains}
                                    selectedChain={this.state.chain}
                                    onChainSelected={this.onChainSelected}
                                    repo={this.props.repo}
                        />
                        <ChainDetail chain={this.state.chain}
                                     repo={this.props.repo}
                                     addExclusion={this.props.addExclusion}
                                     sortOption={this.state.sortOption}
                                     key={this.state.sortOption}
                        />
                    </Tab>
                    <Tab eventKey="word-cloud" title="Word Cloud">
                        <WordCloud repo={this.props.repo}
                                   active={this.state.activeTab === "word-cloud"}
                        />
                    </Tab>
                    <Tab eventKey="graph" title="Graph">
                        <Graph repo={this.props.repo} />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

class SortSelector extends React.Component {
    render() {
        return (
            <div className="ResultDisplaySortSelectorContainer">
                <DropdownButton id="table-sort"
                                title="Sort Results"
                                alignRight
                                size="sm"
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
            </div>
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
