import React, { Component } from 'react';

import { } from '@material-ui/core';
import {
    ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip,
    // Legend, LineChart, Line
    AreaChart, Area
} from 'recharts';

import theme from '../theme';


//Both Graphs are working in state,
//Todo P2: Allow user to choose Graphs "LineChart" or "AreaChar"

class tscmpChart extends Component {
    /**
     * @props: 
     *  POnStopLoading: method
     *  PIsLoading: boolean
     *  PLoadingText: text
     *  
     */

    render() {
        var LMe = this;

        return (
            <ResponsiveContainer>
                {/* <LineChart data={LMe.props.PRecords}>
                    <Line type="monotone" dataKey={LMe.props.PChartConfig.lineDataKey} name={LMe.props.PChartConfig.dispName} stroke={theme.palette.primary.main} />
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey={LMe.props.PChartConfig.xAxisDataKey}
                    // stroke={theme.palette.primary.main} 
                    />
                    <YAxis
                    // stroke={theme.palette.primary.main} 
                    />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                </LineChart> */}

                <AreaChart width={730} height={250} data={LMe.props.PRecords}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey={LMe.props.PChartConfig.xAxisDataKey} />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey={LMe.props.PChartConfig.lineDataKey} name={LMe.props.PChartConfig.dispName} stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorUv)" />
                    <Area type="monotone" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorPv)" />
                </AreaChart>
            </ResponsiveContainer>
        );
    }
}

export default tscmpChart;