import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';
import './Header.css';

function Header(props) {
    const [showAbout, setShowAbout] = useState(false);
    
    const handleCloseAbout = () => setShowAbout(false);
    const handleShowAbout = () => setShowAbout(true);
    
    return (
        <div className="Header">
            <div><a href="https://samvankooten.net">
                <span className="LeftArrow" /> Home</a></div>
            <div className="PageTitle">Astronomy Publication Proximity
                Analyzer
            </div>
            <div><Button variant="link" onClick={handleShowAbout}>About</Button></div>
            
            <Modal show={showAbout} onHide={handleCloseAbout} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Astronomy Publication Proximity Analyzer
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Astronomy Publication Proximity Analyzer (APPA) is a tool {}
                    to search {}
                    <a href="https://ui.adsabs.harvard.edu/">ADS</a> {}
                    and find the shortest chains of collaboration that link {}
                    two astronomers (inspired by the {}
                    <a href="https://en.wikipedia.org/wiki/Erd%C5%91s_number">
                        Erdős number
                    </a>).
                    
                    <br /><br />
                    
                    APPA works by searching ADS for all published papers {}
                    on which either name you enter is an author to determine {}
                    who those people have coauthored with. Then it searches {}
                    to find who those coauthors have coauthored with, and {}
                    continues iterating until it finds a link between these {}
                    growing webs of coauthorship. Once a complete {}
                    coauthorship chain is found, iteration continues until {}
                    all possible chains of that size are found.
                    
                    <br /><br />
                    
                    This process necessarily involves a substantive number {}
                    of queries to ADS. Each query involves a database search {}
                    on ADS's side, plus a network round trip, and the total {}
                    time spent can add up quickly. I've done all I can to {}
                    speed up computation, including caching of past ADS {}
                    query results for use in future searches, but you still {}
                    may notice variable and potentially long search times.
                    
                    <br /><br />
                    
                    An important caveat is that name disambiguation is hard. {}
                    If Jane and John Doe both publish in astronomy, it isn't {}
                    possible to determine who wrote a paper under the name {}
                    "J. Doe" (barring universal and retroactive ORCID ID {}
                    adoption). APPA follows how ADS appears to perform {}
                    <a href="https://adsabs.github.io/help/search/search-syntax#author-searches">
                        name matching
                    </a>, which can be summarized as "names are considered {}
                    to match if they are consistent with each other". For {}
                    example, a search for "J. Doe" will match J., Jane and {}
                    John Doe, while a search for "Jane Doe" will match {}
                    Jane and J. Doe, but not John Doe. APPA offers you some {}
                    tools to set specificity limits and remove false {}
                    positives, but every coauthorship chain <i>must</i> be {}
                    verified before it is believed.
                </Modal.Body>
            </Modal>
        </div>
        
    );
}

export default Header;