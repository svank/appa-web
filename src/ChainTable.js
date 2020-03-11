import React from 'react';
import './ChainTable.css';

class ChainTable extends React.Component {
    render() {
        const chains = [];
        for (let i = 0; i < this.props.chains.length; i++) {
            if (i === 0)
                chains.push([this.props.chains[i], null]);
            else
                chains.push([this.props.chains[i], this.props.chains[i - 1]])
        }
        return (
            <table className="ChainTable">
                <tbody>
                    {chains.map((chain) =>
                        <ChainTableRow
                            key={chain[0].toString()}
                            rowData={chain[0]}
                            prevRowData={chain[1]}
                            onClick={() => this.props.onChainSelected(chain[0])} />
                    )}
                </tbody>
            </table>
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
                                    hide={hideData[idx]}/>
                    
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