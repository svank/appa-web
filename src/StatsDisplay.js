import React, {useRef, useState} from 'react';
import {Button, Overlay, Popover} from "react-bootstrap";
import './StatsDisplay.css';

const StatsDisplay = React.memo(props => {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const authorSet = new Set();
    for (const chain of props.repo.chains) {
        for (const author of chain) {
            authorSet.add(author);
        }
    }
    
    const nDocuments = Object.keys(props.repo.docData).length;
    
    return (
        <div className="stats-display-container">
            <Button variant="link"
                    className="text-muted dropdown-toggle stat-display-button"
                    ref={target}
                    onClick={() => setShow(!show)}
            >
                Queried {props.stats.n_authors_queried} authors and checked {}
                {props.stats.n_docs_queried} documents {}
                in {props.stats.total_time.toFixed(2)} s {}
            </Button>
            <Overlay show={show}
                     target={target.current}
                     placement="bottom"
                     rootClose={true}
                     onHide={() => setShow(false)}
            >
                <Popover id="popover-positioned-bottom">
                    <Popover.Content>
                        Queried {props.stats.n_authors_queried} author
                        {props.stats.n_authors_queried === 1 ? '' : 's'} and {}
                        checked {props.stats.n_docs_queried} document
                        {props.stats.n_docs_queried === 1 ? '' : 's'}. {}
                        A total of {props.stats.n_authors_from_ads} author
                        {props.stats.n_authors_from_ads === 1 ? '' : 's'} {}
                        {props.stats.n_authors_from_ads === 1 ? 'was' : 'were'} {}
                        queried from ADS in {}
                        {props.stats.n_network_queries} quer
                        {props.stats.n_network_queries === 1 ? 'y' : 'ies'}, {}
                        which took {}
                        {props.stats.time_waiting_network.toFixed(2)} {}
                        of the {}
                        {props.stats.total_time.toFixed(2)} {}
                        seconds spent searching. (When possible, ADS query {}
                        results are re-used from past searches.) A total of {}
                        {props.stats.n_names_seen} (seemingly) unique name
                        {props.stats.n_names_seen === 1 ? '' : 's'} {}
                        {props.stats.n_names_seen === 1 ? 'was' : 'were'} {}
                        seen on author lists.
                        
                        <br /><br />
                        
                        A total of {nDocuments} paper
                        {nDocuments === 1 ? '' : 's'} {}
                        link{nDocuments === 1 ? 's' : ''} {}
                        {authorSet.size} author
                        {authorSet.size === 1 ? '' : 's'} in {}
                        {props.repo.chains.length} chain
                        {props.repo.chains.length === 1 ? '' : 's'} {}
                        of coauthorship connecting {}
                        {props.repo.originalSource} {}
                        and {props.repo.originalDest}
                        {props.repo.originalDest.endsWith('.') ? '' : '.'}
                    </Popover.Content>
                </Popover>
            </Overlay>
        </div>
    );
});

export default StatsDisplay