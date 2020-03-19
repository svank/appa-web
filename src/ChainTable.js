import React from 'react';
import './ChainTable.css';

class ChainTable extends React.Component {
    
    render() {
        const chainPairs = [];
        for (let i = 0; i < this.props.chains.length; i++) {
            if (i === 0)
                chainPairs.push([this.props.chains[i], null]);
            else
                chainPairs.push([this.props.chains[i], this.props.chains[i - 1]])
        }
        return (
            <div className="ChainTableContainer">
                <table className="ChainTable">
                    <tbody>
                    {chainPairs.map((chainPair) =>
                        <ChainTableRow
                            key={chainPair[0].toString()}
                            rowData={chainPair[0]}
                            prevRowData={chainPair[1]}
                            selected={chainPair[0]===this.props.selectedChain}
                            onClick={() => this.props.onChainSelected(chainPair[0])}
                        />
                    )}
                    </tbody>
                </table>
            </div>
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
            <tr className={this.props.selected
                    ? "ChainTableRow ChainTableSelectedRow"
                    : "ChainTableRow ChainTableUnselectedRow"}
                onClick={this.props.onClick}>
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

export default ChainTable