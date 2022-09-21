/**
 * @module og/control/LayerSwitcher
 */

"use strict";

import { Control } from "./Control.js";
import { buildButtonAndDialog, elementFactory } from "./UIhelpers.js";
import { Vector } from '../layer/Vector.js';
import { Layer } from '../layer/Layer.js';

/**
 * Advanced :) layer switcher, includes base layers, overlays, geo images etc. groups.
 * Double click for zoom, drag-and-drop to change zIndex
 * @class
 * @extends {Control}
 * @param {Object} [options] - Control options.
 */
class PropertiesEditor extends Control {
    constructor(options = {}) {
        super({
            name: "PropertiesEditor",
            ...options
        });

        this.switcherDependent = options.switcherDependent
        this.expandedSections = options.expandedSections
        this.switcherInMenu = options.switcherInMenu // none (default)
    }

    
    oninit() {
       
        const mainContainer = buildButtonAndDialog('properties', 'Properties Editor', this.planet, this.getUserPrefs())
        this.buildRecords(mainContainer)
        this.picking()

    }

    picking() {
         
        const slider = document.getElementById('slider')

            slider.addEventListener('input', () => {
                active._layer._opacity = slider.value / 100

            })
            var active = null
        
        this.planet.renderer.events.on("lclick", function (e) {
                // if (e.pickingObject instanceof Layer || e.pickingObject instanceof Vector) {
                    active = e.pickingObject
                    slider.value = active._layer._opacity * 100
                    console.log(active)
             
                // }
            })
    }

    
    getUserPrefs = () => {
        const switcherDependency = this.switcherDependent == undefined ? true : this.switcherDependent
        const sectionsOpening = this.expandedSections == undefined ? true : this.expandedSections
        const btnInMenu = this.switcherInMenu == undefined ? true : this.switcherInMenu

        return { switcherDependency, sectionsOpening, btnInMenu }
    }

    buildRecords(mainContainer) {
        let planet = this.planet

        let myel = elementFactory('div', {}, 'How are you?')
        mainContainer.appendChild(myel)



    }
}

export { PropertiesEditor }
