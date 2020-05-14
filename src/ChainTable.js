import React from 'react';
import Octicon, {ChevronRight} from "@primer/octicons-react";
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
                    {chainPairs.map((chainPair, idx) =>
                        <ChainTableRow
                            key={chainPair[0].toString()}
                            rowData={chainPair[0]}
                            prevRowData={chainPair[1]}
                            selected={idx===this.props.selectedChainIdx}
                            onClick={() => this.props.onChainSelected(idx)}
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
        for (let i = 0; i < rowData.length; i++) {
            let hideCell = true;
            if (prevRowData === null
                    || prevRowData[i] !== rowData[i]) {
                hideCell = false;
            }
            hideData.push(hideCell);
        }
        const cells = [];
        for (let i=0; i<rowData.length; i++) {
            cells.push(
                <ChainTableCell key={rowData[i]}
                                name={rowData[i]}
                                hide={hideData[i]}
                />
            );
            if (i !== rowData.length - 1)
                cells.push(
                    <td className="ChainTableCell"
                        key={"div" + i}
                    >
                        <div className="ChainTableCellArrow">
                            <Octicon icon={ChevronRight} />
                        </div>
                    </td>
                );
        }
        return (
            <tr className={this.props.selected
                    ? "ChainTableRow ChainTableSelectedRow"
                    : "ChainTableRow ChainTableUnselectedRow"}
                onClick={this.props.onClick}>
                {cells}
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