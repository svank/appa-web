import React from 'react';
import './DistanceReport.css';

function DistanceReport(props) {
    return (
        <div className="DistanceReport">
            The distance between {}
            <span className="DistanceReportName">{props.source}</span>
            {} and {}
            <span className="DistanceReportName">{props.dest}</span>
            {} appears to be {}
            <span className="DistanceReportDistance">{props.dist}</span>.
        </div>
    )
}

export default DistanceReport
