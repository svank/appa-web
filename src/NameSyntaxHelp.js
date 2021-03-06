import React, {useState} from "react";
import {Button} from "react-bootstrap";
import {ChevronDownIcon, ChevronUpIcon} from "@primer/octicons-react";
import './NameSyntaxHelp.css';

const NameSyntaxHelp = React.memo(props => {
    const [show, setShow] = useState(false);
    const label = props.label ? props.label : "About name syntax & filtering";
    return (
        <div className="name-syntax-help" style={props.style}>
                    <Button variant="link"
                            className="name-syntax-help-button"
                            style={{padding: 0}}
                            onClick={() => setShow(!show)}
                    >
                        {label}&nbsp;
                        {show
                            ? <ChevronUpIcon verticalAlign="middle" />
                            : <ChevronDownIcon verticalAlign="middle" />}
                    </Button>
                    {show ? <NameSyntaxHelpContents /> : null}
                </div>
    )
});

function NameSyntaxHelpContents() {
    return (
        <div className="name-syntax-help-contents">
            APPA closely follows {}
            <a target="_blank" rel="noopener noreferrer"
                href="https://adsabs.github.io/help/search/search-syntax#author-searches">
                ADS' name syntax</a> in all search fields.
            <ul>
                <li>
                    Names must be in the format "Last, First Middle", where {}
                    every component but the last name may be a spelled-out {}
                    name or an initial.
                </li>
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
                    "Last, F" or "Last, First M.").
                </li>
            </ul>
            APPA adds <i>specificity</i> prefixes which function like the {}
            '=' prefix.
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
                    '<b>&lt;=</b>' and '<b>&gt;=</b>' will match anything {}
                    less/more specific or exactly equal to the name provided.
                </li>
                <li>
                    For example, given the possibilities "Last, F.", "Last, First" {}
                    and "Last, First M.", the latter two will be matched by {}
                    "&gt;=Last, First", while only the last choice will be {}
                    matched by "&gt;Last, First".
                </li>
                <li>
                A name is <i>more specific</i> than another name if it is the {}
                latter name but with more information added (e.g. an initial is {}
                replaced with a spelled-out name, or a middle initial is added). {}
                A name is <i>less specific</i> than another if it is the latter {}
                name but with information removed. When information is both {}
                added <i>and</i> removed (e.g. comparing "Last, First M." and {}
                "Last, F. Middle"), each name is neither more nor less {}
                specific than the other.
                </li>
            </ul>
        </div>
    )
}

export default NameSyntaxHelp