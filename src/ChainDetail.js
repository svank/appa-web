import React from 'react';
import { Dropdown, Button } from "react-bootstrap";
import './ChainDetail.css';

class ChainDetail extends React.Component {
    render() {
        const items = [];
        for (let i = 0; i < this.props.chain.length - 1; i++) {
            items.push(
                <ChainDetailItem author={this.props.chain[i]}
                                 nextAuthor={this.props.chain[i + 1]}
                                 repo={this.props.repo}
                                 key={this.props.chain[i] + this.props.chain[i + 1]} />)
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
                            affil={document.affils[authorIdx]} />
                published
                <DocumentPart repo={this.props.repo}
                              author={this.props.author}
                              documents={documents}
                              documentNumber={this.state.documentNumber}
                              onDocumentSelected={this.setDocumentNumber}/>
                in <JournalPart journal={document.publication}/> {}
                in <DatePart date={date} /> <ADSPart bibcode={bibcode} />
                <br/>with
                <AuthorPart name={document.authors[nextAuthorIdx]}
                            affil={document.affils[nextAuthorIdx]} />
                <ArrowPart />
            </div>
        )
    }
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
        const affil = this.props.affil.length === 0 ? "-" : this.props.affil;
        let className = this.state.wrapped ?
              "ChainDetailAuthorPartAffilWrapped"
            : "ChainDetailAuthorPartAffilUnwrapped";
        return (
            <div className="ChainDetailAuthorPart">
                <div className="ChainDetailAuthorPartName">
                    {this.props.name}
                </div>
                <div className="ChainDetailAuthorPartAffil"
                     title={this.props.affil}>
                    <span className={className}>(</span>
                    <span className={className}
                          onClick={this.toggleExpandAffil}>
                        {affil}
                    </span>
                    <span className={className}>)</span>
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
            <div>
            <Button id={props.author}
                    size="lg"
                    disabled
                    className="ChainDetailSingleDocButton ChainDetailDocButton"
                    variant="link">
                {document.title}
            </Button></div>
        );
    else
        return (
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