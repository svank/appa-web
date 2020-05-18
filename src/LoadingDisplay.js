import React from 'react';
import './LoadingDisplay.css';
import ConstellationSketcher, {categories} from 'react-constellation-sketcher';

class LoadingDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.startingConst = categories.popular[
            Math.floor(Math.random() * categories.popular.length)];
    }
    render() {
        let content;
        if (this.props.data === null
            || this.props.data.isDummy)
            content = [
                <div key="fillerRow1">
                    <div className="loading-status-piece">Connecting to server...</div>
                </div>,
                <div key="fillerRow2">
                    <div className="loading-status-piece">&nbsp;</div>
                </div>
            ];
        else {
            const nAuths = this.props.data.n_authors_queried;
            const authsNoun = nAuths === 1 ? "author" : "authors";
            const nDocs = this.props.data.n_docs_queried;
            const docsNoun = nDocs === 1 ? "paper" : "papers";
            const nADS = this.props.data.n_ads_queries;
            const adsNoun = nADS === 1 ? "query" : "queries";
            content = [
                <div key="row1">
                    <div className="loading-status-piece">
                        {nAuths} {authsNoun} loaded
                    </div>
                    <div className="loading-status-piece">
                        {nDocs} {docsNoun} checked
                    </div>
                    <div className="loading-status-piece">
                        {nADS} ADS {adsNoun} completed
                    </div>
                </div>,
                <div key="row2">
                    <div className="loading-status-piece">
                        {this.props.data.path_finding_complete 
                             ? "Search complete; collecting & ranking results:"
                             : <span>&nbsp;</span>}
                    </div>
                    <div className="loading-status-piece">
                        {this.props.data.path_finding_complete
                            ? `${this.props.data.n_docs_loaded} / ${this.props.data.n_docs_relevant}`
                            : <span>&nbsp;</span>
                        }
                    </div>
                </div>
            ];
        }
        
        const minSize = Math.min(window.innerHeight, window.innerWidth);
        const canvasSize = Math.min(minSize-20, 480);
        
        return (
            <div className="loading-display">
                <div className="loading-title">Finding Connections...</div>
                <ConstellationSketcher width={canvasSize}
                                       height={canvasSize}
                                       slideshow={true}
                                       speedScale={1.2}
                                       slideshowDwellTime={2250}
                                       sizeScale={1.1}
                                       constellation={this.startingConst}
                                       weights={{
                                           popular: 20,
                                           striking: 40,
                                           medium: 8,
                                           small: 1,
                                       }}
                                       className="loading-constellations"
                                       drawFrameCompleteCallback={
                                           (ctx, redrew, constellation) => {
                                               if (!redrew)
                                                   return;
                                               ctx.font = "11pt Arial";
                                               ctx.fillStyle = "rgb(170,152,130)";
                                               ctx.fillText(constellation, 6, canvasSize - 8);
                                           }
                                       }
                />
                <div className="text-muted">
                    <div>
                        Progress:
                    </div>
                    {content}
                </div>
            </div>
        )
    }
}

export default LoadingDisplay