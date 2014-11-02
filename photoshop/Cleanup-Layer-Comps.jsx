/**
 * Photoshop layer comp cleanup script
 *
 * This script will run through all the layer comps, find layers that are hidden in every comp
 * as well as any groups that are empty and delete them. Save before doing this just in case ;)
 *
 * @author Glen Cheney (http://glencheney)
 * @version 1.1
 * @date 7.10.12
 */


// Enable double clicking from the 
// Macintosh Finder or the Windows Explorer
#target photoshop

// Make Photoshop the frontmost application
app.bringToFront();

var doc = app.activeDocument;

"use strict";

var Cleanup = function() {
    this.totals = {};
    this.results = {
        layersRemoved: 0,
        groupsRemoved: 0
    }

    // Do it!
    this.run();
};

Cleanup.prototype.run = function() {
    // Confirm running the script
    if (!confirm("Are you sure you want to delete unused layers and groups in layer comps?")) {
        return;
    }

    // Index layers and groups
    this.totals = this.calculateTotals();

    // Delete unused layers
    this.findObsoleteLayers();

    // Delete unused groups
    this.deleteEmptyGroups();

    // Display a summary
    this.summary();
};

// Counts the total layers in the document
// Creates an array of groups
Cleanup.prototype.calculateTotals = function() {
    var layerCount = 0,
        groups = [],
        layers = [],
        loop = function(group) {
            var i = 0,
                j = 0;
            if (!group) {
                group = doc;
            }

            // Show some progress!?
            progress.updateText('Current group: ' + group.name);

            // If this group has groups, run this function again
            if (group.layerSets.length > 0) {
                for (; i < group.layerSets.length; i++) {
                    loop(group.layerSets[i]);
                }
            }

            // Add the art layers to our layers array
            for (; j < group.artLayers.length; j++ ) {
                layers.push(group.artLayers[j]);
            }

            groups.push(group);
            layerCount += group.artLayers.length;
        },
        progress = new Progress({
            title: 'This may take several minutes...',
            message: 'Retrieving layers and groups'
        });


    loop();
    progress.close();

    return {
        layers: layers,
        numLayers: layerCount,
        groups: groups,
        numGroups: groups.length
    };
};

// Loops through the document and removes empty groups
Cleanup.prototype.deleteEmptyGroups = function() {
    var groups = this.totals.groups,
        group,
        i = 0,
        progress = new Progress({
            title: "Please wait... (" + groups.length + " groups)",
            message: 'Deleting empty groups',
            min: 0,
            max: groups.length
        });

    // Loop through the most nested groups first
    // If the group has no layers and no groups within it, delete it
    for (; i < groups.length; i++) {
        group = groups[i];
        if (   group !== doc
            && group.artLayers.length === 0
            && group.layerSets.length === 0
            && !group.allLocked
            && group.linkedLayers.length === 0)
        {
            group.remove();
            this.results.groupsRemoved++;
        }
        progress.updateProgress();
    }

    // Close progress dialog
    progress.close();
};


// Loops through all layer compositions removing visible layers from our layers array and deleting what's left
Cleanup.prototype.findObsoleteLayers = function() {
    var comps = doc.layerComps,
        layer,
        n,
        m,
        progress = new Progress({
            title: "Please wait... (" + this.totals.numLayers + " layers)",
            message: 'Determining unused layers...',
            min: 0,
            max: comps.length * this.totals.numLayers
        });

    // Loop through each layer comp
    for (n = 0; n < comps.length; n++) {
        comps[n].apply();

        // Loop through each layer in the layer comp.
        for (m = this.totals.layers.length - 1; m > -1; m--) {
            layer = this.totals.layers[m];

            // If it's visible, locked, or linked, remove it from the list of possible layers to delete
            if (   layer.visible
                || layer.allLocked
                || layer.pixelsLocked
                || layer.positionLocked
                || layer.transparentPixelsLocked
                || layer.linkedLayers.length !== 0)
            {
                this.totals.layers.splice(m, 1);
            }
            // Update progress
            progress.updateProgress();
        }
    }
    progress.close();

    // Show new progress for deleting layers
    progress = new Progress({
        title: 'Please wait... (' + this.totals.layers.length + ' layers to delete)',
        message: 'Removing unused layers...',
        min: 0,
        max: this.totals.layers.length
    });

    // Save the number of layers we're deleting
    this.results.layersRemoved = this.totals.layers.length;

    while (this.totals.layers.length) {
        // Update progress
        progress.updateProgress();

        // Pop it off the array and delete it from the psd
        this.totals.layers.pop().remove();
    }

    // Close progress window
    progress.close();
};

Cleanup.prototype.summary = function() {
    alert('Summary:'
        + '\nTotal layers: ' + this.totals.numLayers
        + '\nLayers deleted: ' + this.results.layersRemoved
        + '\nTotal groups: ' + this.totals.numGroups
        + '\nEmpty groups deleted: ' + this.results.groupsRemoved);
};

// Adobe dialog window
var Progress = function(opts) {
    this.title = opts.title || '';
    this.message = opts.message || '';
    this.min = opts.min;
    this.max = opts.max;
    this.win = new Window('palette', this.title); 

    // Add the progress bar
    if (this.max) {
        this.win.bar = this.win.add('progressbar', undefined, this.min, this.max); 
        this.win.bar.preferredSize = [300, 20];
    }

    // Add a text field
    this.win.stProgress = this.win.add('statictext');
    this.win.stProgress.preferredSize.width = 230;
    this.updateText(this.message);

    this.win.center(this.win.parent);
    this.win.show();
    this.win.isDone = false;
};

// Updates the progess bar in the dialog
Progress.prototype.updateProgress = function(val) {
    var win = this.win;
    if (win.isDone) { 
        return; 
    }
    if (win.bar.value + val <= this.max && val !== undefined) {
        win.bar.value = val;
    } else {
        win.bar.value++;
    }
    if (win.recenter) {
        win.center(win.parentWin);
    }
    win.update();
};

// Updates the text in the dialog
Progress.prototype.updateText = function(text) {
    this.win.stProgress.text = text;
};

// Closes the dialog
Progress.prototype.close = function() {
    this.win.close();
};


// Create only one history state for the entire script
doc.suspendHistory('Cleanup Layer Comps', 'main();');


// Do it!
function main() {
    var cleanup = new Cleanup();
}