import React, {useState} from 'react';
import {Alert, Button, Modal} from 'react-bootstrap';
import Octicon, {ChevronLeft} from "@primer/octicons-react";
import './Header.css';

function Header(props) {
    const [showAbout, setShowAbout] = useState(false);
    
    const handleCloseAbout = () => setShowAbout(false);
    const handleShowAbout = () => setShowAbout(true);
    
    return (
        <div className="Header">
            <div style={{textAlign: "left", paddingTop: "6px"}}>
                <a href="https://samvankooten.net">
                    <span style={{display: "flex", alignItems: "center"}}>
                    <Octicon icon={ChevronLeft} />
                    &nbsp;Home
                        </span>
                </a>
            </div>
            <h1 className="PageTitle">
                Astronomy Publication Proximity Analyzer
            </h1>
            <div style={{textAlign: "right"}}>
                <Button variant="link" onClick={handleShowAbout}>
                    About
                </Button>
            </div>
            
            <Modal show={showAbout} onHide={handleCloseAbout} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Astronomy Publication Proximity Analyzer
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Astronomy Publication Proximity Analyzer (APPA) is a {}
                    tool to search {}
                    <a target="_blank" rel="noopener noreferrer"
                       href="https://ui.adsabs.harvard.edu/">ADS</a> (via {}
                    the <a target="_blank" rel="noopener noreferrer"
                        href="http://adsabs.github.io/help/api/">API</a>) {}
                    and find the shortest chains of collaboration that link {}
                    two astronomers. It is inspired by the {}
                    <a target="_blank" rel="noopener noreferrer"
                        href="https://en.wikipedia.org/wiki/Erd%C5%91s_number">
                        Erdős number
                    </a>.
                    
                    <br /><br />
                    
                    APPA works by searching ADS' "astronomy" collection for {}
                    all published papers (not conference abstracts) {}
                    on which either name you enter is an author to determine {}
                    who those people have coauthored with. Then it searches {}
                    to find who those coauthors have coauthored with, and {}
                    continues iterating until it finds a link between these {}
                    growing webs of coauthorship. Once a complete {}
                    coauthorship chain is found, iteration continues until {}
                    all possible chains of that size are found.
                    
                    <br /><br />
                    
                    This process necessarily involves many {}
                    queries to ADS. Each query involves a database search {}
                    on ADS's side, plus a network round trip, and the total {}
                    time spent can add up quickly. When possible, APPA {}
                    reuses the results of ADS queries from past searches, {}
                    which speeds up searches significantly. Despite this, {}
                    you may still face highly variable and potentially very {}
                    long wait times while a search runs.
                    
                    <br /><br />
                    
                    <Alert variant="warning">
                        Because APPA re-uses the results from past ADS {}
                        queries, papers published within the last month may {}
                        not be included in a search.
                    </Alert>
                    
                    An important caveat in all this is that name {}
                    disambiguation is hard. If Jane and John Doe both {}
                    publish in astronomy, it isn't possible to determine who {}
                    wrote a paper published under the name "J. Doe" (barring {}
                    universal and retroactive ORCID ID adoption). APPA {}
                    follows my understanding of how ADS performs {}
                    <a target="_blank" rel="noopener noreferrer"
                       href="https://adsabs.github.io/help/search/search-syntax#author-searches">
                        name matching
                    </a>, which can be summarized as "names are considered {}
                    equal if they are consistent with each other". For {}
                    example, a search for "J. Doe" will match J., Jane and {}
                    John Doe, while a search for "Jane Doe" will match {}
                    Jane and J. Doe, but not John Doe.
                    
                    <br /><br />
                    
                    <Alert variant="warning">
                        Because of this name ambiguity, every {}
                        coauthorship chain <i>must</i> be verified before it {}
                        is believed. Once a search is complete, APPA offers {}
                        you tools to explore the proposed coauthorship {}
                        chains and remove false positives.
                    </Alert>
                    
                    <a href="stats.html" target="_blank">
                        View backend stats
                    </a>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Header;