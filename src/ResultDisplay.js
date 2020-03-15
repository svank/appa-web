import React from 'react';
import {ChainTable, sortChains} from './ChainTable'
import ChainDetail from './ChainDetail'
import DistanceReport from "./DistanceReport";
import './ResultDisplay.css';


class ResultDisplay extends React.Component {
    constructor(props) {
        super(props);
        const chains = sortChains(this.props.chains,
                                  "alphabetical",
                                  this.props.repo);
        this.state = {chain: chains[0]};
        
        this.onChainSelected = this.onChainSelected.bind(this);
    }
    
    onChainSelected(chain) {
        this.setState({"chain": chain});
    }
    
    render() {
        const sourceName = this.props.chains[0][0];
        const destName = this.props.chains[0][this.props.chains[0].length - 1];
        return (
            <div className="ResultDisplay">
                <DistanceReport source={this.props.source}
                                dest={this.props.dest}
                                dist={this.props.chains[0].length - 1}
                />
                <ChainTable chains={this.props.chains}
                            onChainSelected={this.onChainSelected}
                            repo={this.props.repo}
                />
                <ChainDetail chain={this.state.chain}
                             repo={this.props.repo}
                             addExclusion={this.props.addExclusion}
                />
            </div>
        );
    }
}

export default ResultDisplay;
