'use strict';

/* 
* Helper functions for UI/UX
*/

// Creates new DOM elements and assigns attributes
export function elementFactory(type, attributes, ...children) {
    const el = document.createElement(type)
    let key = null;
    for (key in attributes) {
        el.setAttribute(key, attributes[key])
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child))
        } else {
            el.appendChild(child)
        }
    })

    return el;
}

// Get all nodes of a class
export function getAllnodes(CSSclass) {
    return document.querySelectorAll(CSSclass);
}

// Convert nodelist to an Array
export function nodesToArray(nodeList) {
    return Array.from(nodeList);
}

// Adds a class to all elements selected
export function setAllCSSclass(CSSclass, nodeArray) {
    return nodeArray.forEach(x => x.classList.add(CSSclass));
}

// Sets all menu buttons to off
export function allMenuBtnOFF() {
    setAllCSSclass('og-OFF', nodesToArray(getAllnodes('.og-menu-btn')));
}

// Hides all dialoges of main menu
export function allDialogsHide() {
    setAllCSSclass('og-hide', nodesToArray(getAllnodes('.og-dialog')));
}

function isString(v) {
    return typeof v === 'string' || v instanceof String;
}

// Handles the click inside/outside a dialog - closes dialog when click outside
export function btnClickHandler(btn_id, dialog_id, dialog_selector, btn_icon_id) {
    let btn = isString(btn_id) ? document.getElementById(btn_id) : btn_id;
    let dialog = document.getElementById(dialog_id);
    btn.onclick = function (e) {
        if (this.classList.contains('og-OFF')) {
            // Turn to ON
            allMenuBtnOFF();
            allDialogsHide();
            this.classList.remove('og-OFF');
            if (dialog) {
                dialog.classList.remove('og-hide');
            }

            if (this.classList.contains('og-has-dialog')) {
                let listener = document.addEventListener('click', (e) => {
                    if (e.target.matches(dialog_selector) || e.target.matches(btn_icon_id)) { //inside
                        return;
                    } else {//outside    
                        btn.classList.add('og-OFF');
                        if (dialog) {
                            dialog.classList.add('og-hide')
                        }
                        // TODO needs fix
                        // this.removeEventListener('click', arguments.callee);
                    }
                })
            }
        } else {
            // Turn to OFF
            this.classList.add('og-OFF');
            if (dialog) {
                dialog.classList.add('og-hide');
            }
        }
    }
<<<<<<< Updated upstream
}
=======

    return {behaviour, mouseMove}
}

export function buildButtonAndDialog (classExtension, headerTitle, planet, userPrefs) {

        const { switcherDependency, sectionsOpening, btnInMenu } = userPrefs

        // Basic DOM creation
        const D_menu_btn = elementFactory('div', { id: 'og-switcher-'+classExtension+'-menu-btn', class: 'og-menu-btn og-OFF' },
            elementFactory('div', { class: 'og-icon-holder' }))
        const D_dialog = elementFactory('div', { id: 'og-switcher-'+classExtension+'-dialog', class: 'og-switcher-dialog og-dialog og-not-visible' })
        const D_header = elementFactory('div', { class: 'og-switcher-dialog-header' })
        const D_header_close = elementFactory('div', { id: 'og-switcher-'+classExtension+'-dialog-close-btn', class: 'og-switcher-dialog-header-btn og-close-btn og-OFF' },
            elementFactory('div', { class: 'og-icon-holder' }))
        const D_header_minMax = elementFactory('div', { id: 'og-switcher-'+classExtension+'-dialog-minMax-btn', class: 'og-switcher-dialog-header-btn og-minMax-btn og-OFF' },
            elementFactory('div', { class: 'og-icon-holder' }))
        const D_header_title = elementFactory('span', { class: 'og-switcher-dialog-header-title' }, headerTitle)
        const D_header_pin = elementFactory('div', { id: 'og-switcher-'+classExtension+'-dialog-pin-btn', class: 'og-switcher-dialog-header-btn og-pin-btn og-OFF' },
            elementFactory('div', { class: 'og-icon-holder' }))
        const D_main_container = elementFactory('div', { class: 'og-switcher-'+classExtension+'-dialog-main-container'})

        D_header_pin.dataset.attachement = 'UNPINNED'

        // Append children to parents
        appendChildren(planet.renderer.div, [D_menu_btn, D_dialog])
        appendChildren(D_dialog, [D_header, D_main_container])
        appendChildren(D_header, [D_header_close, D_header_minMax, D_header_title, D_header_pin])

        // Behaviour according to dependency on switcher
        if (switcherDependency == false) {
            D_menu_btn.classList.add('og-hide') // hide menu btn
            D_dialog.classList.remove('og-not-visible') // Show dialog when opening webpage
            D_header_pin.classList.add('og-not-visible') //  hide the pin that attaches the dialog window    
        }


        // LISTENERS
        const whereClick = (e, wrapper, menuBtn) => {
            if (wrapper.contains(e.target)) { return 'inside' }
            else if (menuBtn.contains(e.target)) { return 'on-btn' }
            else { return 'outside' }
        }

        const whereClickHandler = (e) => {
            // Check where I clicked : in dialog, in button, elsewhere
            let whereIclicked = D_menu_btn ? whereClick(e, D_dialog, D_menu_btn) : null

            // If I clicked elsewhere and the dialog is unpinned, then hide dialog and set menu btn to OFF
            if (whereIclicked == 'outside' && D_header_pin.dataset.attachement == 'UNPINNED') {
                D_dialog.classList.add('og-not-visible')
                D_menu_btn.classList.add('og-OFF')
                // If Iclicked on button, toggle dialog and menu btn
            } else if (whereIclicked == 'on-btn') {
                D_dialog.classList.toggle('og-not-visible')
                D_menu_btn.classList.toggle('og-OFF')
            }
        }

        // Document
        document.addEventListener('click', (e) => whereClickHandler(e))

        // Header pin - here I am using instead of CSS classes, the data-* attribute of the DOM element to store the state
        D_header_pin.addEventListener('click', () => {
            let newText = toggleText(D_header_pin.dataset.attachement, ['PINNED', 'UNPINNED'])
            D_header_pin.classList.toggle('og-OFF')
            D_header_pin.dataset.attachement = newText
        })

        // Header double click
        D_header.addEventListener('dblclick', (e) => {
            if (D_header !== e.target) return
            menuBtnPosToDialog(D_dialog)
        }, false)

        const menuBtnPosToDialog = (el) => {
            const menuBtnBoundBox = D_menu_btn.getBoundingClientRect() // position of switcher
            el.style.top = menuBtnBoundBox.top + "px";
            el.style.left = menuBtnBoundBox.left - el.offsetWidth + "px"; 
            // TODO decide if button is to the right/left/top/bottom and act accordingly
        }

        menuBtnPosToDialog(D_dialog) // Call to set initial position of dialog

        // Header mousedown --> move dialog OR nothing
        const { behaviour, mouseMove } = enableElmovement(D_dialog, planet)

        D_header.addEventListener('mousedown', (e) => {
            if (D_header_pin.dataset.attachement == 'UNPINNED') {
                behaviour(e)
            } else {
                document.removeEventListener('mousemove', mouseMove)
            }
        })

        D_header_close.addEventListener('click', () => {
            D_dialog.classList.add('og-not-visible')
            D_menu_btn.classList.add('og-OFF')
        })

        D_header_minMax.addEventListener('click', () => {
            D_main_container.classList.toggle('og-hide')
            D_main_container.classList.toggle('og-minimized')
            D_dialog.classList.toggle('og-minimized')
        })

        return D_main_container
    }
>>>>>>> Stashed changes
