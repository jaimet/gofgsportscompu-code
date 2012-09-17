/*
 * Copyright (C) 2011 Wolfgang Koller
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

var Translator = {
	m_contexts : new Array(),
	ontranslate : null,

	register : function(p_context) {
		Translator.m_contexts.push(p_context);

		Translator._translate(p_context);
	},

	changeLanguage : function(p_language) {
		// Load i18n module
		$.i18n.properties({
			name : "gofgsc",
			path : "i18n/",
			mode : "map",
			language : p_language,
			callback : function() {
				for ( var i = 0; i < Translator.m_contexts.length; i++) {
					Translator._translate(Translator.m_contexts[i]);
				}

				// Setup jQuery mobile values
				$.mobile.loadingMessage = $.i18n.prop("loading_message");

				if (typeof Translator.ontranslate === "function") Translator.ontranslate();
			}
		});
	},

	/**
	 * Apply translations to a given context
	 * (called by the pagecreate events)
	 */
	_translate : function(p_context) {
		$(p_context).find('*[data-i18n]').each(function() {
			var trans = $.i18n.prop($(this).attr("data-i18n"));
			findTextOnly.call(this);

			// Find the last children, required due to jQueryMobile adding elements
			function findTextOnly() {
				if ($(this).children().size() <= 0) {
					// check for flip toggle switch
					if ($(this).is('option') && $(this).parent('select[data-role="slider"]').length > 0) {
						var flipToggleSwitch = $(this).parent('select[data-role="slider"]').next().first();
						// this looks a bit crazy but basically just updates the corresponding span of the generated flipToggleSwitch
						// the modulo 2 is there, because the order is inverted for the generated HTML-tags
						flipToggleSwitch.children().eq(($(this).parent('select[data-role="slider"]').children().index($(this)) + 1) % 2).text(trans);
					} else {
						$(this).text(trans);
					}
				}
				// .. continue searching if there are children left
				else {
					$(this).children(':not(.ui-icon)').each(findTextOnly);
				}
			}
		});
	}
};
