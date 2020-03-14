import React from "react";
import parseResponse from "./ServerResponseParser";
import Header from './Header';
import SearchForm from './SearchForm';
import ResultDisplay from "./ResultDisplay";

class APPA extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {isLoading: false, data: null, searchState: null};
        this.onFormSubmitted = this.onFormSubmitted.bind(this);
        this.setStateFromSearchParams = this.setStateFromSearchParams.bind(this);
    }
    
    componentDidMount() {
        if (window.location.search.length > 0) {
            this.setStateFromSearchParams(
                new URLSearchParams(window.location.search));
        }
    }
    
    onFormSubmitted(formData) {
        if (formData === null) {
            this.setState({data: null});
            return;
        }
        const params = new URLSearchParams();
        for (let key in formData) {
            if (formData[key] !== '')
                params.set(key, formData[key]);
        }
        this.setStateFromSearchParams(params);
    }
    
    setStateFromSearchParams(params) {
        this.setState({searchState: {
                src: params.get("src") || "",
                dest: params.get("dest") || "",
                exclusions: params.get("exclusions") || ""
            }});
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
        this.setState({haveData: false, isLoading: true});
        fetch("http://127.0.0.1:5000/find_route?" + params.toString())
            .then(response => response.json())
            .then(data => parseResponse(data))
            .then(data => this.setState({
                isLoading: false,
                data: data
            }));
    }
    
    render() {
        if (!this.state.data && !this.state.isLoading) {
            return (
                <div>
                    <Header/>
                    <SearchForm onSubmit={this.onFormSubmitted}
                                mini={false}
                                state={this.state.searchState} />
                </div>
            );
        }
        else if (this.state.isLoading) {
            return (
                <div>
                    <Header />
                    Loading...
                </div>
            )
        } else {
            return (
                <div>
                    <Header />
                    <SearchForm onSubmit={this.onFormSubmitted}
                                mini={true}
                                state={this.state.searchState} />
                    <ResultDisplay repo={this.state.data}
                                   chains={this.state.data.chains} />
                </div>
            )
        }
    }
}

export default APPA;