import React from 'react';
import {Dropdown, DropdownButton} from "react-bootstrap";
import './ChainTable.css';

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

class ChainTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {sortOption: "alphabetical"};
        this.onSortSelected = this.onSortSelected.bind(this);
    }
    
    onSortSelected(sortOption) {
        this.setState({sortOption: sortOption});
    }
    
    render() {
        let chains = sortChains(this.props.chains,
                                this.state.sortOption,
                                this.props.repo);
        const chainPairs = [];
        for (let i = 0; i < chains.length; i++) {
            if (i === 0)
                chainPairs.push([chains[i], null]);
            else
                chainPairs.push([chains[i], chains[i - 1]])
        }
        return (
            <div className="ChainTableContainer">
                <SortSelector onSortSelected={this.onSortSelected}
                              currentOption={this.state.sortOption}
                />
                <table className="ChainTable">
                    <tbody>
                    {chainPairs.map((chain) =>
                        <ChainTableRow
                            key={chain[0].toString()}
                            rowData={chain[0]}
                            prevRowData={chain[1]}
                            onClick={() => this.props.onChainSelected(chain[0])}
                        />
                    )}
                    </tbody>
                </table>
            </div>
        )
    }
}

class SortSelector extends React.Component {
    render() {
        return (
            <DropdownButton id="table-sort"
                            title="Sort table"
                            alignRight
                            size="sm"
                            className="ChainTableSortSelector"
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

class ChainTableRow extends React.Component {
    render() {
        const rowData = this.props.rowData;
        const prevRowData = this.props.prevRowData;
        let hideData = [];
        let forceDisplay = false;
        for (let i = 0; i < rowData.length; i++) {
            let hideCell = true;
            if (prevRowData === null
                || forceDisplay
                || prevRowData[i] !== rowData[i]) {
                hideCell = false;
                //forceDisplay = true;
            }
            hideData.push(hideCell);
        }
        return (
            <tr className="ChainTableRow" onClick={this.props.onClick}>
                {rowData.map((cellData, idx) =>
                    <ChainTableCell key={cellData}
                                    name={cellData}
                                    hide={hideData[idx]}
                    />
                )}
            </tr>
        )
    }
}

class ChainTableCell extends React.Component {
    render() {
        let className = "ChainTableCell";
        if (this.props.hide)
            className += " ChainTableCellHide";
        return (
            <td className={className}>
                {this.props.name}
            </td>
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
    console.log(totalScore);
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

export {ChainTable, sortChains}