import React from 'react';
import Octicon, {ChevronRight} from "@primer/octicons-react";
import './ChainTable.css';

class ChainTable extends React.PureComponent {
    render() {
        return (
            <div className="ChainTableContainer">
                <table className="ChainTable">
                    <tbody>
                    {this.props.chains.map((chain, idx) =>
                        <ChainTableRow
                            key={chain}
                            rowData={chain}
                            prevRowData={idx > 0 ? this.props.chains[idx - 1] : null}
                            selected={idx === this.props.selectedChainIdx}
                            idx={idx}
                            onClick={this.props.onChainSelected}
                        />
                    )}
                    </tbody>
                </table>
            </div>
        )
    }
}

class ChainTableRow extends React.PureComponent {
    render() {
        const rowData = this.props.rowData;
        const prevRowData = this.props.prevRowData;
        const hideData = rowData.map((rd, i) =>
            prevRowData !== null && prevRowData[i] === rowData[i]
        );
        return (
            <tr className={this.props.selected
                    ? "ChainTableRow ChainTableSelectedRow"
                    : "ChainTableRow ChainTableUnselectedRow"}
                onClick={this.props.onClick}>
                {rowData.map((rowDatum, idx) =>
                    <ChainTableCell key={rowDatum}
                                    name={rowDatum}
                                    hide={hideData[idx]}
                                    arrow={idx !== 0}
                    />
                )}
            </tr>
        )
    }
}

class ChainTableCell extends React.PureComponent {
    render() {
        let className = "ChainTableCell";
        if (this.props.hide)
            className += " ChainTableCellHide";
        return (
            <td className={className}>
                <div className="ChainTableCellContents">
                    {this.props.arrow
                        ? (
                            <Octicon icon={ChevronRight}
                                     className="ChainTableCellArrow"
                            /> )
                        : null}
                    {this.props.name}
                </div>
            </td>
        )
    }
}

export default ChainTable