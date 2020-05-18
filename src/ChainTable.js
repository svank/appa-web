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
        return (
            <tr className={this.props.selected
                    ? "chain-table-row chain-table-selected-row"
                    : "chain-table-row chain-table-unselected-row"}
                onClick={() => this.props.onClick(this.props.idx)}>
                {rowData.map((rowDatum, idx) =>
                    <ChainTableCell key={rowDatum}
                                    name={rowDatum}
                                    arrow={idx !== 0}
                    />
                )}
            </tr>
        )
    }
}

class ChainTableCell extends React.PureComponent {
    render() {
        return (
            <td className="chain-table-cell">
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