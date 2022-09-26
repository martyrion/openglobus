'use strict';

/* 
* Helper functions for UI/UX
*/

// Creates new DOM elements and assigns attributes
export function elementFactory (type, attributes, ...children) {
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

// Build basic dom of a switcher (and dialog)
export function buildBasicDOM (cssSuffix, planet) {
    const $menuBtn = elementFactory('div', { id: 'og-switcher-' + cssSuffix + '-menu-btn', class: 'og-menu-btn og-OFF' },
        elementFactory('div', { id: 'og-switcher-' + cssSuffix + '-menu-icon', class: 'og-icon-holder' }))
    const $dialog = elementFactory('div', { id: 'og-switcher-' + cssSuffix + '-dialog', class: 'og-dialog og-not-visible' })
    const $header = elementFactory('div', { class: 'og-switcher-' + cssSuffix + '-dialog-header' })
    const $headerClose = elementFactory('div', { id: 'og-switcher-' + cssSuffix + '-dialog-close-btn', class: 'og-dialog-header-btn og-OFF' },
        elementFactory('div', { class: 'og-icon-holder' }))
    const $headerMinMax = elementFactory('div', { id: 'og-switcher-' + cssSuffix + '-dialog-minMax-btn', class: 'og-dialog-header-btn og-OFF' },
        elementFactory('div', { class: 'og-icon-holder' }))
    const $headerTitle = elementFactory('span', { class: 'og-switcher-dialog-header-title' }, 'Layer Switcher')
    const $headerPin = elementFactory('div', { id: 'og-switcher-' + cssSuffix + '-dialog-pin-btn', class: 'og-dialog-header-btn og-OFF' },
        elementFactory('div', { class: 'og-icon-holder' }))
    const $mainContainer = elementFactory('div', { class: 'og-switcher-' + cssSuffix + '-main-container' })

    $headerPin.dataset.attachement = 'UNPINNED'

    // Append children to parents
    appendChildren(planet.renderer.div, [$menuBtn, $dialog])
    appendChildren($dialog, [$header, $mainContainer])
    appendChildren($header, [$headerClose, $headerMinMax, $headerTitle, $headerPin])

    return { $menuBtn, $dialog, $header, $headerClose, $headerMinMax, $headerTitle, $headerPin, $mainContainer }
}

export function noSwitcherHandler ($menuBtn, $dialog, $headerPin, switcherDependency) {
    if (switcherDependency == false) {
        $menuBtn.classList.add('og-hide') // hide menu btn
        $dialog.classList.remove('og-not-visible') // Show dialog when opening webpage
        $headerPin.classList.add('og-not-visible') //  hide the pin that attaches the dialog window    
    }
}

export function documentWhereClick ($menuBtn, $dialog, $headerPin, docListener) {

    const whereClick = (e, wrapper, menuBtn) => {
        if (wrapper.contains(e.target)) { return 'inside' }
        else if (menuBtn.contains(e.target)) { return 'on-btn' }
        else { return 'outside' }
    }

    var whereClickHandler = null
    whereClickHandler = (e) => { // cannot be a const otherwise cannot be created again in onactivate()
        // Check where I clicked : in dialog, in button, elsewhere
        let whereIclicked = $menuBtn ? whereClick(e, $dialog, $menuBtn) : null

        // If I clicked elsewhere and the dialog is unpinned, then hide dialog and set menu btn to OFF
        if (whereIclicked === 'outside' && $headerPin.dataset.attachement == 'UNPINNED') {
            $dialog.classList.add('og-not-visible')
            $menuBtn.classList.add('og-OFF')
            // If Iclicked on button, toggle dialog and menu btn
        } else if (whereIclicked === 'on-btn') {
            $dialog.classList.toggle('og-not-visible')
            $menuBtn.classList.toggle('og-OFF')
        }
    }

    return whereClickHandler 
}

export function dialogHeaderListeners($menuBtn, $dialog, $header, $headerClose, $headerMinMax, $headerTitle, $headerPin, $mainContainer, planet) {
    // Header pin - here I am using instead of CSS classes, the data-* attribute of the DOM element to store the state
    $headerPin.addEventListener('click', () => {
        let newText = toggleText($headerPin.dataset.attachement, ['PINNED', 'UNPINNED'])
        $headerPin.classList.toggle('og-OFF')
        $headerPin.dataset.attachement = newText
    })

    // Header double click
    const dialogBoxInitial = $dialog.getBoundingClientRect() // Initial position of the dialog window
    $header.addEventListener('dblclick', (e) => {
        if ($header !== e.target) return
        restoreInitialPos($dialog)
    }, false)

    const restoreInitialPos = (el) => {
        el.style.top = dialogBoxInitial.top + "px";
        el.style.left = dialogBoxInitial.left + "px";
    }

    // Header mousedown --> move dialog OR nothing
    const { behaviour, mouseMove } = enableElmovement($dialog, planet)
    $header.addEventListener('mousedown', (e) => {
        if ($headerPin.dataset.attachement == 'UNPINNED') return behaviour(e)
        document.removeEventListener('mousemove', mouseMove)
    })

    $headerClose.addEventListener('click', () => {
        $dialog.classList.add('og-not-visible')
        $menuBtn.classList.add('og-OFF')
    })

    $headerMinMax.addEventListener('click', () => {
        $mainContainer.classList.toggle('og-hide')
        $mainContainer.classList.toggle('og-minimized')
        $dialog.classList.toggle('og-minimized')
    })
}


// Appends array of children to parent
export function appendChildren(parent, childrenArray) {
    childrenArray.forEach(child => parent.appendChild(child))
}

// Cycles an array of text and outputs next
export function toggleText(elementText, textArray) {
    let textIndex = textArray.indexOf(elementText)
    var nextIndex = 0
    textIndex >= 0 && textIndex < textArray.length - 1 ?
        nextIndex = textIndex + 1 :
        nextIndex = 0
    return textArray[nextIndex]
}

// Enables a movement of a DOM element. Also disables/enables mouse navigations for og-planet
export function enableElmovement(el, planet) {

    let newPosX = 0,
        newPosY = 0,
        startPosX = 0,
        startPosY = 0;

    const behaviour = (e) => {
        e.preventDefault();
        planet.renderer.controls.mouseNavigation.deactivate()
        // get the starting position of the cursor
        startPosX = e.clientX;
        startPosY = e.clientY;

        document.addEventListener('mousemove', mouseMove);

        document.addEventListener('mouseup', function (e) {
            document.removeEventListener('mousemove', mouseMove)
            planet.renderer.controls.mouseNavigation.activate()
        });
    }

    const mouseMove = (e) => {
        // calculate the new position
        newPosX = startPosX - e.clientX;
        newPosY = startPosY - e.clientY;

        // with each move we also want to update the start X and Y
        startPosX = e.clientX;
        startPosY = e.clientY;

        // set the element's new position:
        el.style.top = (el.offsetTop - newPosY) + "px";
        el.style.left = (el.offsetLeft - newPosX) + "px";
    }

    return { behaviour, mouseMove }
}