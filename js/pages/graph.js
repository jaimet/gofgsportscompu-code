/*
 * Copyright (C) 2012 Wolfgang Koller
 *
 * This file is part of GOFG Sports Computer - http://www.gofg.at/.
 *
 * GOFG Sports Computer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * GOFG Sports Computer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GOFG Sports Computer.  If not, see <http://www.gnu.org/licenses/>.
 */

function Graph() {
}
Graph.prototype = new Page( 'graph' );

Graph.prototype.leftPage = "map.html";
Graph.prototype.m_plot = null;
Graph.prototype.m_altitudeSeries = {data: [], color: '#FF0000'};
Graph.prototype.m_altitudeData = [];
Graph.prototype.m_elevationGain = 0.0;
Graph.prototype.m_elevationLoss = 0.0;

Graph.m_chartOptions = {
    xaxis: {
        label: null,
        labelPos: 'high'
    },
    yaxis: {
        label: null,
        labelPos: 'high'
    }
};

Graph.prototype.oninit = function() {
            $( '#graph-page' ).live( 'pageshow', Utilities.getEvtHandler(pages.graph, pages.graph.initChart) );
        }

/**
 * Called whenever the chart is shown (which initialized the chart & updates the display)
 */
Graph.prototype.initChart = function() {
            if( pages.graph.m_plot === null ) {
                // Calculate and setup chart height
                var chart_height = $(window).height();
                chart_height -= $('#graph-page > [data-role="header"]').outerHeight( true );
                chart_height -= ($( '#graph-page > [data-role="content"]' ).outerHeight( true ) - $( '#graph-page > [data-role="content"]' ).height());
                chart_height -= $('#graph-page_pager').outerHeight( true );
                chart_height -= $('#graph-page_display').outerHeight( true );
                $( '#graph-page_plot' ).height( chart_height );

                var chart_width = $( '#graph-page > [data-role="content"]' ).width();
                $( '#graph-page_plot' ).width( chart_width );

                Graph.m_chartOptions.xaxis.label = l10n.largeUnit();
                Graph.m_chartOptions.yaxis.label = l10n.smallUnit();

                pages.graph.m_plot = $.plot($("#graph-page_plot"), [pages.graph.m_altitudeSeries], Graph.m_chartOptions);
                pages.graph._refreshElevation();
            }
            else {
                pages.graph._refresh();
                pages.graph._refreshElevation();
            }
        }

// TODO: Unit update display for graph axes
Graph.prototype.updateDisplayUnits = function() {
            // Update series data
            pages.graph.m_altitudeSeries.data = [];
            for( var i = 0; i < pages.graph.m_altitudeData.length; i++ ) {
                pages.graph.m_altitudeSeries.data.push(
                            [
                                l10n.largeUnitValue(pages.graph.m_altitudeData[i][0]),
                                l10n.smallUnitValue(pages.graph.m_altitudeData[i][1])
                            ]
                            );
            }

            // If graph is already initialized, we have to update the axis labels
            if( pages.graph.m_plot !== null ) {
                pages.graph.m_plot.getAxes().xaxis.options.label = l10n.largeUnit();
                pages.graph.m_plot.getAxes().yaxis.options.label = l10n.smallUnit();
            }
        }

/**
 * Internal function for refreshing the graph display
 */
Graph.prototype._refresh = function() {
            pages.graph.m_plot.setData( [pages.graph.m_altitudeSeries] );
            pages.graph.m_plot.setupGrid();
            pages.graph.m_plot.draw();
        }

/**
 * Refresh display of elevation data
 */
Graph.prototype._refreshElevation = function() {
            $( '#graph-page_display' ).html( '&uarr; ' + l10n.smallUnitValue(pages.graph.m_elevationGain).toFixed(0) + l10n.smallUnit() + ' - &darr; ' + l10n.smallUnitValue(pages.graph.m_elevationLoss).toFixed(0) + l10n.smallUnit() );
        }

/**
 * Called when a new track should be started (thus reset the graph)
 */
Graph.prototype.newtrack = function() {
            pages.graph.m_altitudeSeries.data = [];
            pages.graph.m_altitudeData = [];
            pages.graph.m_elevationGain = 0.0;
            pages.graph.m_elevationLoss = 0.0;
        }

/**
 * Add a new waypoint to the altitude graph
 */
Graph.prototype.waypoint = function( p_waypoint, p_track ) {
            // Get X & Y values (distance & altitude)
            var x = parseFloat(p_track.getTotalDistance() / 1000.0);
            var y = parseFloat(p_waypoint.m_position.coords.altitude);

            // Remember raw data
            pages.graph.m_altitudeData.push( [x, y] );
            // Update graph data
            pages.graph.m_altitudeSeries.data.push( [l10n.largeUnitValue(x), l10n.smallUnitValue(y)] );

            // Remember new elevation data
            pages.graph.m_elevationGain = p_track.getElevationGain();
            pages.graph.m_elevationLoss = p_track.getElevationLoss();

            // Refresh display (if page is currently visible)
            if( $( '#graph-page' ).is( ':visible' ) ) {
                pages.graph._refresh();
            }
        }

/**
 * Finalize the track (no action required in this case)
 */
Graph.prototype.endtrack = function( p_track ) {
            pages.graph.m_elevationGain = p_track.getElevationGain();
            pages.graph.m_elevationLoss = p_track.getElevationLoss();
        }

new Graph();
