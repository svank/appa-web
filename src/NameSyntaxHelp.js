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
                    periods after initials).
                </li>
                <li>
                    A search will {}
                    match all names <i>consistent</i> with the {}
                    name you give {}
                    (e.g. "Last, First" will match "Last, F" {}
                    and "Last, First M").
                </li>
                <li>
                    Like ADS, type '<b>=</b>' before a name {}
                    to match only exactly what you type (so {}
                    "=Last, First" will <i>not</i> match {}
                    "Last, F").
                </li>
            </ul>
            APPA adds two additional modifiers like the '=' {}
            modifier.
            <ul>
                <li>
                    '<b>&lt;</b>' will match what you type or {}
                    anything <i>less specific</i>.
                </li>
                <li>
                    '<b>&gt;</b>' will match what you type or {}
                    anything <i>more specific</i>.
                </li>
                <li>
                    E.g. "&gt;Last, First" will match "Last, First" and {}
                    "Last, First M", but will <i>not</i> match "Last, F".
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