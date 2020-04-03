import React from "react";
import {Alert} from "react-bootstrap";
import {parseResponse} from "./ServerResponseParser";
import Header from './Header';
import LoadingDisplay from "./LoadingDisplay";
import SearchForm from './SearchForm';
import ResultDisplay from "./ResultDisplay";
import './APPA.css';

import Popper from 'popper.js';

// see: https://github.com/twbs/bootstrap/issues/23590
Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false;

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
        
        window.onpopstate = () => {
            if (window.location.search.length === 0)
                this.setState({isLoading: false, data: null});
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
    
    onFormSubmitted(formData) {
        if (formData === null) {
            this.setState({data: null});
            return;
        }
        const params = this.formDataToUrlParams(formData); 
        this.updateURL(formData);
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
        const params = this.formDataToUrlParams(formData);
        if (this.state.hasSetHistory)
            window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
        else
            window.history.pushState({}, '', `${window.location.pathname}?${params}`);
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
            data: null,
            hasSetHistory: true
        });
        
        fetch("http://127.0.0.1:5000/find_route?" + params.toString())
            .then(response => {
                if (!response.ok) {
                    throw new Error("not ok");
                }
                return response.json();
            })
            .then(data => {
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
            })
            .catch(() =>
                this.setState({
                    error: {error_key: "unknown_client_detected"},
                    isLoading: false,
                    loadData: null})
            );
        
        setTimeout(() => {
            const intervalId = setInterval(() => {
                if (this.state.isLoading)
                    fetch("http://127.0.0.1:5000/get_progress?" + params.toString())
                        .then(response => response.json())
                        .then(data => {
                            if (this.state.isLoading && data.error === undefined)
                                this.setState({loadData: data})
                        });
                else
                    clearInterval(intervalId);
            }, 500);
        }, 800);
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
        let error = "";
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
            )
        } else {
            content = (
                <ResultDisplay repo={this.state.data}
                               key={this.state.data}
                               addExclusion={this.addExclusion}
                               onEditSearch={() => 
                                   this.onFormSubmitted(null)}
                />
            )
        }
        
        return (
                <div className="Page">
                    <Header />
                    {error}
                    <div className="MainContent">
                        {content}
                    </div>
                </div>
        )
    }
}

function parseError(error) {
    switch(error.error_key) {
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
        case "unknown_client_detected":
            return "Unexpected error :(";
        default:
            return error.error_msg;
    }
}

export default APPA;