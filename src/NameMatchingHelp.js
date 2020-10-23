import React from 'react';
import {Alert, Button, Modal} from 'react-bootstrap';
import NameSyntaxHelp from "./NameSyntaxHelp";

const NameMatchingHelp = React.memo(() => {
    return (
        <div>
            An important caveat in APPA's work is that name {}
            disambiguation is hard. If Jane Doe and John Doe both {}
            publish in astronomy, it isn't possible to (automatically) {}
            determine who {}
            wrote a paper published under the name &ldquo;J. Doe&rdquo;. {}
            APPA follows how ADS performs {}
            <a target="_blank" rel="noopener noreferrer"
               href="https://adsabs.github.io/help/search/search-syntax#author-searches">
                name matching
            </a>, which can be summarized as &ldquo;names are considered {}
            equal if they are consistent with each other&rdquo;. For example {}
            a search for &ldquo;J. Doe&rdquo; will include papers by J., Jane and {}
            John Doe, while a search for &ldquo;Jane Doe&rdquo; will match {}
            Jane and J. Doe, but not John Doe. This is normally the best {}
            thing to do, but it means a chain like &ldquo;person A published {}
            with J. Doe, and Jane Doe published with person C&rdquo; can have some {}
            uncertainty. APPA will do its best to sort your search results {}
            by how confident it is about the name-matching in each chain {}
            (using ORCID IDs when possible, or else name level-of-detail and {}
            fuzzy affiliation-matching), but it can only do so much.
            
            <br /><br />
            
            Additionally, if one person has published under two different names {}
            or two different spellings of a name, there may be chains that {}
            cannot be found due to this variation, and so there may be more {}
            or closer connections than APPA is able to find. APPA is able to {}
            use ADS' hand-curated list of name synonyms to handle some, but {}
            not all, of these name variations.
            
            <br /><br />
            
            <Alert variant="warning">
                Because of these factors, every {}
                coauthorship chain <i>must</i> be verified before it {}
                is believed, and APPA cannot promise it will find the {}
                most direct connection between authors. Once a search {}
                is complete, APPA offers {}
                you tools to explore the proposed coauthorship {}
                chains and remove false positives. APPA also lets you {}
                restrict name-matching with =, &lt;, and &gt; modifiers.
            </Alert>
            <NameSyntaxHelp label="More about name syntax &amp; filtering"/>
        </div>
    )
})

class NameMatchingDialogButton extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
        }
        this.handleCloseDialog = this.handleCloseDialog.bind(this);
        this.handleShowDialog = this.handleShowDialog.bind(this);
        this.hashListener = this.hashListener.bind(this);
    }
    
    handleCloseDialog() {
        if (this.can_use_history_back) {
            window.history.back();
            this.can_use_history_back = false;
        } else
            window.location.hash = "";
    }
    
    handleShowDialog() {
        window.location.hash = "name-matching";
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
        if (window.location.hash === "#name-matching")
            this.setState({show: true});
        else {
            this.setState({show: false});
            this.can_use_history_back = false;
        }
    }
    
    render() {
        const Aux = props => props.children;
        return (
            <Aux>
                <Button variant="link"
                        onClick={this.handleShowDialog}
                        style={{
                            padding: "0px",
                            borderTop: "0px",
                        }}
                >
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
            </Aux>
        )
    }
}

export {NameMatchingHelp, NameMatchingDialogButton}