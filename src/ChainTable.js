import React from 'react';
import Octicon, {ChevronRight} from "@primer/octicons-react";
import './ChainTable.css';

class ChainTable extends React.PureComponent {
    render() {
        return (
            <div className="chain-table-container">
                <table className="chain-table">
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
                    ? "chain-table-row chain-table-selected-row"
                    : "chain-table-row chain-table-unselected-row"}
                onClick={() => this.props.onClick(this.props.idx)}>
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
        let className = "chain-table-cell";
        if (this.props.hide)
            className += " chain-table-cell-hide";
        return (
            <td className={className}>
                <div className="chain-table-cell-contents">
                    {this.props.arrow
                        ? (
                            <Octicon icon={ChevronRight}
                                     className="chain-table-cell-arrow"
                            /> )
                        : null}
                    {this.props.name}
                </div>
            </td>
        )
    }
}

export default ChainTable