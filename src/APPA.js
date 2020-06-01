import React from "react";
import {Alert} from "react-bootstrap";
import {parseServerResponse} from "./RepoManager";
import Header from './Header';
import LoadingDisplay from "./LoadingDisplay";
import SearchForm from './SearchForm';
import ResultDisplay from "./ResultDisplay";
import './APPA.css';
import {URL_BASE, URL_BASE_PROGRESS} from './LocalConfig';

class APPA extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            isLoading: false,
            loadData: null,
            data: null,
            error: null,
            searchState: null,
        };
        this.hasSeenSearch = false;
        this.onFormSubmitted = this.onFormSubmitted.bind(this);
        this.queryServerForData = this.queryServerForData.bind(this);
        this.addExclusion = this.addExclusion.bind(this);
        this.updateURL = this.updateURL.bind(this);
        this.onBackToSearch = this.onBackToSearch.bind(this);
        
        window.onpopstate = () => {
            if (window.location.search.length === 0)
                this.setState({isLoading: false, data: null});
            else {
                const params = new URLSearchParams(window.location.search);
                const src = (params.get("src") || "");
                const dest = (params.get("dest") || "");
                const excl = (params.get("exclusions") || "");
                if (this.state.data === null
                        || src !== this.state.searchState.src
                        || dest !== this.state.searchState.dest
                        || excl !== this.state.searchState.exclusions)
                    this.queryServerForData(params);
            }
        }
    }
    
    componentDidMount() {
        if (window.location.search.length > 0) {
            this.queryServerForData(
                new URLSearchParams(window.location.search));
        }
    }
    
    onBackToSearch() {
        if (this.hasSeenSearch) {
            window.history.back();
        } else {
            window.history.pushState({}, '', window.location.pathname);
        }
        this.setState({data: null});
    }
    
    onFormSubmitted(formData, allowPushState=true) {
        recordWelcomeSeen();
        this.hasSeenSearch = true;
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
            },
            isLoading: true,
            error: null,
            loadData: null,
            data: null
        });
        
        const pKey = generateProgressKey();
        
        this.getDataFromUrl(URL_BASE + "?" + params.toString(), pKey);
        
        // Set a recent, dummy timestamp to ensure we don't use stale data
        // from a previous query run
        this.setState({loadData:
                {timestamp: Date.now()/1000 - 10, isDummy: true}});
        const intervalId = setInterval(() => {
            if (this.state.isLoading)
                fetch(URL_BASE_PROGRESS + "?key=" + pKey)
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
        }, 250);
    }
    
    getDataFromUrl(url, pKey=null) {
        let cfg = {};
        if (pKey)
            cfg = {
                method: 'POST',
                cache: 'no-cache',
                body: pKey,
                headers: {"Content-Type": "text/plain;charset=UTF-8"},
            };
        fetch(url, cfg)
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
    let err;
    switch(error_key) {
        case "no_authors_to_expand":
            return "No possible connections found.";
        case "src_empty":
            err = `No papers found for author "${error.src}".`;
            if (error.src.includes(" ") && !error.src.includes(","))
                err = (
                    <span>
                        {err} <br /> (Make sure you've followed the format {}
                        of "Last name, First name".)
                    </span>)
            return err;
        case "dest_empty":
            err = `No papers found for author "${error.dest}".`;
            if (error.dest.includes(" ") && !error.dest.includes(","))
                err = (
                    <span>
                        {err} <br /> (Make sure you've followed the format {}
                        of "Last name, First name".)
                    </span>)
            return err;
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

function generateProgressKey() {
   let result = '';
   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   for ( let i = 0; i < 30; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   return result;
}

export default APPA;