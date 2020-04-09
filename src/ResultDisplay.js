import React from 'react';
import {Button, Dropdown, DropdownButton, Tab, Tabs} from "react-bootstrap";
import Octicon, {ChevronLeft, Stop} from "@primer/octicons-react";
import {applyNewExclusion} from './ServerResponseParser';
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
    'Total citation count',
    'Recent read count'
];

class ResultDisplay extends React.Component {
    constructor(props) {
        super(props);
        const chains = sortChains(props.repo.chains,
                                  "alphabetical",
                                  props.repo);
        this.state = {
            repo: props.repo,
            chain: chains[0],
            sortOption: "alphabetical",
            activeTab: "table",
            width: null
        };
                
        this.onChainSelected = this.onChainSelected.bind(this);
        this.onSortSelected = this.onSortSelected.bind(this);
        this.onTabSelected = this.onTabSelected.bind(this);
        this.addExclusion = this.addExclusion.bind(this);
    }
    
    onChainSelected(chain) {
        this.setState({chain: chain});
    }
    
    onSortSelected(sortOption) {
        this.setState({sortOption: sortOption});
    }
    
    onTabSelected(tab) {
        this.setState({activeTab: tab});
    }
    
    addExclusion(exclusion) {
        const chainIdx = sortChains(
            this.state.repo.chains, this.state.sortOption, this.state.repo)
            .indexOf(this.state.chain);
        let [newData, newIdx] = applyNewExclusion(
            this.state.repo, exclusion, chainIdx);
        const needServer = newData === null || newData.chains.length === 0;
        if (!needServer) {
            if (newIdx >= newData.chains.length)
                newIdx = newData.chains.length - 1;
            const newChain = sortChains(
                newData.chains, this.state.sortOption, newData)[newIdx];
            this.setState({repo: newData, chain: newChain});
        }
        this.props.addExclusion(exclusion, needServer);
    }
    
    componentDidMount() {
        // We want the display to expand so the full table fits inside.
        // But we don't want the display to shrink when switching tabs.
        // So after the first render we record the width of the display
        // and lock it in on all future renders.
        let bbox = this.element.getBoundingClientRect();
        this.setState({width: bbox.width});
    }
    
    render() {
        const chains = sortChains(
            this.state.repo.chains, this.state.sortOption, this.state.repo);
        const containerStyle = {};
        if (this.state.width)
            containerStyle.width = this.state.width + "px";
        return (
            <div className="ResultDisplay"
                 style={containerStyle}
                 ref={(e) => this.element = e}
            >
                <div className="ResultDisplayHeader">
                    <Button variant="link"
                            onClick={this.props.onEditSearch}
                            className="ResultDisplayEditSearchButton"
                             style={{display: "flex", alignItems: "center"}}
                    >
                        <Octicon icon={ChevronLeft} />
                    &nbsp;Edit search
                    </Button>
                    <StatsDisplay stats={this.state.repo.stats}
                                  repo={this.state.repo}
                    />
                </div>
                <DistanceReport source={this.state.repo.originalSource}
                                dest={this.state.repo.originalDest}
                                dist={chains[0].length - 1}
                />
                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <Octicon icon={Stop} />
                    &nbsp;Name-matching can be ambiguous. 
                </div>
                <div className="text-muted"
                     style={{marginBottom: "15px"}}
                >
                    Verify {}
                    the results below and remove false positives before {}
                    believing them.
                </div>
                <Tabs activeKey={this.state.activeTab}
                      onSelect={this.onTabSelected}
                      id="top-row-tabs"
                >
                    <Tab eventKey="table" title="Table">
                        <div className="TableDisplayHeader">
                            <div className="text-muted">
                                Each row in the table below represents one {}
                                chain of coauthorship between the two {}
                                authors.<br />The selected row is displayed in {}
                                detail below.
                            </div>
                            <SortSelector onSortSelected={this.onSortSelected}
                                          currentOption={this.state.sortOption}
                            />
                        </div>
                        <ChainTable chains={chains}
                                    selectedChain={this.state.chain}
                                    onChainSelected={this.onChainSelected}
                                    repo={this.state.repo}
                        />
                        <ChainDetail chain={this.state.chain}
                                     repo={this.state.repo}
                                     addExclusion={this.addExclusion}
                                     sortOption={this.state.sortOption}
                                     key={this.state.sortOption}
                        />
                    </Tab>
                    <Tab eventKey="graph" title="Graph">
                        <Graph repo={this.state.repo} />
                    </Tab>
                    <Tab eventKey="word-cloud" title="Word Cloud">
                        <WordCloud repo={this.state.repo}
                                   active={this.state.activeTab === "word-cloud"}
                        />
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
