import React from 'react';
import {Alert, Button, Modal} from 'react-bootstrap';

const NameMatchingHelp = React.memo(() => {
    return (
        <div>
            An important caveat in APPA's work is that name {}
            disambiguation is hard. If Jane and John Doe both {}
            publish in astronomy, it isn't possible to determine who {}
            wrote a paper published under the name &ldquo;J. Doe&rdquo;. {}
            Additionally, APPA follows how ADS performs {}
            <a target="_blank" rel="noopener noreferrer"
               href="https://adsabs.github.io/help/search/search-syntax#author-searches">
                name matching
            </a>, which can be summarized as &ldquo;names are considered {}
            equal if they are consistent with each other&rdquo;. For example {}
            a search for &ldquo;J. Doe&rdquo; will match J., Jane and {}
            John Doe, while a search for &ldquo;Jane Doe&rdquo; will match {}
            Jane and J. Doe, but not John Doe. This is normally the best {}
            thing to do, but it means a chain like &ldquo;person A published {}
            with J. Doe, and Jane Doe published with person C&rdquo; can be {}
            questionable. APPA will do its best to sort your search results {}
            by how confident it is about the name-matching in each chain {}
            (using ORCID IDs when possible, or else name specificity and {}
            fuzzy affiliation-matching), but it can only do so much.
            
            <br /><br />
            
            <Alert variant="warning">
                Because of this name ambiguity, every {}
                coauthorship chain <i>must</i> be verified before it {}
                is believed. Once a search is complete, APPA offers {}
                you tools to explore the proposed coauthorship {}
                chains and remove false positives. APPA also lets you {}
                restrict name-matching for the names you enter.
            </Alert>
        </div>
    )
})

class NameMatchingDialogButton extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
        }
    }
    
    handleCloseDialog() {
        window.history.back();
    }
    
    handleShowDialog() {
        window.location.hash = "name-matching";
    };
    
    componentDidMount() {
        this.listener = window.addEventListener('hashchange', (e) => {
            if (this.state.show && window.location.hash !== "#name-matching") {
                this.setState({show: false});
            } else if (!this.state.show && window.location.hash === "#name-matching") {
                this.setState({show: true});
            }
        });
    }
    
    render() {
        return (
            <div>
                <Button variant="link" onClick={this.handleShowDialog}>
                    {this.props.children}
                </Button>
            
                <Modal show={this.state.show}
                       onHide={this.handleCloseDialog}
                       size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Name Matching
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <NameMatchingHelp />
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export {NameMatchingHelp, NameMatchingDialogButton}