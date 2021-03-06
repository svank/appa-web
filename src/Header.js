import React from 'react';
import {Alert, Button, Modal} from 'react-bootstrap';
import {ChevronLeftIcon} from "@primer/octicons-react";
import {NameMatchingHelp} from "./NameMatchingHelp";
import './Header.css';

class Header extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {show: false};
        this.handleCloseAbout = this.handleCloseAbout.bind(this);
        this.handleShowAbout = this.handleShowAbout.bind(this);
        this.hashListener = this.hashListener.bind(this);
    }
    
    handleCloseAbout() {
        if (this.can_use_history_back) {
            window.history.back();
            this.can_use_history_back = false;
        } else
            window.location.hash = "";
    }
    
    handleShowAbout() {
        window.location.hash = "about";
        this.can_use_history_back = true;
    };
    
    componentDidMount() {
        this.listener = window.addEventListener(
            'hashchange', this.hashListener);
        this.hashListener();
        this.can_use_history_back = false;
    }
    
    componentWillUnmount() {
        window.removeEventListener('hashchange', this.listener);
        this.listener = null;
    }
    
    hashListener() {
        if (window.location.hash === "#about")
            this.setState({show: true});
        else {
            this.setState({show: false});
            this.can_use_history_back = false;
        }
    }
    
    render() {
        return (
            <div className="header">
                <div style={{textAlign: "left", paddingTop: "6px"}}
                     className="header-link-home"
                >
                    <a href="https://samvankooten.net">
                    <span style={{display: "none", alignItems: "center"}}>
                    <ChevronLeftIcon />
                        &nbsp;Home
                        </span>
                    </a>
                </div>
                <h1 className="page-title">
                    Astronomy Publication Proximity Analyzer
                </h1>
                <div style={{textAlign: "right"}}
                     className="header-link-about"
                >
                    <Button variant="link" onClick={this.handleShowAbout}>
                        About
                    </Button>
                </div>
            
                <Modal show={this.state.show}
                       onHide={this.handleCloseAbout}
                       size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Astronomy Publication Proximity Analyzer
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AboutContents />
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

const AboutContents = React.memo(() => {
    return (
        <div>
            <div style={{
                textAlign: "right",
                marginBottom: "12px",
            }}>
                <a href="https://github.com/svank/appa-web"
                   target="_blank"
                   rel="noopener noreferrer"
               >
                    View on GitHub
                </a>
                &nbsp; | &nbsp;
                <a href="stats.html" target="_blank">
                    View backend stats
                </a>
           </div>
            
            Astronomy Publication Proximity Analyzer (APPA) is a {}
            tool to search {}
            <a target="_blank" rel="noopener noreferrer"
               href="https://ui.adsabs.harvard.edu/">ADS</a> (via {}
            their <a target="_blank" rel="noopener noreferrer"
                href="http://adsabs.github.io/help/api/">API</a>) {}
            to find the shortest chains of collaboration that link {}
            two astronomers. It is inspired by the {}
            <a target="_blank" rel="noopener noreferrer"
                href="https://en.wikipedia.org/wiki/Erd%C5%91s_number">
                Erdős number
            </a> and was created by {}
            {/*eslint-disable-next-line*/}
            <a target="_blank" href="https://samvankooten.net">
                Sam Van Kooten
            </a>.
            
            <br /><br />
            
            APPA works by searching ADS' &ldquo;astronomy&rdquo; {}
            collection for {}
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
            on ADS's side plus a network round trip from the APPA {}
            server to ADS, and the total {}
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
            
            <NameMatchingHelp />
        </div>
    );
})

export default Header;