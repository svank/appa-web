import React from 'react';
import './LoadingDisplay.css'
import ConstellationSketcher, {categories} from 'react-constellation-sketcher'

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
            content = <div className={"LoadStatus"}>
                <div className="LoadStatusSubtitle">&nbsp;</div>
                <div><div className="LoadStatusPiece">&nbsp;</div></div>
                <div><div className="LoadStatusPiece">&nbsp;</div></div>
            </div>;
        else {
            const nAuths = this.props.data.n_authors_queried;
            const authsNoun = nAuths === 1 ? "author" : "authors";
            const nDocs = this.props.data.n_docs_queried;
            const docsNoun = nDocs === 1 ? "paper" : "papers";
            const nADS = this.props.data.n_ads_queries;
            const adsNoun = nADS === 1 ? "query" : "queries";
            content = (
                <div className="LoadStatus text-muted">
                    <div className="LoadStatusSubtitle">
                        Progress:
                    </div>
                    <div>
                        <div className="LoadStatusPiece">
                            {nAuths} {authsNoun} loaded
                        </div>
                        <div className="LoadStatusPiece">
                            {nDocs} {docsNoun} checked
                        </div>
                        <div className="LoadStatusPiece">
                            {nADS} ADS {adsNoun} completed
                        </div>
                    </div>
                    <div>
                        <div className="LoadStatusPiece">
                            {this.props.data.path_finding_complete 
                                 ? "Search complete; collecting & ranking results"
                                 : <span>&nbsp;</span>}
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="LoadingDisplay">
                <div className="LoadingTitle">Finding Connections...</div>
                <ConstellationSketcher width={500}
                                       height={500}
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
                                       style={{
                                           margin: "15px",
                                           borderRadius: "10px",
                                       }}
                                       drawFrameCompleteCallback={
                                           (ctx, redrew, constellation) => {
                                               if (!redrew)
                                                   return;
                                               ctx.font = "11pt Arial";
                                               ctx.fillStyle = "rgb(170,152,130)";
                                               ctx.fillText(constellation, 6, 492);
                                           }
                                       }
                />
                {content}
            </div>
        )
    }
}

export default LoadingDisplay