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

function l10n() {}

/**
 * Constants for unit conversions
 */
l10n.KM_TO_MILE = 1.609344;
l10n.M_TO_FEET = 0.3048;

/**
 * Localize large unit value (e.g. km or miles)
 * @param float p_value Value to localize in km
 */
l10n.largeUnitValue = function( p_value ) {
            switch( SettingsHandler.getInt( 'displayunits' ) ) {
            case 2:
                p_value = p_value / l10n.KM_TO_MILE;
                break;
            default:
                break;
            }

            return p_value;
        }

/**
 * Localize small unit value (e.g. m or feet)
 * @param float p_value Value to localize in m
 */
l10n.smallUnitValue = function( p_value ) {
            switch( SettingsHandler.getInt( 'displayunits' ) ) {
            case 2:
                p_value = p_value / l10n.M_TO_FEET;
                break;
            default:
                break;
            }

            return p_value;
        }

/**
 * Localize large unit (e.g. km and miles)
 */
l10n.largeUnit = function() {
            var unit = "km";

            switch( SettingsHandler.getInt( 'displayunits' ) ) {
            case 2:
                unit = "mi.";
                break;
            default:
                break;
            }

            return unit;
        }

/**
 * Localize small unit (e.g. m and feet)
 */
l10n.smallUnit = function() {
            var unit = "m";

            switch( SettingsHandler.getInt( 'displayunits' ) ) {
            case 2:
                unit = "ft.";
                break;
            default:
                break;
            }

            return unit;
        }

/**
 * Localize speed unit (e.g. km/h and mph)
 */
l10n.speedUnit = function() {
            var unit = "km/h";

            switch( SettingsHandler.getInt( 'displayunits' ) ) {
            case 2:
                unit = "mph";
                break;
            default:
                break;
            }

            return unit;
        }
