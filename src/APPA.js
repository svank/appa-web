import React from "react";
import {Alert} from "react-bootstrap";
import {parseResponse} from "./ServerResponseParser";
import Header from './Header';
import LoadingDisplay from "./LoadingDisplay";
import SearchForm from './SearchForm';
import ResultDisplay from "./ResultDisplay";
import './APPA.css';
import {URL_BASE} from './LocalConfig';

class APPA extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            isLoading: false,
            loadData: null,
            data: null,
            error: null,
            searchState: null,
            hasSetHistory: false
        };
        this.onFormSubmitted = this.onFormSubmitted.bind(this);
        this.queryServerForData = this.queryServerForData.bind(this);
        this.addExclusion = this.addExclusion.bind(this);
        this.updateURL = this.updateURL.bind(this);
        this.onBackToSearch = this.onBackToSearch.bind(this);
        
        window.onpopstate = () => {
            if (window.location.search.length === 0)
                this.setState({isLoading: false, data: null, hasSetHistory: false});
            else
                this.queryServerForData(
                    new URLSearchParams(window.location.search));
        }
    }
    
    componentDidMount() {
        if (window.location.search.length > 0) {
            this.queryServerForData(
                new URLSearchParams(window.location.search));
        }
    }
    
    onBackToSearch() {
        if (this.state.hasSetHistory) {
            console.log("back");
            window.history.back();
            this.setState({hasSetHistory: false});
        } else {
            console.log("replace");
            window.history.replaceState({}, '', window.location.pathname);
        }
        this.setState({data: null});
    }
    
    onFormSubmitted(formData) {
        recordWelcomeSeen();
        const params = this.formDataToUrlParams(formData); 
        this.updateURL(formData);
        if (formData.src === "" || formData.dest === "") {
            this.setState({error: "empty_author"});
            return;
        }
        this.queryServerForData(params);
    }
    
    formDataToUrlParams(formData) {
        const params = new URLSearchParams();
        for (const key of Object.keys(formData)) {
            if (formData[key] !== '')
                params.set(key, formData[key]);
        }
        return params;
    }
    
    updateURL(formData) {
        let params = this.formDataToUrlParams(formData);
        if (params.toString().length > 0)
            params = "?" + params;
        if (params.toString() === window.location.search.toString())
            return;
        const newURL = `${window.location.pathname}${params}`;
        if (this.state.hasSetHistory)
            window.history.replaceState({}, '', newURL);
        else {
            window.history.pushState({}, '', newURL);
            this.setState({hasSetHistory: true});
        }
        return params;
    }
    
    queryServerForData(params) {
        this.setState({
            searchState: {
                src: params.get("src") || "",
                dest: params.get("dest") || "",
                exclusions: params.get("exclusions") || ""
            }
        });
        this.setState({
            isLoading: true,
            error: null,
            loadData: null,
            data: null
        });
        
        this.getDataFromUrl(URL_BASE + "find_route?" + params.toString());
        
        // Set a recent, dummy timestamp to ensure we don't use stale data
        // from a previous query run
        this.setState({loadData:
                {timestamp: Date.now()/1000 - 10, isDummy: true}});
        setTimeout(() => {
            const intervalId = setInterval(() => {
                if (this.state.isLoading)
                    fetch(URL_BASE + "get_progress?" + params.toString())
                        .then(response => response.json())
                        .then(data => {
                            if (this.state.isLoading
                                && data.error === undefined
                                // Ensure we only ever update to newer data
                                && data.timestamp > this.state.loadData.timestamp)
                                this.setState({loadData: data})
                        });
                else
                    clearInterval(intervalId);
            }, 1000);
        }, 1500);
    }
    
    getDataFromUrl(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("not ok");
                }
                return response.json();
            })
            .then(data => {
                if ("responseAtUrl" in data) {
                    this.getDataFromUrl(data.responseAtUrl);
                } else
                    this.processNetworkResponse(data);
            })
            .catch(() =>
                this.setState({
                    error: {error_key: "unknown_client_detected"},
                    isLoading: false,
                    loadData: null})
            );
    }
    
    processNetworkResponse(data) {
        this.setState({
            isLoading: false,
            loadData: null,
        });
        if ("error_key" in data) {
            this.setState({error: data})
        } else {
            const parsedData = parseResponse(data);
            this.setState({data: parsedData});
        }
    }
    
    addExclusion(exclusion, needServer) {
        let newSearchState = {
            src: this.state.searchState.src,
            dest: this.state.searchState.dest,
            exclusions: this.state.searchState.exclusions || ""
        };
        if (newSearchState.exclusions.length !== 0
            && newSearchState.exclusions.slice(-1) !== '\n')
            newSearchState.exclusions += '\n';
        newSearchState.exclusions += exclusion;
        if (needServer)
            this.onFormSubmitted(newSearchState);
        else {
            this.updateURL(newSearchState);
            this.setState({searchState: newSearchState});
        }
    }
    
    render() {
        let error = null;
        if (this.state.error != null) {
            error = (
                <Alert variant="danger"
                       dismissible
                       onClose={() => this.setState({error: null})}
                >
                    {parseError(this.state.error)}
                </Alert>
            );
        }
        let content;
        if (!this.state.data && !this.state.isLoading) {
            content = (
                <SearchForm onSubmit={this.onFormSubmitted}
                            state={this.state.searchState}
                />
            );
        } else if (this.state.isLoading) {
            content = (
                <LoadingDisplay data={this.state.loadData} />
            );
        } else {
            content = (
                <ResultDisplay repo={this.state.data}
                               key={this.state.data}
                               addExclusion={this.addExclusion}
                               onEditSearch={this.onBackToSearch}
                />
            );
        }
        
        return (
                <div className="Page">
                    <Header />
                    {welcomeMessage(this)}
                    {error}
                    <div className="MainContent">
                        {content}
                    </div>
                </div>
        )
    }
}

function welcomeMessage(component) {
    if (localStorage.getItem("APPA-WelcomeSeen") !== null)
        return null;
    return (
        <Alert variant="primary"
               dismissible
               onClose={() => {recordWelcomeSeen(); component.forceUpdate();}}
        >
            <div style={{maxWidth: "600px", margin: "0 auto"}}>
                Welcome! APPA uses the ADS database to let you explore {}
                connections between authors. Type in two names and APPA {}
                will find the chains of coauthorship (person A published a {}
                paper with B, who wrote a paper with C...) connecting those {}
                two names.
            </div>
        </Alert>
    )
}

function recordWelcomeSeen() {
    localStorage.setItem("APPA-WelcomeSeen", "y");
}

function parseError(error) {
    let error_key = error;
    if (error.error_key)
        error_key = error.error_key;
    switch(error_key) {
        case "no_authors_to_expand":
            return "No possible connections found.";
        case "src_empty":
            return 'No papers found for author "' + error.src + '"';
        case "dest_empty":
            return 'No papers found for author "' + error.dest + '"';
        case "rate_limit":
            return "Unfortunately, APPA has exceeded its daily allowed quota of ADS queries. This limit will reset at " + error.reset + ".";
        case "unknown":
            return "Unexpected server error :(";
        case "empty_author":
            return 'A "from" and a "to" author must be specified.';
        case "unknown_client_detected":
            return "Unexpected error :(";
        default:
            return error.error_msg;
    }
}

export default APPA;