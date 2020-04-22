import React, {useState} from "react";
import {Button} from "react-bootstrap";
import Octicon, {ChevronDown, ChevronUp} from "@primer/octicons-react";
import './NameSyntaxHelp.css';

function NameSyntaxHelp(props) {
    const [show, setShow] = useState(false);
    return (
        <div className="NameSyntaxHelp" style={props.style}>
                    <Button variant="link"
                            className="NameSyntaxHelpButton"
                            style={{padding: 0}}
                            onClick={() => setShow(!show)}
                    >
                        About name syntax &nbsp;
                        <Octicon icon={show ? ChevronUp : ChevronDown}
                                 verticalAlign="middle" />
                    </Button>
                    {show ? <NameSyntaxHelpContents /> : null}
                </div>
    )
}

function NameSyntaxHelpContents() {
    return (
        <div className="NameSyntaxHelpContents">
            APPA closely follows {}
            <a target="_blank" rel="noopener noreferrer"
                href="https://adsabs.github.io/help/search/search-syntax#author-searches">
                ADS' name syntax</a> in all search fields.
            <ul>
                <li>
                    First and middle names or initials are optional (as are {}
                    periods after initials), and case is ignored.
                </li>
                <li>
                    A search will {}
                    match all names <i>consistent</i> with the {}
                    name you give {}
                    (e.g. "Last, First" will match "Last, F", {}
                    "Last, First", and "Last, First M").
                </li>
                <li>
                    Like with ADS, type '<b>=</b>' before a name {}
                    to match only exactly what you type (so {}
                    "=Last, First" will <i>not</i> match {}
                    "Last, F").
                </li>
            </ul>
            APPA adds <i>specificity</i> modifiers which function like the {}
            '=' modifier.
            <ul>
                <li>
                    '<b>&lt;</b>' will match anything <i>less specific</i> {}
                    than the name provided.
                </li>
                <li>
                    '<b>&gt;</b>' will match anything <i>more specific</i> {}
                    than the name provided.
                </li>
                <li>
                    '<b>&gt;=</b>' and '<b>&lt;=</b>' will match exactly {}
                    what you type and anything more/less specific.
                </li>
                <li>
                    E.g. given the possibilities "Last, F.", "Last, First" {}
                    and "Last, First M.", the latter two will be matched by {}
                    "&gt;=Last, First", while only the last choice will be {}
                    matched by "&gt;Last, First".
                </li>
            </ul>
            "Specific" is defined by a score, the sum of: 100 {}
            for a last name, 20 for a first name, 10 for a {}
            first initial, 2 for a middle name, and 1 for a {}
            middle initial.
        </div>
    )
}

export default NameSyntaxHelp