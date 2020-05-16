import React from "react";
import {Alert} from "react-bootstrap";
import {parseServerResponse} from "./RepoManager";
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
            nHistorySets: 0
        };
        this.onFormSubmitted = this.onFormSubmitted.bind(this);
        this.queryServerForData = this.queryServerForData.bind(this);
        this.addExclusion = this.addExclusion.bind(this);
        this.updateURL = this.updateURL.bind(this);
        this.onBackToSearch = this.onBackToSearch.bind(this);
        
        window.onpopstate = () => {
            if (window.location.search.length === 0)
                this.setState({isLoading: false, data: null});
            else
                this.queryServerForData(
                    new URLSearchParams(window.location.search));
            this.setState((state) => {
                const hasSet = state.nHistorySets;
                return {nHistorySets: hasSet > 0 ? hasSet - 1 : 0}});
        }
    }
    
    componentDidMount() {
        if (window.location.search.length > 0) {
            this.queryServerForData(
                new URLSearchParams(window.location.search));
        }
    }
    
    onBackToSearch() {
        if (this.state.nHistorySets > 0) {
            window.history.back();
        } else {
            window.history.replaceState({}, '', window.location.pathname);
        }
        this.setState({data: null});
    }
    
    onFormSubmitted(formData, allowPushState=true) {
        recordWelcomeSeen();
        const params = this.formDataToUrlParams(formData);
        if (formData.src === "" || formData.dest === "") {
            this.setState({error: "empty_author"});
            return;
        }
        this.updateURL(formData, allowPushState);
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
    
    updateURL(formData, allowPushState=true) {
        let params = this.formDataToUrlParams(formData);
        if (params.toString().length > 0)
            params = "?" + params;
        if (params.toString() === window.location.search.toString())
            return;
        const newURL = `${window.location.pathname}${params}`;
        if (allowPushState) {
            window.history.pushState({}, '', newURL);
            this.setState((state) => {
                return {nHistorySets: state.nHistorySets + 1}});
        } else
            window.history.replaceState({}, '', newURL);
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
            .catch(() => {
                this.onBackToSearch();
                this.setState({
                    error: {error_key: "unknown_client_detected"},
                    isLoading: false,
                    loadData: null
                });
            }
        );
    }
    
    processNetworkResponse(data) {
        this.setState({
            isLoading: false,
            loadData: null,
        });
        if ("error_key" in data) {
            this.setState({error: data});
            this.onBackToSearch();
        } else {
            const parsedData = parseServerResponse(data);
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
            this.onFormSubmitted(newSearchState, false);
        else {
            this.updateURL(newSearchState, false);
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
                    <h6>Error</h6>
                    {parseError(this.state.error)}
                </Alert>
            );
        }
        let mainClass = "main-content";
        let content;
        if (!this.state.data && !this.state.isLoading) {
            content = (
                <SearchForm onSubmit={this.onFormSubmitted}
                            state={this.state.searchState}
                />
            );
            mainClass += " main-content-with-search"
        } else if (this.state.isLoading) {
            content = (
                <LoadingDisplay data={this.state.loadData} />
            );
            mainClass += " main-content-without-search"
        } else {
            content = (
                <ResultDisplay repo={this.state.data}
                               key={this.state.data}
                               addExclusion={this.addExclusion}
                               onEditSearch={this.onBackToSearch}
                />
            );
            mainClass += " main-content-without-search"
        }
        
        return (
                <div className="page">
                    <header>
                        <Header />
                    </header>
                    {welcomeMessage(this)}
                    {error}
                    <div className={mainClass}>
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
        case "ads_error":
            return "Error during ADS query. ADS says: " + error.error_msg;
        case "too_far":
            return "The distance between these two authors is more than 8, which is quite large. APPA isn't entirely sure a connection can be found and is giving up."
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