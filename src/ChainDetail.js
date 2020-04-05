import React, {useState} from 'react';
import {Button, Dropdown, Form, Overlay, Popover} from "react-bootstrap";
import NameSyntaxHelp from "./NameSyntaxHelp";
import './ChainDetail.css';

class ChainDetail extends React.Component {
    render() {
        const items = [];
        let chain = this.props.chain;
        if (chain.length === 1)
            chain = [chain[0], chain[0]];
        for (let i = 0; i < chain.length - 1; i++) {
            items.push(
                <ChainDetailItem author={chain[i]}
                                 nextAuthor={chain[i + 1]}
                                 repo={this.props.repo}
                                 key={chain[i] + chain[i + 1]}
                                 addExclusion={this.props.addExclusion}
                                 sortOption={this.props.sortOption}
                />)
        }
        return (
            <div className="ChainDetail">
                <div className="ChainDetailHeader text-muted">
                    To exclude false positives, hover over a name {}
                    or paper to reveal an "exclude" button.
                </div>
                {items}
            </div>
        )
    }
}

class ChainDetailItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {documentNumber: 0};
        this.setDocumentNumber = this.setDocumentNumber.bind(this);
    }
    
    setDocumentNumber(documentNumber) {
        this.setState({documentNumber: documentNumber});
    }
    
    static getDerivedStateFromProps(props, state) {
        const documents = findDocuments(props, false);
        if (state.documentNumber >= documents.length)
            return {documentNumber: documents.length - 1};
        return null;
    }
    
    render() {
        const documents = findDocuments(this.props);
        const [bibcode, authorIdx, nextAuthorIdx] = documents[this.state.documentNumber];
        const document = findDocument(this.props, bibcode);
        const date = new Date(Date.parse(document.pubdate));
        
        return (
            <div className="ChainDetailItem">
                <AuthorPart name={document.authors[authorIdx]}
                            affil={document.affils[authorIdx]}
                            addExclusion={this.props.addExclusion}
                />
                published
                <DocumentPart repo={this.props.repo}
                              author={this.props.author}
                              documents={documents}
                              documentNumber={this.state.documentNumber}
                              onDocumentSelected={this.setDocumentNumber}
                              addExclusion={this.props.addExclusion}
                />
                in <JournalPart journal={document.publication} /> {}
                in <DatePart date={date} /> <ADSPart bibcode={bibcode} />
                <br />with
                <AuthorPart name={document.authors[nextAuthorIdx]}
                            affil={document.affils[nextAuthorIdx]}
                            addExclusion={this.props.addExclusion}
                />
                <ArrowPart />
            </div>
        )
    }
}

class ExcludeButtonPart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {showPopup: false, forceShowX: false};
    }
    
    render() {
        const className = this.state.forceShowX
            ? "ChainDetailExcludeButtonPart ChainDetailExcludeButtonPartForce"
            : "ChainDetailExcludeButtonPart";
        return (
            <div className={className}>
                <Button variant="link"
                        onClick={() =>
                            this.setState({showPopup: !this.state.showPopup})}
                        ref={(button) => 
                            this.target = button}
                        className="ChainDetailExcludeButtonPartButton"
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
        <Form className="ExclusionConfirmation"
              onSubmit={(event) => {
                  event.preventDefault();
                  props.addExclusion(exclusion);
                  props.onHide();
              }}
        >
            <Form.Group controlId="exclusionConfirmation" style={{margin: 0}}>
                Adding
                <Form.Control className="ExclusionConfirmationInput"
                              type="text"
                              value={exclusion}
                              onChange={
                                  (event) => setExclusion(event.target.value)
                              }
                />
                to the exclusion list
            </Form.Group>
            
            <div className="ExclusionConfirmationButtonRow">
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

function DatePart(props) {
    const month = props.date.getUTCMonth();
    const year = props.date.getUTCFullYear();
    return (
        <span>
            {month_list[month]} of {year}
        </span>
    );
}

function JournalPart(props) {
    return (
        <span className="ChainDetailJournalPart">
            {props.journal}
        </span>
    )
}

class AuthorPart extends React.Component {
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
        let affil = this.props.affil.length === 0 ? "-" : this.props.affil;
        
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
            ? "ChainDetailAuthorPartAffilWrapped"
            : "ChainDetailAuthorPartAffilUnwrapped";
        const containerClassName = this.state.wrapped
            ? "ChainDetailAuthorPartAffilContainerWrapped"
            : "ChainDetailAuthorPartAffilContainerUnwrapped";
        return (
            <div className="ChainDetailAuthorPart">
                <ExcludeButtonPart exclusion={'=' + this.props.name}
                                   addExclusion={this.props.addExclusion}
                />
                <div className="ChainDetailAuthorPartName">
                    {this.props.name}
                </div>
                <div className={containerClassName}
                     title={this.props.affil}
                >
                    <span className={textClassName}>(</span>
                    <span className={textClassName}
                          onClick={this.toggleExpandAffil}
                    >
                        {affil}
                    </span>
                    <span className={textClassName}>)</span>
                </div>
            </div>
        )
    }
}

function DocumentPart(props) {
    const bibcode = props.documents[props.documentNumber][0];
    const document = findDocument(props, bibcode);
    if (props.documents.length <= 1)
        // We don't _need_ to use a Button when there's only one document,
        // but using the same element we use when there are multiple
        // documents ensures everything lines up exactly the same.
        return (
            <div className="ChainDetailDocumentPart">
                <ExcludeButtonPart exclusion={bibcode}
                                   addExclusion={props.addExclusion}
                />
                <Button size="lg"
                        disabled
                        className="ChainDetailSingleDocButton ChainDetailDocButton"
                        variant="link"
                >
                    {document.title}
                </Button>
            </div>
        );
    else
        return (
            <div className="ChainDetailDocumentPart">
                <ExcludeButtonPart exclusion={bibcode}
                                   addExclusion={props.addExclusion}
                />
                <Dropdown alignRight>
                    <Dropdown.Toggle className="ChainDetailDocButton"
                                     size="lg"
                                     variant="link"
                    >
                        {document.title}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {props.documents.map((data, idx) =>
                            <Dropdown.Item key={data[0]}
                                           eventKey={idx}
                                           onSelect={props.onDocumentSelected}
                                           active={data[0] === bibcode}
                                           size="lg"
                            >
                                {findDocument(props, data[0]).title}
                            </Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        )
}

function ADSPart(props) {
    const url = "https://ui.adsabs.harvard.edu/abs/" + props.bibcode + "/abstract";
    return (
        <a href={url}
           target="_blank"
           rel="noopener noreferrer"
           className="ChainDetailADSPart"
        >
            [ADS]
        </a>
    );
}

function ArrowPart(props) {
    return (
        <img src="arrow.png"
             className="ChainDetailArrowPart"
             alt="The next link in the chain is..."
        />
    )
}

function findDocuments(props, sort = true) {
    let documents = props.repo.bibcodeLookup[props.author][props.nextAuthor];
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