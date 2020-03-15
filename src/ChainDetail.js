import React, {useState} from 'react';
import {Button, Dropdown, Form, Overlay, Popover} from "react-bootstrap";
import './ChainDetail.css';

class ChainDetail extends React.Component {
    render() {
        const items = [];
        for (let i = 0; i < this.props.chain.length - 1; i++) {
            items.push(
                <ChainDetailItem author={this.props.chain[i]}
                                 nextAuthor={this.props.chain[i + 1]}
                                 repo={this.props.repo}
                                 key={this.props.chain[i] + this.props.chain[i + 1]}
                                 addExclusion={this.props.addExclusion} />)
        }
        return (
            <div className="ChainDetail">
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
    
    render() {
        const documents = findDocuments(this.props);
        const [bibcode, authorIdx, nextAuthorIdx] = documents[this.state.documentNumber];
        const document = findDocument(this.props, bibcode);
        const date = new Date(Date.parse(document.pubdate));
        
        return (
            <div className="ChainDetailItem">
                <AuthorPart name={document.authors[authorIdx]}
                            affil={document.affils[authorIdx]}
                            addExclusion={this.props.addExclusion} />
                published
                <DocumentPart repo={this.props.repo}
                              author={this.props.author}
                              documents={documents}
                              documentNumber={this.state.documentNumber}
                              onDocumentSelected={this.setDocumentNumber}
                              addExclusion={this.props.addExclusion} />
                in <JournalPart journal={document.publication}/> {}
                in <DatePart date={date} /> <ADSPart bibcode={bibcode} />
                <br/>with
                <AuthorPart name={document.authors[nextAuthorIdx]}
                            affil={document.affils[nextAuthorIdx]}
                            addExclusion={this.props.addExclusion} />
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
                        ref={(button) => { this.target = button; }}
                        className="ChainDetailExcludeButtonPartButton">
                    ×
                </Button>
                <Overlay show={this.state.showPopup}
                         target={this.target}
                         placement="bottom"
                         rootClose={true}
                         onHide={() => this.setState({showPopup: false})}
                         onEnter={() => this.setState({forceShowX: true})}
                         onExited={() => this.setState({forceShowX: false})} >
                    <Popover id="popover-positioned-bottom">
                        <Popover.Content>
                            <ExcludeConfirmation exclusion={this.props.exclusion}
                                                 addExclusion={this.props.addExclusion}
                                                 onHide={
                                                     () => this.setState(
                                                         {showPopup: false})
                                                 }/>
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
        <Form onSubmit={() => {
            props.addExclusion(exclusion);
            props.onHide();
        }}>
            <Form.Group controlId="exclusionConfirmation" style={{margin: 0}}>
                Adding
                <Form.Control className="ExclusionConfirmationInput"
                              type="text"
                              value={exclusion}
                              onChange={
                                  (event) => setExclusion(event.target.value)
                                  } />
                to the exclusion list
            </Form.Group>
            <div className="ExclusionConfirmationButtonRow">
                <Button type="submit" variant="primary">Confirm</Button>
                <Button variant="secondary"
                        onClick={props.onHide}>Cancel</Button>
            </div>
        </Form>
    )
}

function DatePart(props) {
    const month= props.date.getUTCMonth();
    const year= props.date.getUTCFullYear();
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
        
        const textClassName = this.state.wrapped ?
              "ChainDetailAuthorPartAffilWrapped"
            : "ChainDetailAuthorPartAffilUnwrapped";
        const containerClassName = this.state.wrapped ?
              "ChainDetailAuthorPartAffilContainerWrapped"
            : "ChainDetailAuthorPartAffilContainerUnwrapped";
        return (
            <div className="ChainDetailAuthorPart">
                <ExcludeButtonPart exclusion={this.props.name}
                                   addExclusion={this.props.addExclusion} />
                <div className="ChainDetailAuthorPartName">
                    {this.props.name}
                </div>
                <div className={containerClassName}
                     title={this.props.affil}>
                    <span className={textClassName}>(</span>
                    <span className={textClassName}
                          onClick={this.toggleExpandAffil}>
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
        return (
            <div className="ChainDetailDocumentPart">
                <ExcludeButtonPart exclusion={bibcode}
                                   addExclusion={props.addExclusion} />
                <Button id={props.author}
                        size="lg"
                        disabled
                        className="ChainDetailSingleDocButton ChainDetailDocButton"
                        variant="link">
                    {document.title}
                </Button>
            </div>
        );
    else
        return (
            <div className="ChainDetailDocumentPart">
                <ExcludeButtonPart exclusion={bibcode}
                                   addExclusion={props.addExclusion} />
                <Dropdown alignRight>
                    <Dropdown.Toggle id={props.author}
                                    className="ChainDetailDocButton"
                                    size="lg"
                                    variant="link">
                        {document.title}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {props.documents.map( (data, idx) => 
                            <Dropdown.Item key={data[0]}
                                           eventKey={idx}
                                           onSelect={props.onDocumentSelected}
                                           active={data[0] === bibcode}
                                           size="lg">
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
           /* eslint-disable-next-line react/jsx-no-target-blank */
           target="_blank"
           rel="noopener"
           className="ChainDetailADSPart">[ADS]</a>
    );
}

function ArrowPart(props) {
    return (
        <img src="arrow.png"
             className="ChainDetailArrowPart"
             alt="The next link in the chain is..." />
    )
}

function findDocuments(props) {
    return props.repo.bibcodeLookup[props.author][props.nextAuthor];
}

function findDocument(props, bibcode) {
    return props.repo.docData[bibcode];
}

const month_list = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

export default ChainDetail