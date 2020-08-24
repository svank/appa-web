import React, {useState} from 'react';
import {Button, Dropdown, Form, Overlay, Popover} from "react-bootstrap";
import DOMPurify from 'dompurify';
import NameSyntaxHelp from "./NameSyntaxHelp";
import './ChainDetail.css';

class ChainDetail extends React.PureComponent {
    constructor(props) {
        super(props);
        const selections = [];
        props.paperChoices.forEach(() => selections.push(0));
        this.state = {selections: selections};
        this.setSelection = this.setSelection.bind(this);
        this.addExclusion = this.addExclusion.bind(this);
    }
    
    setSelection(idx, selection) {
        const newSelections = this.state.selections.slice();
        newSelections[idx] = selection;
        this.setState({selections: newSelections});
    }
    
    addExclusion(exclusion) {
        // If an author is being axed, this chain is no longer valid, and this
        // ChainDetail will be destroyed and replaced, so we don't have to
        // worry about that. Here we just need to check if any DocumentParts
        // have the last document selected, and that document index is about
        // to become invalid.
        
        const newSelections = this.state.selections.map(
            (selection, idx) => {
                const choicesForLink = this.props.paperChoices[idx];
                if (selection < choicesForLink.length - 2)
                    return selection;
                // For this link, the last paper is selected.
                for (const choice of choicesForLink) {
                    if (choice[0] === exclusion)
                        // A paper is about to be removed from the choices list
                        return selection - 1;
                }
                // No papers will be removed here, so the current selection
                // remains valid.
                return selection;
            }
        );
        this.setState({selections: newSelections});
        
        this.props.addExclusion(exclusion);
    }
    
    render() {
        const items = this.props.paperChoices.map((pc, i) => 
            <ChainDetailItem paperChoices={pc}
                             documentNumber={this.state.selections[i]}
                             nextDocumentData={this.props.paperChoices[i+1]
                                 ? this.props.paperChoices[i+1]
                                    [this.state.selections[i+1]]
                                 : null}
                             setDocumentNumber={this.setSelection}
                             repo={this.props.repo}
                             key={i}
                             index={i}
                             addExclusion={this.props.addExclusion}
                             sortOption={this.props.sortOption}
            />
        )
        return (
            <div className="chain-detail">
                <div className="chain-detail-header text-muted">
                    To exclude false positives, hover over or tap a name {}
                    or paper to reveal an "exclude" button.
                </div>
                {items}
            </div>
        )
    }
}

class ChainDetailItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.setSelection = this.setSelection.bind(this);
    }
    
    setSelection(newSelection) {
        this.props.setDocumentNumber(this.props.index, parseInt(newSelection));
    }
    
    render() {
        const documents = findDocuments(this.props);
        const [bibcode, authorIdx, nextAuthorIdx] = documents[this.props.documentNumber];
        const document = findDocument(this.props, bibcode);
        const orcid = document.orcid_ids[nextAuthorIdx]
        const date = new Date(Date.parse(document.pubdate));
        let nextOrcid = null;
        if (this.props.nextDocumentData) {
            const nextDocument = findDocument(
                this.props, this.props.nextDocumentData[0]);
            nextOrcid = nextDocument.orcid_ids[this.props.nextDocumentData[1]];
        }
        
        return (
            <div className="chain-detail-item">
                <AuthorPart name={document.authors[authorIdx]}
                            affil={document.affils[authorIdx]}
                            addExclusion={this.props.addExclusion}
                />
                <div className="chain-detail-published">
                    published
                </div>
                <DocumentPart repo={this.props.repo}
                              documents={documents}
                              documentNumber={this.props.documentNumber}
                              onDocumentSelected={this.setSelection}
                              addExclusion={this.props.addExclusion}
                />
                <div className="chain-detail-publication-part">
                    in <JournalPart journal={document.publication} /> {}
                    in <DatePart date={date} /> <ADSPart bibcode={bibcode} />
                    <br />with
                </div>
                <AuthorPart name={document.authors[nextAuthorIdx]}
                            affil={document.affils[nextAuthorIdx]}
                            addExclusion={this.props.addExclusion}
                />
                <ArrowPart orcid={orcid}
                           nextOrcid={nextOrcid}
                />
            </div>
        )
    }
}

class ExcludeButtonPart extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {showPopup: false, forceShowX: false};
    }
    
    render() {
        const className = this.state.forceShowX
            ? "chain-detail-exclude-button-container chain-detail-exclude-button-container-force"
            : "chain-detail-exclude-button-container";
        return (
            <div className={className}>
                <Button variant="link"
                        onClick={() =>
                            this.setState({showPopup: !this.state.showPopup})}
                        ref={(button) => 
                            this.target = button}
                        className="chain-detail-exclude-button"
                >
                    ×
                </Button>
                <Overlay show={this.state.showPopup}
                         target={this.target}
                         placement="bottom"
                         rootClose={true}
                         onHide={() => this.setState({showPopup: false})}
                         onEnter={() => this.setState({forceShowX: true})}
                         onExited={() => this.setState({forceShowX: false})}
                >
                    <Popover id="popover-positioned-bottom">
                        <Popover.Content>
                            <ExcludeConfirmation
                                exclusion={this.props.exclusion}
                                addExclusion={this.props.addExclusion}
                                onHide={() =>
                                    this.setState({showPopup: false})}
                            />
                        </Popover.Content>
                    </Popover>
                </Overlay>
            </div>
        );
    }
}

function ExcludeConfirmation(props) {
    const [exclusion, setExclusion] = useState(props.exclusion);
    return (
        <Form className="exclusion-confirmation"
              onSubmit={(event) => {
                  event.preventDefault();
                  props.addExclusion(exclusion);
                  props.onHide();
              }}
        >
            <Form.Group controlId="exclusionConfirmation" style={{margin: 0}}>
                Exclude all chains involving
                <Form.Control className="exclusion-confirmation-input"
                              type="text"
                              value={exclusion}
                              onChange={
                                  (event) => setExclusion(event.target.value)
                              }
                />
            </Form.Group>
            
            <div className="exclusion-confirmation-button-row">
                <Button type="submit" variant="primary">Confirm</Button>
                <Button variant="secondary"
                        onClick={props.onHide}
                >
                    Cancel
                </Button>
            </div>
            
            {props.exclusion.charAt(0) === "="
                ? <NameSyntaxHelp /> : null}
        </Form>
    )
}

const DatePart = React.memo(props => {
    const month = props.date.getUTCMonth();
    const year = props.date.getUTCFullYear();
    return (
        <span>
            {month_list[month]} of {year}
        </span>
    );
});

const JournalPart = React.memo(props => {
    return (
        <span className="chain-detail-journal-part">
            {props.journal}
        </span>
    )
});

class AuthorPart extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {wrapped: true};
        this.toggleExpandAffil = this.toggleExpandAffil.bind(this);
    }
    
    toggleExpandAffil() {
        this.setState(state => ({
            wrapped: !state.wrapped
        }));
    }
    
    render() {
        let affil = this.props.affil;
        
        // Attempt to detect the start of an address included in the affil,
        // and have word-wrapping happen there. If no address is found,
        // look for a zip code
        if (this.state.wrapped) {
            let n = affil.search(/, \d/i);
            if (n === -1)
                n = affil.search(/ \d{5},/i)
            if (n >= 0)
                affil = affil.slice(0, n) + "\u2026";
        }
        
        const textClassName = this.state.wrapped
            ? "chain-detail-affil chain-detail-affil-wrapped"
            : "chain-detail-affil chain-detail-affil-unwrapped";
        const containerClassName = this.state.wrapped
            ? "chain-detail-affil-container-wrapped"
            : "chain-detail-affil-container-unwrapped";
        return (
            <div className="chain-detail-author-part">
                <ExcludeButtonPart exclusion={'=' + this.props.name}
                                   addExclusion={this.props.addExclusion}
                />
                <div className="chain-detail-author-part-name">
                    {this.props.name}
                </div>
                <div className={containerClassName}
                     title={this.props.affil}
                >
                    <span className={textClassName}>(</span>
                    <span className={textClassName}
                          onClick={this.toggleExpandAffil}
                    >
                        {this.props.affil === ""
                            ? <i>No affiliation given</i>
                            : affil}
                    </span>
                    <span className={textClassName}>)</span>
                </div>
            </div>
        )
    }
}

const DocumentPart = React.memo(props => {
    const bibcode = props.documents[props.documentNumber][0];
    const document = findDocument(props, bibcode);
    if (props.documents.length <= 1)
        // We don't _need_ to use a Button when there's only one document,
        // but using the same element we use when there are multiple
        // documents ensures everything lines up exactly the same.
        return (
            <div className="chain-detail-document-part">
                <ExcludeButtonPart exclusion={bibcode}
                                   addExclusion={props.addExclusion}
                />
                <Button size="lg"
                        disabled
                        className="chain-detail-single-doc-button chain-detail-doc-button"
                        variant="link"
                >
                    {displayDocumentTitle(document.title)}
                </Button>
            </div>
        );
    else
        return (
            <div className="chain-detail-document-part">
                <ExcludeButtonPart exclusion={bibcode}
                                   addExclusion={props.addExclusion}
                />
                <Dropdown>
                    <Dropdown.Toggle className="chain-detail-doc-button"
                                     size="lg"
                                     variant="link"
                    >
                        {displayDocumentTitle(document.title)}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {props.documents.map((data, idx) =>
                            <Dropdown.Item key={data[0]}
                                           eventKey={idx.toString()}
                                           onSelect={props.onDocumentSelected}
                                           active={data[0] === bibcode}
                                           size="lg"
                            >
                                {displayDocumentTitle(
                                    findDocument(props, data[0]).title)}
                            </Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        )
});

function displayDocumentTitle(title) {
    return <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(title)}}/>
}

const ADSPart = React.memo(props => {
    const url = "https://ui.adsabs.harvard.edu/abs/" + props.bibcode + "/abstract";
    return (
        <a href={url}
           target="_blank"
           rel="noopener noreferrer"
           className="chain-detail-ADS-part"
        >
            [ADS]
        </a>
    );
});

const ArrowPart = React.memo(props => {
    let imgClass = "chain-detail-arrow";
    let orcidIcon = null;
    if (props.orcid === props.nextOrcid
            && props.orcid !== ''
            && props.nextOrcid !== null) {
        imgClass += " chain-detail-arrow-with-orcid";
        orcidIcon = (
            <a href={"https://orcid.org/" + props.orcid}
               target="_blank"
               rel="noopener noreferrer"
               className="ORCID-Icon"
            > 
                <img src="orcid_16x16.gif"
                     title="Link confirmed via ORCID ID"
                     alt="Link confirmed via ORCID ID"
                />
            </a>
        );
    }
    return (
        <div className="chain-detail-arrow-container">
            <img src="arrow.png"
                 className={imgClass}
                 alt="The next link in the chain is..."
            />
            {orcidIcon}
        </div>
    )
});

function findDocuments(props, sort = true) {
    let documents = props.paperChoices.slice();
    if (sort)
        documents = sortDocuments(documents, props.sortOption, props.repo);
    return documents;
}

function findDocument(props, bibcode) {
    let repo = props;
    if ('repo' in props)
        repo = props.repo;
    
    return repo.docData[bibcode];
}

function sortDocuments(documents, sortOption, repo) {
    switch (sortOption) {
        case "confidence":
            return documents;
        case "alphabetical":
            return documents.sort((doc1, doc2) =>
                compareDocumentsAlphabetically(doc1, doc2, repo));
        case "author_order":
            return documents.sort(compareDocumentsAuthorOrder);
        case "citation_count":
            return documents.sort((doc1, doc2) =>
                compareDocumentsCitationCount(doc1, doc2, repo));
        case "read_count":
            return documents.sort((doc1, doc2) =>
                compareDocumentsReadCount(doc1, doc2, repo));
        default:
            return documents;
    }
}

function compareDocumentsAlphabetically(docData1, docData2, repo) {
    const doc1 = findDocument(repo, docData1[0]);
    const doc2 = findDocument(repo, docData2[0]);
    if (doc1.title < doc2.title)
        return -1;
    if (doc1.title > doc2.title)
        return 1;
    return 0;
}

function compareDocumentsAuthorOrder(docData1, docData2) {
    return (docData1[1] + docData1[2]) - (docData2[1] + docData2[2])
}

function compareDocumentsCitationCount(docData1, docData2, repo) {
    const doc1 = findDocument(repo, docData1[0]);
    const doc2 = findDocument(repo, docData2[0]);
    return doc2.citation_count - doc1.citation_count;
}

function compareDocumentsReadCount(docData1, docData2, repo) {
    const doc1 = findDocument(repo, docData1[0]);
    const doc2 = findDocument(repo, docData2[0]);
    return doc2.read_count - doc1.read_count;
}

const month_list = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

export default ChainDetail