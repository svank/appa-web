import React from 'react';
import './LoadingDisplay.css'

class LoadingDisplay extends React.Component {
    render() {
        let content;
        if (this.props.data === null)
            content = <div />;
        else {
            const nAuths = this.props.data.n_authors_queried;
            const authsNoun = nAuths === 1 ? "author" : "authors";
            const nDocs = this.props.data.n_docs_loaded;
            const docsNoun = nDocs === 1 ? "paper" : "papers";
            const nADS = this.props.data.n_ads_queries;
            const adsNoun = nADS === 1 ? "query" : "queries";
            content = (
                <div className="LoadStatus">
                    <div className="LoadStatusSubtitle">
                        Progress:
                    </div>
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
            );
        }
        return (
            <div className="LoadingDisplay">
                <div className="LoadingTitle">Loading...</div>
                {content}
            </div>
        )
    }
}

export default LoadingDisplay