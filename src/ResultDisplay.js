import React from 'react';
import {Button, Dropdown, DropdownButton, Tab, Tabs} from "react-bootstrap";
import {ChevronLeftIcon, StopIcon} from "@primer/octicons-react";
import {applyNewExclusion} from './RepoManager';
import ChainTable from './ChainTable';
import ChainDetail from './ChainDetail';
import DistanceReport from "./DistanceReport";
import Graph from "./Graph";
import {NameMatchingDialogButton} from "./NameMatchingHelp";
import StatsDisplay from "./StatsDisplay";
import WordCloud from "./WordCloud";
import './ResultDisplay.css';

const sortOptions = [
    'confidence',
    'alphabetical',
    'author_order',
    'citation_count',
    'read_count'
];

const sortOptionsDisplayNames = [
    'Name-match confidence',
    'Alphabetically',
    'Closer to first author',
    'Total citation count',
    'Recent read count'
];

class ResultDisplay extends React.Component {
    constructor(props) {
        super(props);
        const chains = sortChains("confidence", props.repo);
        this.state = {
            repo: props.repo,
            chains: chains,
            chainIdx: 0,
            sortedChainIdx: 0,
            sortOption: "confidence",
            activeTab: "table",
        };
        
        this.onChainSelected = this.onChainSelected.bind(this);
        this.onSortSelected = this.onSortSelected.bind(this);
        this.onTabSelected = this.onTabSelected.bind(this);
        this.addExclusion = this.addExclusion.bind(this);
        
        this.width = null;
        this.containerRef = React.createRef();
    }
    
    onChainSelected(idx) {
        const chain = this.state.chains[idx];
        const chainIdx = this.state.repo.chains.indexOf(chain);
        this.setState({
            chainIdx: chainIdx,
            sortedChainIdx: idx,
        });
    }
    
    onSortSelected(sortOption) {
        const chain = this.state.chains[this.state.sortedChainIdx];
        const chains = sortChains(sortOption, this.state.repo);
        const sortedChainIdx = chains.indexOf(chain);
        this.setState({
            sortOption: sortOption,
            chains: chains,
            sortedChainIdx: sortedChainIdx,
        });
    }
    
    onTabSelected(tab) {
        this.setState({activeTab: tab});
    }
    
    addExclusion(exclusion) {
        let [newRepo, removedChains] = applyNewExclusion(
            this.state.repo, exclusion);
        const needServer = newRepo === null || newRepo.chains.length === 0;
        if (!needServer) {
            const oldChains = this.state.chains;
            const newChains = sortChains(this.state.sortOption, newRepo);
            let newSortedChainIdx = this.state.sortedChainIdx;
            
            // Check if any of the removed chains were before the selected
            // chain. For each one that is, our selection index should
            // decrease so our chain is still selected.
            const removedChainsIndices = [];
            removedChains.forEach((removedChain) => {
                const idx = oldChains.indexOf(removedChain);
                removedChainsIndices.push(idx);
                if (idx < this.state.sortedChainIdx)
                    newSortedChainIdx--;
            });
            if (newSortedChainIdx >= newChains.length)
                newSortedChainIdx = newChains.length - 1;
            
            this.setState({
                repo: newRepo,
                chains: newChains,
                chainIdx: newRepo.chains.indexOf(newChains[newSortedChainIdx]),
                sortedChainIdx: newSortedChainIdx,
            });
        }
        this.props.addExclusion(exclusion, needServer);
    }
    
    componentDidMount() {
        // We want the display to expand so the full table fits inside.
        // But we don't want the display to shrink when switching tabs.
        // So after the first render we record the width of the display
        // and lock it in on all future renders.
        let bbox = this.containerRef.current.getBoundingClientRect();
        this.width = bbox.width;
        this.containerRef.current.style.width = this.width;
    }
    
    render() {
        const containerStyle = {};
        if (this.width)
            containerStyle.width = this.width + "px";
        return (
            <div className="result-display"
                 style={containerStyle}
                 ref={this.containerRef}
            >
                <div className="result-display-header">
                    <Button variant="link"
                            onClick={this.props.onEditSearch}
                            className="result-display-edit-search-button"
                             style={{display: "flex", alignItems: "center"}}
                    >
                        <ChevronLeftIcon />&nbsp;Edit&nbsp;search
                    </Button>
                    <StatsDisplay stats={this.state.repo.stats}
                                  repo={this.state.repo}
                    />
                </div>
                <DistanceReport source={this.state.repo.originalSourceWithMods}
                                dest={this.state.repo.originalDestWithMods}
                                dist={this.state.chains[0].length - 1}
                />
                <div>
                    <StopIcon verticalAlign="text-top" />
                    &nbsp;&nbsp;These results cannot be guaranteed to be correct.&nbsp;&nbsp;
                    <NameMatchingDialogButton>
                        (why?)
                    </NameMatchingDialogButton>
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
                      mountOnEnter={true}
                      id="top-row-tabs"
                >
                    <Tab eventKey="table" title="Table">
                        <div className="table-display-header">
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
                        <ChainTable chains={this.state.chains}
                                    selectedChainIdx={this.state.sortedChainIdx}
                                    onChainSelected={this.onChainSelected}
                        />
                        <ChainDetail chain={
                                        this.state.chains[
                                            this.state.sortedChainIdx]}
                                     paperChoices={
                                         this.state.repo.paperChoicesForChain[
                                             this.state.chainIdx]}
                                     repo={this.state.repo}
                                     addExclusion={this.addExclusion}
                                     sortOption={this.state.sortOption}
                                     key={this.state.sortOption + this.state.sortedChainIdx}
                        />
                    </Tab>
                    <Tab eventKey="graph" title="Graph">
                        <Graph repo={this.state.repo}
                               key={this.state.repo.chains.length}
                        />
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

class SortSelector extends React.PureComponent {
    render() {
        return (
            <div className="result-display-sort-selector-container">
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

function sortChains(sortOption, repo) {
    const chains = repo.chains.slice();
    switch (sortOption) {
        case "confidence":
            return chains;
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
    const idx = repo.chains.indexOf(chain);
    const paperChoices = repo.paperChoicesForChain[idx];
    for (let i = 0; i < chain.length - 1; i++) {
        const documents = paperChoices[i];
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
    const idx = repo.chains.indexOf(chain);
    const paperChoices = repo.paperChoicesForChain[idx];
    for (let i = 0; i < chain.length - 1; i++) {
        const documents = paperChoices[i];
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
    const idx = repo.chains.indexOf(chain);
    const paperChoices = repo.paperChoicesForChain[idx];
    for (let i = 0; i < chain.length - 1; i++) {
        const documents = paperChoices[i];
        totalScore += Math.max(
            ...documents.map((data) => repo.docData[data[0]].read_count)
        );
    }
    return totalScore;
}

export default ResultDisplay;
export {sortChains};
