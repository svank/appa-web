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
                        Queried {props.stats.n_authors_queried} authors and {}
                        checked {props.stats.n_docs_queried} documents. {}
                        A total of {props.stats.n_authors_from_ads} authors {}
                        were queried from ADS in {}
                        {props.stats.n_network_queries} queries, which took {}
                        {props.stats.time_waiting_network.toFixed(2)} {}
                        of the {}
                        {props.stats.total_time.toFixed(2)} {}
                        seconds spent searching. (When possible, ADS query {}
                        results are re-used from past searches.) A total of {}
                        {props.stats.n_names_seen} (seemingly) unique names {}
                        were seen on author lists.
                        <br /><br />
                        A total of {Object.keys(props.repo.docData).length} {}
                        papers link {authorSet.size} authors in {}
                        {props.repo.chains.length} chains of coauthorship {}
                        connecting {props.repo.originalSource} {}
                        and {props.repo.originalDest}.
                    </Popover.Content>
                </Popover>
            </Overlay>
        </div>
    );
});

export default StatsDisplay